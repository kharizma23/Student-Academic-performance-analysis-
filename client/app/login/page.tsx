"use client"

import { Suspense, useState, useRef, useEffect, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Lock, Mail, Loader2, ArrowRight, ShieldCheck, Mic, MicOff, CheckCircle2, Volume2, ThumbsUp, Eye, Camera, ChevronLeft } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

// ──────────────────────────────────────────────
// Thumbs-up detection using MediaPipe Hands
// ──────────────────────────────────────────────
function isThumbsUp(landmarks: number[][]): boolean {
    if (!landmarks || landmarks.length < 21) return false
    const [thumbTip, indexTip, middleTip, ringTip, pinkyTip] =
        [landmarks[4], landmarks[8], landmarks[12], landmarks[16], landmarks[20]]
    const [indexBase, middleBase, ringBase, pinkyBase, wrist] =
        [landmarks[5], landmarks[9], landmarks[13], landmarks[17], landmarks[0]]
    const thumbUp = thumbTip[1] < wrist[1] - 30
    return thumbUp &&
        indexTip[1] > indexBase[1] &&
        middleTip[1] > middleBase[1] &&
        ringTip[1] > ringBase[1] &&
        pinkyTip[1] > pinkyBase[1]
}

// ──────────────────────────────────────────────
// EAR (Eye Aspect Ratio) for blink detection
// ──────────────────────────────────────────────
function dist(a: number[], b: number[]) {
    return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2))
}
function eyeAR(pts: number[][]): number {
    // pts: [p1(outer), p2(top-outer), p3(top-inner), p4(inner), p5(bot-inner), p6(bot-outer)]
    return (dist(pts[1], pts[5]) + dist(pts[2], pts[4])) / (2.0 * dist(pts[0], pts[3]))
}

// FaceMesh left eye indices (from MediaPipe)
const LEFT_EYE = [362, 385, 387, 263, 373, 380]
const RIGHT_EYE = [33, 160, 158, 133, 153, 144]
const EAR_CLOSE_THRESH = 0.20
const BLINKS_NEEDED = 3

// Dynamically load a script
function loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) { resolve(); return }
        const s = document.createElement("script")
        s.src = src
        s.crossOrigin = "anonymous"
        s.onload = () => resolve()
        s.onerror = () => reject(new Error(`Failed to load ${src}`))
        document.head.appendChild(s)
    })
}

type Method = "voice" | "thumbsup" | "eyes"

function LoginContent() {
    const searchParams = useSearchParams()
    const role = searchParams.get("role") || "student"
    const router = useRouter()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // 2FA
    const [show2FA, setShow2FA] = useState(false)
    const [chosenMethod, setChosenMethod] = useState<Method | null>(null)
    const [pendingToken, setPendingToken] = useState<string | null>(null)

    // shared status
    const [status, setStatus] = useState<"idle" | "loading" | "scanning" | "verified" | "error">("idle")
    const [statusMsg, setStatusMsg] = useState("")
    const [progress, setProgress] = useState(0)

    // Voice refs
    const recognitionRef = useRef<any>(null)

    // Camera refs
    const videoRef = useRef<HTMLVideoElement>(null)
    const streamRef = useRef<MediaStream | null>(null)
    const mpRef = useRef<any>(null)       // MediaPipe model instance
    const mpCamRef = useRef<any>(null)       // MediaPipe Camera instance
    const countRef = useRef(0)               // thumbs detections
    const blinkRef = useRef(0)               // blink count
    const eyeOpen = useRef(true)            // blink state machine

    const getApiUrl = (p: string) => `http://127.0.0.1:8000${p}`

    // ────────────────────────────────────────
    // Step 1 – Credentials
    // ────────────────────────────────────────
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true); setError(null)

        try {
            const res = await fetch(getApiUrl('/auth/token'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ username: email, password })
            })
            const data = await res.json()
            if (res.ok) {
                const meRes = await fetch(getApiUrl('/users/me'), { headers: { Authorization: `Bearer ${data.access_token}` } })
                const meData = meRes.ok ? await meRes.json() : { role }

                if (meData.role === 'admin') {
                    setPendingToken(data.access_token)
                    setLoading(false)
                    setShow2FA(true)
                    return
                }
                localStorage.setItem('token', data.access_token)
                localStorage.setItem('role', meData.role)
                router.push(`/${meData.role}`)
            } else {
                setError(data.detail || "Authentication failed.")
            }
        } catch {
            setError("Cannot connect to server.")
        } finally {
            setLoading(false)
        }
    }

    // ────────────────────────────────────────
    // Finalize login after verification
    // ────────────────────────────────────────
    const completeLogin = useCallback(() => {
        stopCamera(); stopVoice()
        localStorage.setItem('token', pendingToken!)
        localStorage.setItem('role', 'admin')
        router.push('/admin')
    }, [pendingToken, router])

    // ────────────────────────────────────────
    // Stop helpers
    // ────────────────────────────────────────
    const stopCamera = () => {
        if (mpCamRef.current) { try { mpCamRef.current.stop() } catch (_) { }; mpCamRef.current = null }
        if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null }
    }
    const stopVoice = () => {
        if (recognitionRef.current) { try { recognitionRef.current.stop() } catch (_) { }; recognitionRef.current = null }
    }
    useEffect(() => () => { stopCamera(); stopVoice() }, [])

    // ────────────────────────────────────────
    // VOICE
    // ────────────────────────────────────────
    const startVoice = useCallback(() => {
        const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        if (!SR) { setStatus("error"); setStatusMsg("Voice not supported. Use Chrome."); return }

        stopVoice()
        const r = new SR()
        r.lang = 'en-US'; r.continuous = true; r.interimResults = true
        recognitionRef.current = r

        r.onstart = () => { setStatus("scanning"); setStatusMsg("") }
        r.onresult = (ev: any) => {
            let heard = ""
            for (let i = ev.resultIndex; i < ev.results.length; i++) heard += ev.results[i][0].transcript
            setStatusMsg(`Heard: "${heard}"`)
            const norm = heard.toLowerCase().replace(/[^\w\s]/g, "").trim()
            if (norm.includes("open admin") || norm.includes("admin dashboard")) {
                r.stop(); recognitionRef.current = null
                setStatus("verified"); setStatusMsg("Voice verified!")
                setTimeout(completeLogin, 800)
            }
        }
        r.onerror = (ev: any) => {
            if (ev.error === 'no-speech') { try { r.start() } catch (_) { } }
            else { setStatus("error"); setStatusMsg(`Mic error: ${ev.error}`) }
        }
        r.onend = () => { if (recognitionRef.current) try { r.start() } catch (_) { } }
        try { r.start() } catch { setStatus("error"); setStatusMsg("Cannot access microphone.") }
    }, [completeLogin])

    // ────────────────────────────────────────
    // CAMERA COMMON – start webcam
    // ────────────────────────────────────────
    const startWebcam = async (): Promise<boolean> => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } })
            streamRef.current = stream
            if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play() }
            return true
        } catch (err: any) {
            setStatus("error")
            setStatusMsg(err.name === "NotAllowedError" ? "Camera access denied. Allow it in browser settings." : "Cannot access camera.")
            return false
        }
    }

    // ────────────────────────────────────────
    // THUMBS UP
    // ────────────────────────────────────────
    const startThumbsUp = useCallback(async () => {
        setStatus("loading"); setStatusMsg("Loading hand detector..."); countRef.current = 0; setProgress(0)
        if (!await startWebcam()) return

        try {
            await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js")
            await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js")
        } catch { setStatus("error"); setStatusMsg("Failed to load detector. Check internet connection."); return }

        await new Promise(r => setTimeout(r, 500))   // let scripts settle

        try {
            const Hands = (window as any).Hands
            const Camera = (window as any).Camera
            if (!Hands || !Camera) { setStatus("error"); setStatusMsg("Hand detector not ready. Retry."); return }

            const hands = new Hands({ locateFile: (f: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}` })
            hands.setOptions({ maxNumHands: 1, modelComplexity: 0, minDetectionConfidence: 0.7, minTrackingConfidence: 0.5 })
            mpRef.current = hands
            const NEEDED = 18

            hands.onResults((res: any) => {
                if (!res.multiHandLandmarks?.length) {
                    countRef.current = Math.max(0, countRef.current - 1)
                } else {
                    const pts = res.multiHandLandmarks[0].map((lm: any) => [lm.x * 640, lm.y * 480, lm.z])
                    if (isThumbsUp(pts)) {
                        countRef.current++
                        if (countRef.current >= NEEDED) {
                            setStatus("verified"); setStatusMsg("Thumbs up verified!")
                            mpCamRef.current?.stop(); recognitionRef.current = null
                            setTimeout(completeLogin, 700)
                        }
                    } else {
                        countRef.current = Math.max(0, countRef.current - 1)
                    }
                }
                setProgress(Math.min(100, Math.round((countRef.current / NEEDED) * 100)))
            })

            const cam = new Camera(videoRef.current, {
                onFrame: async () => { if (videoRef.current && mpRef.current) await mpRef.current.send({ image: videoRef.current }) },
                width: 640, height: 480
            })
            mpCamRef.current = cam
            cam.start()
            setStatus("scanning"); setStatusMsg("")
        } catch (err: any) {
            setStatus("error"); setStatusMsg("Detector error: " + err.message)
        }
    }, [completeLogin])

    // ────────────────────────────────────────
    // EYES / BLINK x3
    // ────────────────────────────────────────
    const startEyes = useCallback(async () => {
        setStatus("loading"); setStatusMsg("Loading face detector..."); blinkRef.current = 0; setProgress(0); eyeOpen.current = true
        if (!await startWebcam()) return

        try {
            await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js")
            await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js")
        } catch { setStatus("error"); setStatusMsg("Failed to load detector. Check internet."); return }

        await new Promise(r => setTimeout(r, 500))

        try {
            const FaceMesh = (window as any).FaceMesh
            const Camera = (window as any).Camera
            if (!FaceMesh || !Camera) { setStatus("error"); setStatusMsg("Face detector not ready. Retry."); return }

            const mesh = new FaceMesh({ locateFile: (f: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${f}` })
            mesh.setOptions({ maxNumFaces: 1, refineLandmarks: true, minDetectionConfidence: 0.7, minTrackingConfidence: 0.5 })
            mpRef.current = mesh

            mesh.onResults((res: any) => {
                if (!res.multiFaceLandmarks?.length) return
                const lms = res.multiFaceLandmarks[0]
                const W = 640, H = 480
                const getP = (idx: number) => [lms[idx].x * W, lms[idx].y * H]

                const leftEAR = eyeAR(LEFT_EYE.map(getP))
                const rightEAR = eyeAR(RIGHT_EYE.map(getP))
                const ear = (leftEAR + rightEAR) / 2

                if (ear < EAR_CLOSE_THRESH && eyeOpen.current) {
                    eyeOpen.current = false   // eye just closed
                } else if (ear >= EAR_CLOSE_THRESH && !eyeOpen.current) {
                    eyeOpen.current = true    // eye reopened = 1 blink
                    blinkRef.current++
                    setProgress(Math.min(100, Math.round((blinkRef.current / BLINKS_NEEDED) * 100)))
                    setStatusMsg(`Blinks detected: ${blinkRef.current} / ${BLINKS_NEEDED}`)

                    if (blinkRef.current >= BLINKS_NEEDED) {
                        setStatus("verified"); setStatusMsg("Eye pattern verified!")
                        mpCamRef.current?.stop(); mpRef.current = null
                        setTimeout(completeLogin, 700)
                    }
                }
            })

            const cam = new Camera(videoRef.current, {
                onFrame: async () => { if (videoRef.current && mpRef.current) await mpRef.current.send({ image: videoRef.current }) },
                width: 640, height: 480
            })
            mpCamRef.current = cam
            cam.start()
            setStatus("scanning"); setStatusMsg(`Blinks detected: 0 / ${BLINKS_NEEDED}`)
        } catch (err: any) {
            setStatus("error"); setStatusMsg("Detector error: " + err.message)
        }
    }, [completeLogin])

    // Launch chosen method
    const launchMethod = useCallback((m: Method) => {
        setChosenMethod(m); setStatus("idle"); setStatusMsg(""); setProgress(0)
        countRef.current = 0; blinkRef.current = 0; eyeOpen.current = true
        stopCamera(); stopVoice()
        setTimeout(() => {
            if (m === "voice") startVoice()
            if (m === "thumbsup") startThumbsUp()
            if (m === "eyes") startEyes()
        }, 100)
    }, [startVoice, startThumbsUp, startEyes])

    const goBackToChooser = () => {
        stopCamera(); stopVoice()
        setChosenMethod(null); setStatus("idle"); setStatusMsg(""); setProgress(0)
    }

    const cancel2FA = () => {
        stopCamera(); stopVoice()
        setShow2FA(false); setChosenMethod(null); setPendingToken(null)
        setStatus("idle"); setStatusMsg(""); setProgress(0)
    }

    const needsCamera = chosenMethod === "thumbsup" || chosenMethod === "eyes"

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#030712] p-4 font-sans overflow-hidden relative">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative w-full max-w-2xl z-10">
                <AnimatePresence mode="wait">
                    {/* ── STEP 1: Credentials ── */}
                    {!show2FA && (
                        <motion.div key="creds" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} className="glass-card p-12 lg:p-20">
                            <Link href="/" className="mb-14 block group">
                                <div className="h-28 w-28 mx-auto bg-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-500/40 group-hover:scale-110 transition-transform duration-500 border-4 border-indigo-400/30">
                                    <ShieldCheck className="h-14 w-14 text-white" />
                                </div>
                            </Link>
                            <div className="text-center mb-16">
                                <h1 className="text-5xl lg:text-6xl font-black text-white tracking-tighter mb-4 uppercase">Authorize Access</h1>
                                <div className="text-indigo-300 text-sm font-black uppercase tracking-[0.5em] flex items-center justify-center gap-4">
                                    <div className="h-px w-12 bg-indigo-500/20" />{role} Environment<div className="h-px w-12 bg-indigo-500/20" />
                                </div>
                            </div>
                            <form onSubmit={handleLogin} className="space-y-10">
                                {error && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        className="bg-rose-500/10 border-2 border-rose-500/30 p-6 rounded-2xl flex items-center gap-6 text-rose-200 font-bold text-sm">
                                        <Lock className="h-6 w-6 shrink-0 text-rose-500" />{error}
                                    </motion.div>
                                )}
                                <div className="space-y-5">
                                    <label className="text-sm font-black text-indigo-300 uppercase tracking-widest ml-2 flex items-center gap-3"><Mail className="h-4 w-4" /> Identity Endpoint</label>
                                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="researcher@intel.ac.edu" className="input-executive w-full h-20 pl-8 text-xl text-white font-bold" required />
                                </div>
                                <div className="space-y-5">
                                    <div className="flex items-center justify-between px-2">
                                        <label className="text-sm font-black text-indigo-300 uppercase tracking-widest flex items-center gap-3"><Lock className="h-4 w-4" /> Secure Pin-Key</label>
                                        <Link href="#" className="text-xs font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest">Forgot?</Link>
                                    </div>
                                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="input-executive w-full h-20 pl-8 text-xl text-white font-bold" required />
                                </div>
                                <Button type="submit" disabled={loading} className="premium-button w-full h-20 mt-12 flex items-center justify-center gap-4 text-lg font-black tracking-[0.2em] uppercase group">
                                    {loading ? <Loader2 className="h-8 w-8 animate-spin" /> : <><span>Authorize Session</span><ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" /></>}
                                </Button>
                            </form>
                        </motion.div>
                    )}

                    {/* ── STEP 2A: Choose Method ── */}
                    {show2FA && !chosenMethod && (
                        <motion.div key="chooser" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="glass-card p-12 space-y-10">
                            <div className="text-center space-y-4">
                                <div className="h-20 w-20 mx-auto bg-indigo-600/20 border-2 border-indigo-500/30 rounded-3xl flex items-center justify-center">
                                    <ShieldCheck className="h-10 w-10 text-indigo-400" />
                                </div>
                                <h2 className="text-3xl font-black text-white uppercase tracking-tight">2FA Verification</h2>
                                <p className="text-sm text-slate-400 uppercase tracking-[0.3em] font-black">Step 2 of 2 — Identity Confirmation</p>
                            </div>

                            <div className="grid gap-6">
                                {[
                                    { m: "voice" as Method, icon: Mic, color: "indigo", label: "Voice Command", desc: 'Say "Open Admin Dashboard"' },
                                    { m: "thumbsup" as Method, icon: ThumbsUp, color: "purple", label: "Thumbs Up Gesture", desc: "Show 👍 to your camera" },
                                    { m: "eyes" as Method, icon: Eye, color: "cyan", label: "Eye Blink × 3", desc: "Blink 3 times deliberately" },
                                ].map(({ m, icon: Icon, color, label, desc }) => (
                                    <button
                                        key={m}
                                        onClick={() => launchMethod(m)}
                                        className={`w-full flex items-center gap-8 p-8 rounded-3xl border-2 text-left transition-all group
                                            bg-${color}-500/5 border-${color}-500/10 hover:bg-${color}-500/15 hover:border-${color}-500/40`}
                                    >
                                        <div className={`h-16 w-16 rounded-2xl bg-${color}-500/20 border-2 border-${color}-500/30 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                                            <Icon className={`h-8 w-8 text-${color}-400`} />
                                        </div>
                                        <div>
                                            <p className="text-xl font-black text-white uppercase tracking-tight">{label}</p>
                                            <p className="text-sm text-slate-400 mt-1 font-bold">{desc}</p>
                                        </div>
                                        <ArrowRight className="ml-auto h-6 w-6 text-slate-600 group-hover:text-white transition-all transform group-hover:translate-x-2" />
                                    </button>
                                ))}
                            </div>

                            <Button onClick={cancel2FA} variant="outline" className="w-full h-16 border-white/10 text-slate-400 hover:bg-white/5 text-sm font-black uppercase tracking-widest">
                                Cancel Authorization
                            </Button>
                        </motion.div>
                    )}

                    {/* ── STEP 2B: Active Verification ── */}
                    {show2FA && chosenMethod && (
                        <motion.div key="verifying" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="glass-card p-12 space-y-8">
                            {/* Back + header */}
                            <div className="flex items-center gap-6">
                                <button onClick={goBackToChooser} className="h-14 w-14 rounded-2xl bg-white/5 border-2 border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
                                    <ChevronLeft className="h-7 w-7 text-slate-400" />
                                </button>
                                <div>
                                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                                        {chosenMethod === "voice" && "Voice Auth"}
                                        {chosenMethod === "thumbsup" && "Gesture Auth"}
                                        {chosenMethod === "eyes" && "Blink Auth"}
                                    </h2>
                                    <p className="text-xs text-slate-500 uppercase tracking-[0.4em] font-black">Active Scanning Node</p>
                                </div>
                            </div>

                            {/* Instruction banner */}
                            <div className="bg-white/5 border-2 border-white/10 rounded-2xl p-6 flex items-center gap-6">
                                {chosenMethod === "voice" && <><Volume2 className="h-10 w-10 text-indigo-400 shrink-0" /><div><p className="text-base font-black text-white">Repeat the command:</p><p className="text-2xl font-black text-indigo-300 tracking-tight">"Open Admin Dashboard"</p></div></>}
                                {chosenMethod === "thumbsup" && <><ThumbsUp className="h-10 w-10 text-purple-400 shrink-0" /><div><p className="text-base font-black text-white text-lg">Signal Thumbs Up 👍</p><p className="text-sm text-slate-400 mt-1 font-bold tracking-wide">Hold it steady for the AI scanner</p></div></>}
                                {chosenMethod === "eyes" && <><Eye className="h-10 w-10 text-cyan-400 shrink-0" /><div><p className="text-base font-black text-white text-lg">Triple Blink 👁️</p><p className="text-sm text-slate-400 mt-1 font-bold tracking-wide">Perform 3 slow, deliberate blinks</p></div></>}
                            </div>

                            {/* Camera feed */}
                            {needsCamera && (
                                <div className="relative rounded-3xl overflow-hidden bg-black border-4 border-white/10 aspect-video shadow-2xl">
                                    <video ref={videoRef} className="w-full h-full object-cover scale-x-[-1]" muted playsInline />
                                    {status === "loading" && (
                                        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-6">
                                            <Loader2 className="h-16 w-16 text-indigo-400 animate-spin" />
                                            <p className="text-sm text-slate-400 font-bold uppercase tracking-[0.3em]">Initializing AI Engine...</p>
                                        </div>
                                    )}
                                    {status === "verified" && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                            className="absolute inset-0 bg-emerald-500/20 flex flex-col items-center justify-center gap-6 backdrop-blur-sm">
                                            <CheckCircle2 className="h-24 w-24 text-emerald-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.5)]" />
                                            <p className="text-white font-black text-4xl tracking-tighter uppercase">Verified</p>
                                        </motion.div>
                                    )}
                                    {status === "scanning" && (
                                        <div className="absolute top-6 left-6 flex items-center gap-3 bg-black/60 backdrop-blur-md rounded-full px-5 py-2 border border-white/10">
                                            <span className="h-3 w-3 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                                            <span className="text-white text-xs font-black uppercase tracking-widest">Live Bio-Scan</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Voice animation */}
                            {chosenMethod === "voice" && (
                                <div className="flex flex-col items-center gap-4 py-4">
                                    {status === "scanning" && (
                                        <div className="relative flex items-center justify-center mb-2">
                                            <div className="absolute h-24 w-24 rounded-full border-2 border-indigo-500/30 animate-ping" />
                                            <div className="absolute h-16 w-16 rounded-full border-2 border-indigo-500/50 animate-ping" style={{ animationDelay: "0.2s" }} />
                                            <div className="h-12 w-12 rounded-full bg-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.5)]">
                                                <Mic className="h-6 w-6 text-white" />
                                            </div>
                                        </div>
                                    )}
                                    {status === "verified" && <CheckCircle2 className="h-14 w-14 text-emerald-400" />}
                                </div>
                            )}

                            {/* Transcript / status display */}
                            <div className={`min-h-[70px] p-6 rounded-2xl border-2 text-lg font-bold text-center transition-all ${status === "verified" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" :
                                status === "error" ? "bg-rose-500/10 border-rose-500/20 text-rose-300" :
                                    "bg-white/5 border-white/10 text-slate-200"
                                }`}>
                                {status === "verified" && "AUTHENTICATED: INITIALIZING CORE SYSTEMS"}
                                {status === "error" && (statusMsg || "CRITICAL SYSTEM ERROR")}
                                {status === "scanning" && (statusMsg
                                    ? <span className="italic uppercase tracking-wide">{statusMsg}</span>
                                    : <span className="text-slate-500 animate-pulse uppercase tracking-[0.2em]">Acquiring Signal...</span>)}
                                {status === "loading" && <span className="text-slate-500 uppercase tracking-widest">Booting Neural Network...</span>}
                                {status === "idle" && <span className="text-slate-500 uppercase tracking-widest">Standby...</span>}
                            </div>

                            {/* Progress bar (camera methods) */}
                            {needsCamera && status === "scanning" && (
                                <div className="space-y-1">
                                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                        <span>{chosenMethod === "thumbsup" ? "Gesture Hold" : "Blink Progress"}</span>
                                        <span className="text-white">{progress}%</span>
                                    </div>
                                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                        <motion.div className={`h-full rounded-full ${chosenMethod === "thumbsup" ? "bg-gradient-to-r from-purple-600 to-purple-400" : "bg-gradient-to-r from-cyan-600 to-cyan-400"}`}
                                            animate={{ width: `${progress}%` }} transition={{ duration: 0.15 }} />
                                    </div>
                                </div>
                            )}

                            {/* Action buttons */}
                            <div className="flex gap-4">
                                <Button onClick={goBackToChooser} variant="outline" className="flex-1 h-14 border-white/10 text-slate-400 hover:bg-white/5 hover:text-white font-black uppercase tracking-widest text-xs">
                                    ← RESET METHOD
                                </Button>
                                {status === "error" && (
                                    <Button onClick={() => launchMethod(chosenMethod)} className="flex-1 h-14 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-xs">
                                        FORCE RETRY
                                    </Button>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="mt-10 flex flex-col items-center gap-4 text-[10px] font-bold text-indigo-300/20 uppercase tracking-[0.5em] pointer-events-none">
                    <span className="flex items-center gap-4"><div className="h-px w-12 bg-white/5" />Terminal Identity v4.0.2<div className="h-px w-12 bg-white/5" /></span>
                    <span>© 2026 Khariz Group Intel</span>
                </div>
            </div>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#030712] gap-8">
                <div className="h-16 w-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <div className="text-indigo-400 font-bold tracking-[0.4em] text-sm uppercase">Initializing...</div>
            </div>
        }>
            <LoginContent />
        </Suspense>
    )
}
