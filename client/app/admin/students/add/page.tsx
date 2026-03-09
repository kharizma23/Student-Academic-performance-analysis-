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
    Calendar,
    Droplets,
    School,
    CheckCircle2
} from "lucide-react"
import Link from "next/link"

const departments = [
    "AIML", "AGRI", "EEE", "EIE", "ECE", "BT", "BME",
    "CIVIL", "IT", "MECH", "MECHATRONICS", "CSE", "FT", "FD", "AIDS"
]

export default function AddStudentPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    const getApiUrl = (path: string) => {
        // Force 127.0.0.1 to avoid localhost resolution issues on some Windows setups
        return `http://127.0.0.1:8000${path}`;
    };

    const [formData, setFormData] = useState({
        full_name: "",
        department: "AIML",
        year: 1,
        dob: "",
        blood_group: "O+",
        parent_phone: "",
        personal_phone: "",
        personal_email: "",
        previous_school: ""
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        const token = localStorage.getItem('token')
        try {
            const response = await fetch(getApiUrl("/admin/students"), {
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
                    router.push("/admin/students")
                }, 2000)
            }
        } catch (error) {
            console.error("Failed to add student", error)
        } finally {
            setLoading(false)
        }
    }

    // Auto-generate email preview logic
    const batch = { 1: "25", 2: "24", 3: "23", 4: "22" }[formData.year as 1 | 2 | 3 | 4] || "25"
    const firstName = formData.full_name.trim().split(' ')[0].toLowerCase() || "name"
    const previewEmail = `${firstName}.${formData.department.toLowerCase()}${batch}@gmail.com`

    if (success) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center bg-white p-8">
                <Card className="max-w-md w-full border-2 border-black shadow-none rounded-none p-12 text-center space-y-8">
                    <div className="h-20 w-20 bg-black text-white flex items-center justify-center mx-auto border-2 border-black">
                        <CheckCircle2 className="h-12 w-12" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-black uppercase tracking-tighter">ENROLLED</h2>
                        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-4">Record added to {formData.department} directory.</p>
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
                <Link href="/admin/students">
                    <Button variant="ghost" size="icon" className="rounded-none border-2 border-black h-12 w-12 hover:bg-zinc-100">
                        <ArrowLeft className="h-6 w-6 shrink-0 text-black" />
                    </Button>
                </Link>
                <div className="flex items-center gap-6">
                    <UserPlus className="h-10 w-10 shrink-0 text-black" />
                    <h1 className="text-3xl font-bold tracking-tighter text-black uppercase">Manual Enrollment</h1>
                </div>
            </header>

            <main className="flex-1 p-6 md:p-12 max-w-7xl mx-auto w-full">
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-2 mb-12">
                        <h2 className="text-5xl font-black tracking-tighter text-black uppercase">Student Details</h2>
                        <p className="text-slate-500 font-bold uppercase text-xs tracking-[0.2em]">Institutional Database Entry</p>
                    </div>

                    <Card className="bg-white border-2 border-black rounded-none shadow-none overflow-hidden">
                        <CardContent className="p-8 md:p-12 grid gap-12 md:grid-cols-2">
                            {/* Personal Info */}
                            <div className="space-y-6">
                                <h3 className="text-sm font-bold text-primary uppercase tracking-widest border-b border-primary/10 pb-2">Identity</h3>
                                <div className="space-y-4">
                                    <div className="space-y-4">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Full Name</Label>
                                        <Input
                                            required
                                            className="rounded-none border-2 border-black focus:ring-black h-16 text-lg font-bold uppercase placeholder:text-slate-200"
                                            placeholder="Ex: Ashwin Kumar"
                                            value={formData.full_name}
                                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Personal Email</Label>
                                        <Input
                                            required
                                            type="email"
                                            className="rounded-none border-2 border-black focus:ring-black h-16 text-lg font-bold uppercase placeholder:text-slate-200"
                                            placeholder="personal@gmail.com"
                                            value={formData.personal_email}
                                            onChange={(e) => setFormData({ ...formData, personal_email: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-10">
                                        <div className="space-y-4">
                                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Date of Birth</Label>
                                            <div className="relative">
                                                <Calendar className="absolute left-4 top-5 h-6 w-6 text-black" />
                                                <Input
                                                    required
                                                    type="date"
                                                    className="pl-14 rounded-none border-2 border-black h-16 text-lg font-bold"
                                                    value={formData.dob}
                                                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Blood Group</Label>
                                            <div className="relative">
                                                <Droplets className="absolute left-4 top-5 h-6 w-6 text-black" />
                                                <select
                                                    className="w-full pl-14 h-16 border-2 border-black bg-white text-lg font-bold focus:ring-black outline-none appearance-none rounded-none"
                                                    value={formData.blood_group}
                                                    onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                                                >
                                                    {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(bg => (
                                                        <option key={bg} value={bg}>{bg}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Academic & Contact */}
                            <div className="space-y-6">
                                <h3 className="text-sm font-bold text-primary uppercase tracking-widest border-b border-primary/10 pb-2">Academic Info</h3>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold uppercase">Department</Label>
                                            <select
                                                className="w-full h-14 rounded-xl border border-white/10 bg-white/5/5 text-sm font-medium focus:ring-primary outline-none px-3"
                                                value={formData.department}
                                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                            >
                                                {departments.map(d => (
                                                    <option key={d} value={d}>{d}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold uppercase">Year</Label>
                                            <select
                                                className="w-full h-14 rounded-xl border border-white/10 bg-white/5/5 text-sm font-medium focus:ring-primary outline-none px-3"
                                                value={formData.year}
                                                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                                            >
                                                {[1, 2, 3, 4].map(y => (
                                                    <option key={y} value={y}>{y} Year</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold uppercase">Previous School</Label>
                                        <div className="relative">
                                            <School className="absolute left-3 top-3.5 h-8 w-8 text-slate-400" />
                                            <Input
                                                className="pl-10 rounded-xl border-white/10 h-14"
                                                placeholder="Ex: KVS Matriculation"
                                                value={formData.previous_school}
                                                onChange={(e) => setFormData({ ...formData, previous_school: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold uppercase">Student Phone (+91)</Label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-3.5 h-8 w-8 text-slate-400" />
                                                <Input
                                                    required
                                                    maxLength={10}
                                                    pattern="[0-9]{10}"
                                                    className="pl-10 rounded-xl border-white/10 h-14"
                                                    placeholder="10-digit number"
                                                    value={formData.personal_phone}
                                                    onChange={(e) => setFormData({ ...formData, personal_phone: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold uppercase">Parent Phone (+91)</Label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-3.5 h-8 w-8 text-slate-400" />
                                                <Input
                                                    required
                                                    maxLength={10}
                                                    pattern="[0-9]{10}"
                                                    className="pl-10 rounded-xl border-white/10 h-14"
                                                    placeholder="10-digit number"
                                                    value={formData.parent_phone}
                                                    onChange={(e) => setFormData({ ...formData, parent_phone: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Email Preview & Action */}
                    <Card className="bg-white border-2 border-black text-black flex flex-col md:flex-row items-center justify-between p-10 gap-10 rounded-none shadow-none">
                        <div className="flex items-center gap-10">
                            <div className="h-20 w-20 bg-black flex items-center justify-center border-2 border-black">
                                <Mail className="h-10 w-10 text-white" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Institutional Email Identity</p>
                                <p className="text-2xl font-bold tracking-tighter uppercase">{previewEmail}</p>
                            </div>
                        </div>
                        <Button
                            disabled={loading || !formData.full_name}
                            className="bg-black hover:bg-zinc-800 text-white font-bold h-20 px-16 rounded-none border-2 border-black shadow-none transition-all flex items-center gap-6 group text-xl uppercase tracking-widest"
                        >
                            {loading ? (
                                <div className="h-10 w-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Save className="h-10 w-10 group-hover:scale-110 transition-transform" />
                            )}
                            Enroll Record
                        </Button>
                    </Card>
                </form>
            </main>
        </div>
    )
}
