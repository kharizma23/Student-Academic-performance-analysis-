"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShieldCheck, ArrowLeft, Filter, Users, Mail, Briefcase, UserPlus } from "lucide-react"
import Link from "next/link"

const departments = [
    "AIML", "AGRI", "EEE", "EIE", "ECE", "BT", "BME",
    "CIVIL", "IT", "MECH", "MECHATRONICS", "CSE", "FT", "FD", "AIDS"
]

export default function StaffPage() {
    const [selectedDept, setSelectedDept] = useState("AIML")
    const [staff, setStaff] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    const getApiUrl = (path: string) => {
        // Force 127.0.0.1 to avoid localhost resolution issues on some Windows setups
        return `http://127.0.0.1:8000${path}`;
    };

    const fetchStaff = async () => {
        setLoading(true)
        const token = localStorage.getItem('token')
        try {
            const url = getApiUrl(`/admin/staff?department=${selectedDept}`)
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (response.ok) {
                const data = await response.json()
                setStaff(Array.isArray(data) ? data : [])
            } else {
                setStaff([])
            }
        } catch (error) {
            console.error("Failed to fetch staff", error)
            setStaff([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStaff()
    }, [selectedDept])

    return (
        <div className="flex min-h-screen w-full flex-col bg-[#0B0F19] selection:bg-primary/30 pb-32">
            {/* Mega Header */}
            <header className="sticky top-0 z-50 flex h-24 items-center gap-8 border-b border-white/5 bg-[#13151A]/80 backdrop-blur-md px-12 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
                <Link href="/admin">
                    <Button variant="outline" size="icon" className="h-12 w-12 border border-white/10 bg-white/5 hover:bg-white/10 rounded-2xl transition-all">
                        <ArrowLeft className="h-6 w-6 text-slate-400" />
                    </Button>
                </Link>
                <div className="h-8 w-px bg-white/5" />
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                    <ShieldCheck className="h-7 w-7 text-emerald-400" />
                </div>
                <h1 className="text-2xl font-bold tracking-tighter text-white uppercase leading-none">Institutional Control</h1>
            </header>

            <main className="flex-1 p-16 md:p-24 space-y-20 mx-auto w-full">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="space-y-2">
                        <h2 className="text-6xl font-[1000] tracking-tighter text-white leading-none uppercase">Faculty Directory</h2>
                        <p className="text-[10px] font-bold text-slate-500 mt-2 uppercase tracking-[0.3em]">Institutional Professional Matrix</p>
                    </div>
                    <Link href="/admin/staff/add">
                        <Button className="h-16 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-10 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center gap-4 group transition-all text-sm uppercase tracking-widest border border-emerald-500/50">
                            <UserPlus className="h-6 w-6" />
                            Onboard Faculty
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <Card className="border border-white/5 bg-[#1C1F26] rounded-3xl shadow-2xl shadow-black/50 overflow-hidden group">
                    <CardHeader className="bg-[#13151A] border-b border-white/5 p-8">
                        <CardTitle className="flex items-center gap-4 text-white text-2xl font-bold tracking-tighter uppercase">
                            <Filter className="h-6 w-6 text-emerald-400" />
                            Department Selection
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="flex flex-wrap gap-4">
                            {departments.map(dept => (
                                <button
                                    key={dept}
                                    onClick={() => setSelectedDept(dept)}
                                    className={`px-8 py-3 text-[10px] font-bold uppercase tracking-widest transition-all rounded-xl border ${selectedDept === dept
                                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                                        : "bg-[#13151A] text-slate-500 border-white/5 hover:border-white/20 hover:text-slate-300"
                                        }`}
                                >
                                    {dept}
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Staff List */}
                <div className="space-y-12">
                    <div className="flex items-center justify-between">
                        <h3 className="text-4xl font-[1000] tracking-tighter flex items-center gap-8 text-white uppercase">
                            <Users className="h-12 w-12 shrink-0 text-emerald-400" />
                            Faculty in {selectedDept}
                            <div className="px-6 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-black uppercase tracking-widest rounded-full shadow-inner">
                                {staff.length} Members Identifed
                            </div>
                        </h3>
                    </div>

                    {loading ? (
                        <div className="grid gap-16 md:grid-cols-2 lg:grid-cols-3">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="h-[400px] rounded-3xl bg-white/5 animate-pulse border border-white/5 shadow-sm" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {staff.map((member) => (
                                <Link key={member.id} href={`/admin/staff/${member.id}`}>
                                    <Card className="border border-white/5 bg-[#1C1F26] rounded-3xl shadow-xl hover:border-emerald-500/30 transition-all cursor-pointer h-full group relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl -mr-10 -mt-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        <CardContent className="p-10 relative z-10">
                                            <div className="flex items-start justify-between mb-8">
                                                <div className="h-16 w-16 bg-[#13151A] flex items-center justify-center text-white font-bold text-xl uppercase rounded-2xl border border-white/5 shadow-inner group-hover:scale-110 transition-transform">
                                                    {(member.name || 'SF').split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                                                </div>
                                                <div className="px-4 py-1.5 bg-[#13151A] border border-white/5 text-[9px] font-black text-slate-500 uppercase tracking-widest rounded-lg">
                                                    {member.staff_id}
                                                </div>
                                            </div>

                                            <h4 className="font-bold text-2xl text-white mb-1 uppercase tracking-tighter group-hover:text-emerald-400 transition-colors">
                                                {member.name}
                                            </h4>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-8 mt-2 flex items-center gap-2">
                                                <Briefcase className="h-4 w-4 text-emerald-400" /> {member.designation}
                                            </p>

                                            <div className="pt-8 border-t border-white/5 space-y-4">
                                                <div className="flex items-center gap-4 text-slate-400">
                                                    <Mail className="h-4 w-4 text-slate-500" />
                                                    <span className="text-[10px] font-bold uppercase truncate">{member.user?.institutional_email || `${member.name.toLowerCase().replace(/\s+/g, '.')}@intel.ac.edu`}</span>
                                                </div>
                                                <div className="flex items-center justify-between mt-8 p-5 bg-[#13151A] rounded-2xl border border-white/5 group-hover:bg-[#1C1F26] transition-all">
                                                    <div className="flex flex-col">
                                                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-600 mb-1">Expertise</span>
                                                        <span className="text-xs font-bold uppercase text-white tracking-tight">{member.primary_skill}</span>
                                                    </div>
                                                    <div className="h-10 w-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-all">
                                                        <ArrowLeft className="h-5 w-5 rotate-180" />
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    )}

                    {!loading && staff.length === 0 && (
                        <div className="text-center py-40 rounded-[4rem] border border-dashed border-white/10 bg-[#13151A] shadow-inner">
                            <Users className="h-24 w-24 text-slate-800 mx-auto mb-8 opacity-40 shrink-0" />
                            <h3 className="text-4xl font-[1000] text-slate-600 tracking-tighter uppercase">No Faculty Nodes Found</h3>
                            <p className="text-xs font-bold text-slate-500 mt-4 uppercase tracking-[0.3em]">Institutional database returned null for this specialization</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
