"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShieldCheck, ArrowLeft, Filter, Search, GraduationCap, UserPlus, LogOut } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

const departments = [
    "AIML", "AGRI", "EEE", "EIE", "ECE", "BT", "BME",
    "CIVIL", "IT", "MECH", "MECHATRONICS", "CSE", "FT", "FD", "AIDS"
]

const years = [
    { id: 1, label: "1st Year", batch: "2025-2029" },
    { id: 2, label: "2nd Year", batch: "2024-2028" },
    { id: 3, label: "3rd Year", batch: "2023-2027" },
    { id: 4, label: "4th Year", batch: "2022-2026" },
]

export default function StudentsPage() {
    const router = useRouter()
    const [selectedDept, setSelectedDept] = useState("AIML")
    const [selectedYear, setSelectedYear] = useState(1)
    const [students, setStudents] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    const getApiUrl = (path: string) => {
        // Force 127.0.0.1 to avoid localhost resolution issues on some Windows setups
        return `http://127.0.0.1:8000${path}`;
    };

    const fetchStudents = async () => {
        setLoading(true)
        const token = localStorage.getItem('token')
        try {
            const url = getApiUrl(`/admin/students?department=${selectedDept}&year=${selectedYear}`)
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (response.ok) {
                const data = await response.json()
                setStudents(data)
            }
        } catch (error) {
            console.error("Failed to fetch students", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStudents()
    }, [selectedDept, selectedYear])

    return (
        <div className="flex min-h-screen w-full flex-col bg-[#0B0F19] selection:bg-indigo-500/30 pb-32">
            {/* Header */}
            <header className="sticky top-0 z-50 flex h-24 items-center justify-between border-b border-white/5 bg-[#13151A]/80 backdrop-blur-md px-12 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
                <div className="flex items-center gap-8">
                    <Link href="/admin">
                        <Button variant="outline" size="icon" className="h-12 w-12 border border-white/10 bg-white/5 hover:bg-white/10 rounded-2xl transition-all">
                            <ArrowLeft className="h-6 w-6 text-slate-400" />
                        </Button>
                    </Link>
                    <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                        <GraduationCap className="h-7 w-7 text-indigo-400" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tighter text-white uppercase leading-none">Student Management</h1>
                </div>
                <Button
                    onClick={() => {
                        localStorage.removeItem('token')
                        router.push('/')
                    }}
                    variant="outline"
                    className="h-11 border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 transition-all text-rose-400 px-6 rounded-xl font-bold uppercase tracking-widest text-[10px]"
                >
                    <LogOut className="h-5 w-5 mr-3" />
                    Terminate Session
                </Button>
            </header>

            <main className="flex-1 p-16 md:p-24 space-y-16 mx-auto w-full">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="space-y-2">
                        <h2 className="text-6xl font-[1000] tracking-tighter text-white uppercase leading-none">Student Intelligence</h2>
                        <p className="text-[10px] font-bold text-slate-500 mt-2 uppercase tracking-[0.3em]">Institutional academic record matrix</p>
                    </div>
                    <Link href="/admin/students/add">
                        <Button className="h-16 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-10 rounded-2xl shadow-[0_0_20px_rgba(79,70,229,0.4)] flex items-center gap-4 transition-all uppercase tracking-widest text-sm border border-indigo-500/50">
                            <UserPlus className="h-6 w-6" />
                            Enroll Student
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <Card className="border border-white/5 bg-[#1C1F26] rounded-3xl shadow-2xl shadow-black/50 overflow-hidden group">
                    <div className="bg-[#13151A] border-b border-white/5 p-8 flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                            <Filter className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-xl font-bold text-white tracking-tighter uppercase">Selection Filter System</CardTitle>
                    </div>
                    <CardContent className="p-8 grid gap-8 md:grid-cols-2">
                        <div className="space-y-4">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Department Node</label>
                            <select
                                value={selectedDept}
                                onChange={(e) => setSelectedDept(e.target.value)}
                                className="w-full flex h-14 rounded-2xl border border-white/10 bg-[#13151A] px-6 text-sm font-bold text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 outline-none transition-all uppercase shadow-inner"
                            >
                                {departments.map(dept => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Academic Hierarchy</label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {years.map(year => (
                                    <button
                                        key={year.id}
                                        onClick={() => setSelectedYear(year.id)}
                                        className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-300 ${selectedYear === year.id
                                            ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                                            : "border-white/5 bg-[#13151A] text-slate-500 hover:border-white/20 hover:text-slate-300 shadow-inner"
                                            }`}
                                    >
                                        <span className="text-[10px] font-[1000] uppercase">{year.label}</span>
                                        <span className="text-[8px] font-bold opacity-50 mt-1">{year.batch}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Student List */}
                <div className="space-y-8">
                    <div className="flex items-center justify-between">
                        <h3 className="text-3xl font-[1000] tracking-tighter flex items-center gap-6 text-white uppercase">
                            <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 border border-white/5">
                                <GraduationCap className="h-6 w-6" />
                            </div>
                            {selectedDept} Nodes <span className="text-slate-500 opacity-30 text-2xl tracking-[0.2em] font-light">/</span> {years.find(y => y.id === selectedYear)?.label}
                        </h3>
                        <div className="px-6 py-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-[1000] uppercase tracking-widest rounded-full shadow-[0_0_10px_rgba(99,102,241,0.1)]">
                            {students.length} Records Identified
                        </div>
                    </div>

                    {loading ? (
                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="h-56 rounded-3xl bg-white/5 animate-pulse border border-white/5" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {students.map((student) => (
                                <Link key={student.id} href={`/admin/students/${student.id}`}>
                                    <Card className="border border-white/5 bg-[#1C1F26] rounded-3xl shadow-xl hover:border-emerald-500/30 transition-all cursor-pointer group h-full relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl -mr-10 -mt-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        <CardContent className="p-10 relative z-10 flex flex-col h-full">
                                            <div className="flex items-start justify-between mb-8">
                                                <div className="h-16 w-16 bg-[#13151A] flex items-center justify-center font-bold text-2xl text-white rounded-2xl border border-white/5 shadow-inner group-hover:scale-110 transition-transform">
                                                    {(student.name || 'ST').split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                                                </div>
                                                <div className="text-right flex flex-col items-end">
                                                    <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1.5 opacity-60">Avg CGPA</div>
                                                    <div className="text-4xl font-[1000] text-white tracking-tighter leading-none group-hover:text-emerald-400 transition-colors">{(student.current_cgpa || 0).toFixed(2)}</div>
                                                </div>
                                            </div>

                                            <div className="mt-auto pt-8 border-t border-white/5 space-y-6">
                                                <h4 className="font-bold text-xl text-white uppercase tracking-tighter truncate w-full leading-tight">{student.name}</h4>
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <span className="px-3 py-1.5 bg-[#13151A] text-[9px] font-black text-slate-400 tracking-widest uppercase rounded-lg border border-white/5">
                                                        #{student.roll_number}
                                                    </span>
                                                    <span className="px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-black text-indigo-300 uppercase tracking-widest rounded-lg">
                                                        {student.department}
                                                    </span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    )}

                    {!loading && students.length === 0 && (
                        <div className="text-center py-40 rounded-[3rem] border border-dashed border-white/10 bg-[#13151A] shadow-inner">
                            <GraduationCap className="h-24 w-24 text-slate-800 mx-auto mb-8 opacity-40" />
                            <h3 className="text-4xl font-[1000] text-slate-600 tracking-tighter uppercase">No Intelligence Nodes Found</h3>
                            <p className="text-xs font-bold text-slate-500 mt-4 uppercase tracking-[0.3em]">Institutional database returned null for this sector</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
