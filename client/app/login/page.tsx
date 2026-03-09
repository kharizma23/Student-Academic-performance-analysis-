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

            <div className="relative w-full max-w-lg z-10">
                <AnimatePresence mode="wait">
                    {/* ── STEP 1: Credentials ── */}
                    {!show2FA && (
                        <motion.div key="creds" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="glass-card p-10 lg:p-14">
                            <Link href="/" className="mb-12 block group">
                                <div className="h-20 w-20 mx-auto bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-500">
                                    <ShieldCheck className="h-10 w-10 text-white" />
                                </div>
                            </Link>
                            <div className="text-center mb-12">
                                <h1 className="text-4xl font-extrabold text-white tracking-tight mb-3">Authorize Access</h1>
                                <div className="text-indigo-300/60 text-xs font-semibold uppercase tracking-[0.3em] flex items-center justify-center gap-2">
                                    <div className="h-px w-8 bg-indigo-500/20" />{role} Environment Node<div className="h-px w-8 bg-indigo-500/20" />
                                </div>
                            </div>
                            <form onSubmit={handleLogin} className="space-y-8">
                                {error && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex items-center gap-4 text-rose-200 font-medium text-xs">
                                        <Lock className="h-5 w-5 shrink-0 text-rose-500" />{error}
                                    </motion.div>
                                )}
                                <div className="space-y-4">
                                    <label className="text-[11px] font-semibold text-indigo-300/50 uppercase tracking-widest ml-1 flex items-center gap-2"><Mail className="h-3 w-3" /> Identity Endpoint</label>
                                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="researcher@intel.ac.edu" className="input-executive w-full h-14 pl-5 text-white" required />
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between px-1">
                                        <label className="text-[11px] font-semibold text-indigo-300/50 uppercase tracking-widest flex items-center gap-2"><Lock className="h-3 w-3" /> Secure Pin-Key</label>
                                        <Link href="#" className="text-[10px] font-semibold text-indigo-400 hover:text-indigo-300 uppercase tracking-widest">Forgot?</Link>
                                    </div>
                                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="input-executive w-full h-14 pl-5 text-white" required />
                                </div>
                                <Button type="submit" disabled={loading} className="premium-button w-full h-14 mt-10 flex items-center justify-center gap-3 text-sm tracking-widest uppercase group">
                                    {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <><span>Authorize Session</span><ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" /></>}
                                </Button>
                            </form>
                        </motion.div>
                    )}

                    {/* ── STEP 2A: Choose Method ── */}
                    {show2FA && !chosenMethod && (
                        <motion.div key="chooser" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="glass-card p-8 space-y-6">
                            <div className="text-center space-y-2">
                                <div className="h-14 w-14 mx-auto bg-indigo-600/20 border border-indigo-500/30 rounded-2xl flex items-center justify-center">
                                    <ShieldCheck className="h-7 w-7 text-indigo-400" />
                                </div>
                                <h2 className="text-2xl font-extrabold text-white">Admin 2FA Verification</h2>
                                <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Step 2 of 2 — Choose method</p>
                            </div>

                            <div className="grid gap-4">
                                {[
                                    { m: "voice" as Method, icon: Mic, color: "indigo", label: "Voice Command", desc: 'Say "Open Admin Dashboard"' },
                                    { m: "thumbsup" as Method, icon: ThumbsUp, color: "purple", label: "Thumbs Up Gesture", desc: "Show 👍 to your camera" },
                                    { m: "eyes" as Method, icon: Eye, color: "cyan", label: "Eye Blink × 3", desc: "Blink 3 times deliberately" },
                                ].map(({ m, icon: Icon, color, label, desc }) => (
                                    <button
                                        key={m}
                                        onClick={() => launchMethod(m)}
                                        className={`w-full flex items-center gap-5 p-5 rounded-2xl border text-left transition-all group
                                            bg-${color}-500/5 border-${color}-500/20 hover:bg-${color}-500/15 hover:border-${color}-500/40`}
                                    >
                                        <div className={`h-12 w-12 rounded-xl bg-${color}-500/20 border border-${color}-500/30 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                                            <Icon className={`h-6 w-6 text-${color}-400`} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white">{label}</p>
                                            <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
                                        </div>
                                        <ArrowRight className="ml-auto h-4 w-4 text-slate-600 group-hover:text-white transition-colors" />
                                    </button>
                                ))}
                            </div>

                            <Button onClick={cancel2FA} variant="outline" className="w-full border-white/10 text-slate-400 hover:bg-white/5">
                                Cancel Login
                            </Button>
                        </motion.div>
                    )}

                    {/* ── STEP 2B: Active Verification ── */}
                    {show2FA && chosenMethod && (
                        <motion.div key="verifying" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="glass-card p-8 space-y-5">
                            {/* Back + header */}
                            <div className="flex items-center gap-3">
                                <button onClick={goBackToChooser} className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
                                    <ChevronLeft className="h-5 w-5 text-slate-400" />
                                </button>
                                <div>
                                    <h2 className="text-lg font-extrabold text-white">
                                        {chosenMethod === "voice" && "Voice Verification"}
                                        {chosenMethod === "thumbsup" && "Thumbs Up Verification"}
                                        {chosenMethod === "eyes" && "Eye Blink Verification"}
                                    </h2>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Admin 2FA — Step 2 of 2</p>
                                </div>
                            </div>

                            {/* Instruction banner */}
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
                                {chosenMethod === "voice" && <><Volume2 className="h-8 w-8 text-indigo-400 shrink-0" /><div><p className="text-sm font-bold text-white">Say clearly:</p><p className="text-base font-black text-indigo-300">"Open Admin Dashboard"</p></div></>}
                                {chosenMethod === "thumbsup" && <><ThumbsUp className="h-8 w-8 text-purple-400 shrink-0" /><div><p className="text-sm font-bold text-white">Show Thumbs Up 👍</p><p className="text-xs text-slate-400 mt-0.5">Hold it steady in front of the camera</p></div></>}
                                {chosenMethod === "eyes" && <><Eye className="h-8 w-8 text-cyan-400 shrink-0" /><div><p className="text-sm font-bold text-white">Blink 3 Times 👁️</p><p className="text-xs text-slate-400 mt-0.5">Deliberate, slow blinks work best</p></div></>}
                            </div>

                            {/* Camera feed */}
                            {needsCamera && (
                                <div className="relative rounded-2xl overflow-hidden bg-black border border-white/10 aspect-video">
                                    <video ref={videoRef} className="w-full h-full object-cover scale-x-[-1]" muted playsInline />
                                    {status === "loading" && (
                                        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-3">
                                            <Loader2 className="h-10 w-10 text-indigo-400 animate-spin" />
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Loading AI Detector...</p>
                                        </div>
                                    )}
                                    {status === "verified" && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                            className="absolute inset-0 bg-emerald-500/20 flex flex-col items-center justify-center gap-3">
                                            <CheckCircle2 className="h-14 w-14 text-emerald-400" />
                                            <p className="text-white font-black text-lg">Verified! Logging in...</p>
                                        </motion.div>
                                    )}
                                    {status === "scanning" && (
                                        <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 rounded-full px-3 py-1">
                                            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                                            <span className="text-white text-[10px] font-bold uppercase">LIVE</span>
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
                            <div className={`min-h-[48px] p-3 rounded-xl border text-sm font-medium text-center transition-all ${status === "verified" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" :
                                    status === "error" ? "bg-rose-500/10 border-rose-500/20 text-rose-300" :
                                        "bg-white/5 border-white/10 text-slate-300"
                                }`}>
                                {status === "verified" && "✅ Verified! Entering admin portal..."}
                                {status === "error" && (statusMsg || "An error occurred.")}
                                {status === "scanning" && (statusMsg
                                    ? <span className="italic">{statusMsg}</span>
                                    : <span className="text-slate-500 animate-pulse">Scanning... please wait</span>)}
                                {status === "loading" && <span className="text-slate-500">Initializing detector...</span>}
                                {status === "idle" && <span className="text-slate-500">Starting up...</span>}
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
                            <div className="flex gap-3">
                                <Button onClick={goBackToChooser} variant="outline" className="flex-1 border-white/10 text-slate-400 hover:bg-white/5 hover:text-white">
                                    ← Change Method
                                </Button>
                                {status === "error" && (
                                    <Button onClick={() => launchMethod(chosenMethod)} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold">
                                        Retry
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
