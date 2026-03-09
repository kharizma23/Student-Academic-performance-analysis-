"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    ArrowLeft,
    UserPlus,
    Save,
    Mail,
    Phone,
    Briefcase,
    GraduationCap,
    Brain,
    CheckCircle2
} from "lucide-react"
import Link from "next/link"

const departments = [
    "AIML", "AGRI", "EEE", "EIE", "ECE", "BT", "BME",
    "CIVIL", "IT", "MECH", "MECHATRONICS", "CSE", "FT", "FD", "AIDS"
]

const designations = [
    "Assistant Professor", "Associate Professor", "Professor", "Head of Department"
]

export default function AddStaffPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const getApiUrl = (path: string) => {
        // Force 127.0.0.1 to avoid localhost resolution issues on some Windows setups
        return `http://127.0.0.1:8000${path}`;
    };

    const [success, setSuccess] = useState(false)
    const [formData, setFormData] = useState({
        full_name: "",
        department: "AIML",
        designation: "Assistant Professor",
        be_degree: "",
        be_college: "",
        me_degree: "",
        me_college: "",
        primary_skill: "",
        personal_email: "",
        personal_phone: ""
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        const token = localStorage.getItem('token')
        try {
            const response = await fetch(getApiUrl("/admin/staff"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            })
            if (response.ok) {
                setSuccess(true)
                setTimeout(() => {
                    router.push("/admin/staff")
                }, 2000)
            }
        } catch (error) {
            console.error("Failed to add staff", error)
        } finally {
            setLoading(false)
        }
    }

    const firstName = formData.full_name.split(' ')[0] || "name"
    const previewEmail = `${firstName.toLowerCase()}${formData.department.toLowerCase()}777@gmail.com`

    if (success) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center bg-white p-8">
                <Card className="max-w-md w-full border-2 border-black shadow-none rounded-none p-12 text-center space-y-8">
                    <div className="h-20 w-20 bg-black text-white flex items-center justify-center mx-auto border-2 border-black">
                        <CheckCircle2 className="h-12 w-12" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-black uppercase tracking-tighter">SUCCESS</h2>
                        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-4">Professional profile added to the registry.</p>
                    </div>
                    <div className="p-6 bg-zinc-50 border-2 border-black flex items-center gap-6 justify-center">
                        <Mail className="h-6 w-6 text-black" />
                        <span className="text-xs font-bold text-black uppercase tracking-widest">{previewEmail}</span>
                    </div>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen w-full flex-col bg-transparent">
            {/* Header */}
            <header className="sticky top-0 z-30 flex h-24 items-center gap-10 border-b-2 border-black bg-white px-12">
                <Link href="/admin/staff">
                    <Button variant="ghost" size="icon" className="rounded-none border-2 border-black h-12 w-12 hover:bg-zinc-100">
                        <ArrowLeft className="h-6 w-6 shrink-0 text-black" />
                    </Button>
                </Link>
                <div className="flex items-center gap-6">
                    <Briefcase className="h-10 w-10 shrink-0 text-black" />
                    <h1 className="text-3xl font-bold tracking-tighter text-black uppercase">Faculty Onboarding</h1>
                </div>
            </header>

            <main className="flex-1 p-6 md:p-12 max-w-7xl mx-auto w-full">
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-2 mb-12">
                        <h2 className="text-5xl font-black tracking-tighter text-black uppercase">Professional Profile</h2>
                        <p className="text-slate-500 font-bold uppercase text-xs tracking-[0.2em]">Institutional Faculty Entry</p>
                    </div>

                    <div className="grid gap-12 md:grid-cols-2">
                        {/* Column 1: Identity & Contact */}
                        <Card className="bg-white border-2 border-black rounded-none shadow-none p-10">
                            <div className="space-y-6">
                                <h3 className="text-xs font-bold text-black uppercase tracking-[0.2em] border-b-2 border-black pb-4">Core Identity</h3>
                                <div className="space-y-4">
                                    <div className="space-y-4 pt-6">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Full Name</Label>
                                        <Input
                                            required
                                            className="rounded-none border-2 border-black h-16 text-lg font-bold uppercase"
                                            placeholder="Dr. Ashwin Kumar"
                                            value={formData.full_name}
                                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-10">
                                        <div className="space-y-4">
                                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Department</Label>
                                            <select
                                                className="w-full h-16 border-2 border-black bg-white text-lg font-bold outline-none px-6 rounded-none appearance-none"
                                                value={formData.department}
                                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                            >
                                                {departments.map(d => (
                                                    <option key={d} value={d}>{d}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-4">
                                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Designation</Label>
                                            <select
                                                className="w-full h-16 border-2 border-black bg-white text-lg font-bold outline-none px-6 rounded-none appearance-none"
                                                value={formData.designation}
                                                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                                            >
                                                {designations.map(d => (
                                                    <option key={d} value={d}>{d}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold uppercase tracking-tighter">Personal Email</Label>
                                        <Input
                                            required
                                            type="email"
                                            className="rounded-xl border-white/10 h-14"
                                            placeholder="ashwin@gmail.com"
                                            value={formData.personal_email}
                                            onChange={(e) => setFormData({ ...formData, personal_email: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold uppercase tracking-tighter">Phone Number</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-3.5 h-8 w-8 text-slate-400" />
                                            <Input
                                                className="pl-10 rounded-xl border-white/10 h-14"
                                                placeholder="+91 98765 43210"
                                                value={formData.personal_phone}
                                                onChange={(e) => setFormData({ ...formData, personal_phone: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </Card>

                        {/* Column 2: Education & Skills */}
                        <div className="space-y-12">
                            <Card className="bg-white border-2 border-black rounded-none shadow-none p-10">
                                <h3 className="text-xs font-bold text-black uppercase tracking-[0.2em] border-b-2 border-black pb-4 mb-8">Expertise</h3>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold uppercase tracking-tighter">Primary Skill / Research Field</Label>
                                        <div className="relative">
                                            <Brain className="absolute left-3 top-3.5 h-8 w-8 text-slate-400" />
                                            <Input
                                                className="pl-10 rounded-xl border-white/10 h-14"
                                                placeholder="Ex: Neural Networks"
                                                value={formData.primary_skill}
                                                onChange={(e) => setFormData({ ...formData, primary_skill: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold uppercase tracking-tighter">B.E. Degree</Label>
                                            <Input
                                                className="rounded-xl border-white/10 h-14"
                                                placeholder="Ex: B.E. CSE"
                                                value={formData.be_degree}
                                                onChange={(e) => setFormData({ ...formData, be_degree: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold uppercase tracking-tighter">Undergrad College</Label>
                                            <Input
                                                className="rounded-xl border-white/10 h-14"
                                                placeholder="IIT Madras"
                                                value={formData.be_college}
                                                onChange={(e) => setFormData({ ...formData, be_college: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold uppercase tracking-tighter">M.E. / PhD Degree</Label>
                                            <Input
                                                className="rounded-xl border-white/10 h-14"
                                                placeholder="Ex: M.E. AI"
                                                value={formData.me_degree}
                                                onChange={(e) => setFormData({ ...formData, me_degree: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold uppercase tracking-tighter">Grad School</Label>
                                            <Input
                                                className="rounded-xl border-white/10 h-14"
                                                placeholder="Stanford University"
                                                value={formData.me_college}
                                                onChange={(e) => setFormData({ ...formData, me_college: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            <Card className="bg-black border-2 border-black text-white p-10 flex flex-col items-center justify-between gap-10 rounded-none shadow-none">
                                <div className="text-center space-y-2">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">Institutional Identity</p>
                                    <div className="flex items-center gap-4 justify-center">
                                        <Mail className="h-6 w-6 text-white" />
                                        <p className="text-xl font-bold tracking-tighter uppercase">{previewEmail}</p>
                                    </div>
                                </div>
                                <Button
                                    disabled={loading || !formData.full_name}
                                    className="w-full bg-white text-black hover:bg-zinc-100 font-bold h-20 rounded-none flex items-center justify-center gap-6 group border-2 border-white text-xl uppercase tracking-widest"
                                >
                                    {loading ? (
                                        <div className="h-10 w-10 border-4 border-black/30 border-t-black rounded-full animate-spin" />
                                    ) : (
                                        <Save className="h-10 w-10 group-hover:scale-110 transition-transform" />
                                    )}
                                    Complete Onboarding
                                </Button>
                            </Card>
                        </div>
                    </div>
                </form>
            </main>
        </div>
    )
}
