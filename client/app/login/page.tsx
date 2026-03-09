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

            <div className="relative w-full max-w-7xl z-10 px-8">
                <AnimatePresence mode="wait">
                    {/* ── STEP 1: Credentials ── */}
                    {!show2FA && (
                        <motion.div key="creds" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, y: -100 }} className="glass-card p-24 lg:p-40 shadow-[0_0_150px_rgba(79,70,229,0.2)] border-8 border-white/5">
                            <Link href="/" className="mb-24 block group">
                                <div className="h-56 w-56 mx-auto bg-indigo-600 rounded-[4rem] flex items-center justify-center shadow-4xl shadow-indigo-500/50 group-hover:scale-110 transition-all duration-1000 border-[12px] border-indigo-400/20">
                                    <ShieldCheck className="h-32 w-32 text-white" />
                                </div>
                            </Link>
                            <div className="text-center mb-24">
                                <h1 className="text-8xl lg:text-[12rem] font-black text-white tracking-tighter mb-8 uppercase leading-none drop-shadow-2xl">
                                    Access <span className="text-indigo-500">Node</span>
                                </h1>
                                <div className="text-indigo-300/30 text-2xl font-black uppercase tracking-[1.5em] flex items-center justify-center gap-12">
                                    <div className="h-px w-32 bg-indigo-500/20" />{role}<div className="h-px w-32 bg-indigo-500/20" />
                                </div>
                            </div>
                            <form onSubmit={handleLogin} className="space-y-16">
                                {error && (
                                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                        className="bg-rose-500/10 border-4 border-rose-500/30 p-12 rounded-[3rem] flex items-center gap-10 text-rose-200 font-black text-2xl uppercase tracking-tighter shadow-2xl shadow-rose-500/20">
                                        <Lock className="h-12 w-12 shrink-0 text-rose-500" />{error}
                                    </motion.div>
                                )}
                                <div className="space-y-8">
                                    <label className="text-2xl font-black text-indigo-300/50 uppercase tracking-[0.5em] ml-4 flex items-center gap-6"><Mail className="h-8 w-8" /> Identity Endpoint</label>
                                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="researcher@intel.ac.edu" className="bg-[#0c0e14] border-4 border-white/10 rounded-[2.5rem] w-full h-32 pl-12 text-4xl text-white font-black tracking-tighter focus:border-indigo-500/50 focus:ring-[20px] focus:ring-indigo-500/5 transition-all outline-none" required />
                                </div>
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between px-4">
                                        <label className="text-2xl font-black text-indigo-300/50 uppercase tracking-[0.5em] flex items-center gap-6"><Lock className="h-8 w-8" /> Secure Pin-Key</label>
                                        <Link href="#" className="text-lg font-black text-indigo-500 hover:text-indigo-400 uppercase tracking-widest">Credential Recovery?</Link>
                                    </div>
                                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="bg-[#0c0e14] border-4 border-white/10 rounded-[2.5rem] w-full h-32 pl-12 text-4xl text-white font-black tracking-tighter focus:border-indigo-500/50 focus:ring-[20px] focus:ring-indigo-500/5 transition-all outline-none" required />
                                </div>
                                <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-[3rem] w-full h-40 mt-24 flex items-center justify-center gap-10 text-4xl font-black tracking-[0.6em] uppercase group shadow-[0_0_80px_rgba(79,70,229,0.4)] transition-all duration-500">
                                    {loading ? <Loader2 className="h-16 w-16 animate-spin" /> : <><span>Sync Session</span><ArrowRight className="h-12 w-12 group-hover:translate-x-8 transition-transform duration-700" /></>}
                                </Button>
                            </form>
                        </motion.div>
                    )}

                    {/* ── STEP 2A: Choose Method ── */}
                    {show2FA && !chosenMethod && (
                        <motion.div key="chooser" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="glass-card p-24 lg:p-40 space-y-20 shadow-[0_0_150px_rgba(79,70,229,0.2)] border-8 border-white/5">
                            <div className="text-center space-y-10">
                                <div className="h-40 w-40 mx-auto bg-indigo-600/20 border-8 border-indigo-500/30 rounded-[3rem] flex items-center justify-center">
                                    <ShieldCheck className="h-24 w-24 text-indigo-400" />
                                </div>
                                <h2 className="text-7xl lg:text-[10rem] font-black text-white uppercase tracking-tighter leading-none">Security <span className="text-indigo-500 font-black">Node</span></h2>
                                <p className="text-3xl text-slate-400 uppercase tracking-[1em] font-black opacity-30">Identity Protocol 7.0</p>
                            </div>

                            <div className="grid gap-12">
                                {[
                                    { m: "voice" as Method, icon: Mic, color: "indigo", label: "Voice Logic", desc: 'Vocal Signature: "Open Admin Dashboard"' },
                                    { m: "thumbsup" as Method, icon: ThumbsUp, color: "purple", label: "Bio-Gesture", desc: "Thumbs-Up Physical Verification" },
                                    { m: "eyes" as Method, icon: Eye, color: "cyan", label: "Retinal Blink", desc: "Synchronized Triple-Blink Scan" },
                                ].map(({ m, icon: Icon, color, label, desc }) => (
                                    <button
                                        key={m}
                                        onClick={() => launchMethod(m)}
                                        className={`w-full flex items-center gap-16 p-16 rounded-[4rem] border-[10px] text-left transition-all duration-700 group
                                            bg-${color}-500/5 border-${color}-500/10 hover:bg-${color}-500/15 hover:border-${color}-500/50 hover:shadow-[0_0_100px_rgba(0,0,0,0.5)]`}
                                    >
                                        <div className={`h-40 w-40 rounded-[2.5rem] bg-${color}-500/20 border-8 border-${color}-500/30 flex items-center justify-center shrink-0 group-hover:scale-110 transition-all duration-1000`}>
                                            <Icon className={`h-20 w-20 text-${color}-400`} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-6xl font-black text-white uppercase tracking-tighter group-hover:text-white transition-colors">{label}</p>
                                            <p className="text-2xl text-slate-400 mt-4 font-black opacity-40 group-hover:opacity-80 transition-all">{desc}</p>
                                        </div>
                                        <ArrowRight className="h-20 w-20 text-slate-800 group-hover:text-white transition-all transform group-hover:translate-x-8" strokeWidth={3} />
                                    </button>
                                ))}
                            </div>

                            <Button onClick={cancel2FA} variant="outline" className="w-full h-40 border-8 border-white/5 text-slate-600 hover:bg-white/5 text-2xl font-black uppercase tracking-[1em] rounded-[3rem] transition-all duration-700">
                                Abort Protocol
                            </Button>
                        </motion.div>
                    )}

                    {/* ── STEP 2B: Active Verification ── */}
                    {show2FA && chosenMethod && (
                        <motion.div key="verifying" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="glass-card p-24 lg:p-40 space-y-16 shadow-[0_0_150px_rgba(79,70,229,0.2)] border-8 border-white/5">
                            {/* Back + header */}
                            <div className="flex items-center gap-16">
                                <button onClick={goBackToChooser} className="h-32 w-32 rounded-[2rem] bg-white/5 border-[8px] border-white/10 flex items-center justify-center hover:bg-white/10 transition-all duration-700">
                                    <ChevronLeft className="h-16 w-16 text-slate-400" strokeWidth={4} />
                                </button>
                                <div>
                                    <h2 className="text-7xl lg:text-9xl font-black text-white uppercase tracking-tighter drop-shadow-2xl">
                                        {chosenMethod === "voice" && "Voice-Sync"}
                                        {chosenMethod === "thumbsup" && "Bio-Scan"}
                                        {chosenMethod === "eyes" && "Neural-Blink"}
                                    </h2>
                                    <p className="text-2xl text-slate-600 uppercase tracking-[1em] font-black mt-4">Active Encryption Node</p>
                                </div>
                            </div>

                            {/* Instruction banner */}
                            <div className="bg-white/5 border-[10px] border-white/10 rounded-[4rem] p-16 flex items-center gap-16 shadow-inner">
                                {chosenMethod === "voice" && <><Volume2 className="h-32 w-32 text-indigo-400 shrink-0 drop-shadow-[0_0_20px_rgba(129,140,248,0.5)]" /><div><p className="text-3xl font-black text-white uppercase opacity-20 mb-4 tracking-widest">Vocal Command Trigger:</p><p className="text-6xl lg:text-8xl font-black text-indigo-300 tracking-tighter leading-none italic">"Open Admin Dashboard"</p></div></>}
                                {chosenMethod === "thumbsup" && <><ThumbsUp className="h-32 w-32 text-purple-400 shrink-0 drop-shadow-[0_0_20px_rgba(192,132,252,0.5)]" /><div><p className="text-3xl font-black text-white uppercase opacity-20 mb-4 tracking-widest">Bio-Gesture Requirement:</p><p className="text-6xl lg:text-8xl font-black text-white tracking-tighter leading-none italic">Show Thumbs Up 👍</p></div></>}
                                {chosenMethod === "eyes" && <><Eye className="h-32 w-32 text-cyan-400 shrink-0 drop-shadow-[0_0_20px_rgba(34,211,238,0.5)]" /><div><p className="text-3xl font-black text-white uppercase opacity-20 mb-4 tracking-widest">Neural Reflex Signal:</p><p className="text-6xl lg:text-8xl font-black text-white tracking-tighter leading-none italic">Triple deliberate Blink</p></div></>}
                            </div>

                            {/* Camera feed */}
                            {needsCamera && (
                                <div className="relative rounded-[5rem] overflow-hidden bg-black border-[16px] border-white/10 aspect-video shadow-[0_0_150px_rgba(0,0,0,0.8)] group group-hover:border-indigo-500/20 transition-all duration-1000">
                                    <video ref={videoRef} className="w-full h-full object-cover scale-x-[-1]" muted playsInline />
                                    {status === "loading" && (
                                        <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center gap-16 backdrop-blur-2xl">
                                            <Loader2 className="h-40 w-40 text-indigo-500 animate-spin" strokeWidth={4} />
                                            <p className="text-4xl text-slate-600 font-black uppercase tracking-[1em] animate-pulse">Syncing AI Core...</p>
                                        </div>
                                    )}
                                    {status === "verified" && (
                                        <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
                                            className="absolute inset-0 bg-emerald-500/40 flex flex-col items-center justify-center gap-16 backdrop-blur-xl">
                                            <CheckCircle2 className="h-80 w-80 text-emerald-400 drop-shadow-[0_0_100px_rgba(52,211,153,1)]" strokeWidth={3} />
                                            <p className="text-white font-black text-9xl tracking-[0.2em] uppercase leading-none drop-shadow-2xl">GRANTED</p>
                                        </motion.div>
                                    )}
                                    {status === "scanning" && (
                                        <div className="absolute top-20 left-20 flex items-center gap-10 bg-black/80 backdrop-blur-2xl rounded-full px-12 py-6 border-4 border-white/20 shadow-2xl">
                                            <span className="h-8 w-8 rounded-full bg-red-600 animate-bounce shadow-[0_0_40px_rgba(220,38,38,1)]" />
                                            <span className="text-white text-3xl font-black uppercase tracking-[0.5em]">LIVE FEED</span>
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
                            <div className={`min-h-[160px] p-16 rounded-[4rem] border-[10px] text-5xl font-black text-center transition-all duration-1000 shadow-2xl flex items-center justify-center ${status === "verified" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" :
                                status === "error" ? "bg-rose-500/10 border-rose-500/20 text-rose-400" :
                                    "bg-white/5 border-white/10 text-slate-100"
                                }`}>
                                {status === "verified" && "CRYPTO-KEY IDENTIFIED: INITIALIZING SYSTEM ACCESS"}
                                {status === "error" && (statusMsg || "CRITICAL SYSTEM FAILURE")}
                                {status === "scanning" && (statusMsg
                                    ? <span className="italic uppercase tracking-[0.2em] text-indigo-400 drop-shadow-2xl">{statusMsg}</span>
                                    : <span className="text-slate-700 animate-pulse uppercase tracking-[1em] opacity-40">Awaiting Signal...</span>)}
                                {status === "loading" && <span className="text-slate-800 uppercase tracking-[1.5em] opacity-30">Powering Rails...</span>}
                                {status === "idle" && <span className="text-slate-900 uppercase tracking-[2em] opacity-20">Standby...</span>}
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
                            <div className="flex gap-16">
                                <Button onClick={goBackToChooser} variant="outline" className="flex-1 h-32 border-[8px] border-white/5 text-slate-800 hover:bg-white/5 hover:text-white font-black uppercase tracking-[1em] text-xl rounded-[2.5rem] transition-all duration-700">
                                    ← RESET HUB
                                </Button>
                                {status === "error" && (
                                    <Button onClick={() => launchMethod(chosenMethod)} className="flex-1 h-32 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-[1em] text-xl rounded-[2.5rem] shadow-4xl shadow-indigo-600/50 transition-all duration-700">
                                        FORCE REBOOT
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
