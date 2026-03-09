"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { GraduationCap, Lock, Mail, Loader2, ArrowRight, ShieldCheck, UserPlus } from "lucide-react"
import Link from "next/link"

export default function RegisterPage() {
    const router = useRouter()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const getApiUrl = (path: string) => {
        // Force 127.0.0.1 to avoid localhost resolution issues on some Windows setups
        return `http://127.0.0.1:8000${path}`;
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        if (password !== confirmPassword) {
            setError("Passwords do not match.")
            setLoading(false)
            return
        }

        try {
            const response = await fetch(getApiUrl('/users/'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                    role: "student" // Backend will override this based on domain
                }),
            })

            const data = await response.json()

            if (response.ok) {
                setSuccess(true)
                setTimeout(() => {
                    router.push("/login")
                }, 2000)
            } else {
                setError(data.detail || "Registration failed. Please try again.")
            }
        } catch (err) {
            console.error("Registration Error:", err)
            setError("Server unreachable. Please ensure the backend is running.")
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background p-4">
                <Card className="w-full max-w-md glass-card text-center p-8 space-y-4">
                    <div className="mx-auto p-4 rounded-full bg-emerald-500/10 w-fit">
                        <ShieldCheck className="h-16 w-16 shrink-0 text-emerald-500 shrink-0" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Registration Successful!</CardTitle>
                    <p className="text-muted-foreground">Your account has been created. Redirecting to login...</p>
                    <Loader2 className="h-10 w-10 shrink-0 animate-spin mx-auto text-primary" />
                </Card>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-white p-4 selection:bg-black/10">
            <Card className="w-full max-w-md z-10 bg-white border-2 border-black rounded-none shadow-none">
                <CardHeader className="space-y-4 pb-8 text-center border-b-2 border-black">
                    <div className="mx-auto p-4 bg-black w-fit">
                        <UserPlus className="h-10 w-10 shrink-0 text-white" />
                    </div>
                    <div>
                        <CardTitle className="text-3xl font-bold tracking-tighter uppercase">Create Account</CardTitle>
                        <CardDescription className="text-xs font-bold uppercase tracking-widest mt-2">
                            Academic Intelligence Network
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="pt-8">
                    <form onSubmit={handleRegister} className="grid gap-8">
                        {error && (
                            <div className="bg-white border-2 border-black p-4 flex items-center gap-6 text-black font-bold text-xs uppercase">
                                <ShieldCheck className="h-8 w-8 shrink-0" />
                                {error}
                            </div>
                        )}
                        <div className="grid gap-4">
                            <label className="text-[10px] font-bold text-black uppercase tracking-widest ml-1">Academic Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-4 h-6 w-6 text-slate-300 group-focus-within:text-black transition-colors" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="yourid@university.edu"
                                    className="flex h-14 w-full border-2 border-black bg-white pl-12 pr-4 text-sm font-bold uppercase focus:outline-none focus:bg-zinc-50 transition-all"
                                    required
                                />
                            </div>
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest ml-1">Use @faculty.com for staff access.</p>
                        </div>
                        <div className="grid gap-4">
                            <label className="text-[10px] font-bold text-black uppercase tracking-widest ml-1">Secure Pass-Key</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-4 h-6 w-6 text-slate-300 group-focus-within:text-black transition-colors" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="flex h-14 w-full border-2 border-black bg-white pl-12 pr-4 text-sm font-bold uppercase focus:outline-none focus:bg-zinc-50 transition-all"
                                    required
                                />
                            </div>
                        </div>
                        <div className="grid gap-4">
                            <label className="text-[10px] font-bold text-black uppercase tracking-widest ml-1">Identity Confirmation</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-4 h-6 w-6 text-slate-300 group-focus-within:text-black transition-colors" />
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="flex h-14 w-full border-2 border-black bg-white pl-12 pr-4 text-sm font-bold uppercase focus:outline-none focus:bg-zinc-50 transition-all"
                                    required
                                />
                            </div>
                        </div>
                        <Button
                            type="submit"
                            className="w-full h-16 bg-black text-white rounded-none text-sm font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all"
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader2 className="h-8 w-8 animate-spin" />
                            ) : (
                                <>
                                    Establish Account
                                    <ArrowRight className="ml-4 h-6 w-6" />
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col gap-6 pb-8">
                    <div className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Already in network?{" "}
                        <Link href="/login" className="text-black hover:underline underline-offset-4">
                            Log In
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}
