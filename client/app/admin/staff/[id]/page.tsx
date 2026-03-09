"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    ArrowLeft,
    Mail,
    Phone,
    Award,
    BookOpen,
    Layout,
    TrendingUp,
    Star,
    Search,
    Brain,
    Rocket,
    CheckCircle2,
    Calendar,
    Briefcase,
    Key
} from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import {
    ResponsiveContainer,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    Radar,
    PolarRadiusAxis,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Cell
} from 'recharts'

const MetricTile = ({ label, value, icon: Icon, theme }: any) => (
    <Card className={`border border-white/5 bg-[#1C1F26] rounded-3xl p-8 flex flex-col justify-between h-64 transition-all hover:bg-white/[0.02] group shadow-xl relative overflow-hidden`}>
        <div className={`absolute top-0 right-0 w-32 h-32 ${theme.bg} rounded-full blur-3xl -mr-10 -mt-10 opacity-50 group-hover:opacity-100 transition-opacity`}></div>
        <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${theme.bg} ${theme.border} mb-4 relative z-10 shadow-lg`}>
            <Icon className={`h-7 w-7 ${theme.primary}`} />
        </div>
        <div className="relative z-10">
            <p className="text-5xl font-bold text-white tracking-tighter uppercase">{value}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-2">{label}</p>
        </div>
    </Card>
)

export default function StaffDetailPage() {
    const { id } = useParams()
    const router = useRouter()
    const [staff, setStaff] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const getApiUrl = (path: string) => {
        // Force 127.0.0.1 to avoid localhost resolution issues on some Windows setups
        return `http://127.0.0.1:8000${path}`;
    };

    const fetchStaffDetail = async (isRetry = false) => {
        if (!id) {
            console.warn("[StaffDetail] ID is missing, skipping fetch.");
            return;
        }

        const token = localStorage.getItem('token')
        if (!isRetry) setLoading(true)
        setError(null)
        try {
            // First attempt with 127.0.0.1, retry with localhost
            const base = isRetry ? "http://localhost:8000" : "http://127.0.0.1:8000";
            const url = `${base}/admin/staff/${id}`;

            console.log(`[StaffDetail] Fetching from: ${url} (Retry: ${isRetry}, Origin: ${typeof window !== 'undefined' ? window.location.origin : 'unknown'})`);

            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            })

            if (response.ok) {
                const data = await response.json()
                if (data.error) {
                    console.error("[StaffDetail] Backend returned error:", data.error)
                    setError(data.error)
                    setStaff(null)
                } else {
                    console.log("[StaffDetail] Successfully fetched staff:", data.name || data.user?.full_name);
                    setStaff(data)
                }
            } else {
                if (response.status === 401) {
                    console.warn("[StaffDetail] Unauthorized access, redirecting...");
                    localStorage.removeItem('token')
                    router.push('/login')
                } else {
                    console.error(`[StaffDetail] Fetch failed with status: ${response.status}`);
                    setError(`Error ${response.status}: Failed to retrieve profiles.`)
                    setStaff(null)
                }
            }
        } catch (error: any) {
            console.error("[StaffDetail] Critical fetch error:", error)

            // Auto-fallback logic
            if (!isRetry) {
                console.log("[StaffDetail] Network fail. Falling back to localhost...");
                fetchStaffDetail(true);
                return;
            }

            setError(error instanceof Error ? error.message : "Network communication failure with secure engine.")
        } finally {
            if (!isRetry || isRetry) setLoading(false)
        }
    }

    useEffect(() => {
        if (id) {
            fetchStaffDetail()
        }
    }, [id])

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-8">
                    <div className="h-16 w-16 shrink-0 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    <p className="font-bold text-muted-foreground animate-pulse">Syncing Professional Data...</p>
                </div>
            </div>
        )
    }

    if (error || !staff) {
        return (
            <div className="flex h-screen w-full flex-col items-center justify-center bg-[#0B0F19] text-white space-y-6">
                <div className="h-20 w-20 rounded-2xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20 text-rose-500">
                    <Search className="h-10 w-10" />
                </div>
                <div className="text-center">
                    <h2 className="text-2xl font-bold tracking-tight">Access Denied or Not Found</h2>
                    <p className="text-slate-500 mt-2 max-w-xs">{error || "The requested staff composite profile could not be identified in the secure registry."}</p>
                </div>
                <Button onClick={() => router.push('/admin')} variant="outline" className="border-white/10 hover:bg-white/5">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Return to Directory
                </Button>
            </div>
        )
    }

    const metricData = [
        { subject: 'Consistency', A: (staff?.consistency_score || 0) * 100, fullMark: 100 },
        { subject: 'Feedback', A: (staff?.student_feedback_rating || 0) * 20, fullMark: 100 },
        { subject: 'Projects', A: Math.min((staff?.projects_completed || 0) * 4, 100), fullMark: 100 },
        { subject: 'Publications', A: Math.min((staff?.publications_count || 0) * 8, 100), fullMark: 100 },
        { subject: 'Skill Index', A: 85, fullMark: 100 },
    ]

    const contributionData = [
        { name: 'Projects', value: staff?.projects_completed || 0, color: '#f59e0b' },
        { name: 'Research', value: staff?.publications_count || 0, color: '#00F5D4' },
        { name: 'Mentorship', value: 12, color: '#F15BB5' },
        { name: 'Curriculum', value: 8, color: '#4361EE' },
    ]

    // Unique Identity System
    const themes: any = {
        emerald: { primary: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", glow: "shadow-emerald-500/20", gradient: "from-emerald-900 to-emerald-800" },
        indigo: { primary: "text-indigo-500", bg: "bg-indigo-500/10", border: "border-indigo-500/20", glow: "shadow-indigo-500/20", gradient: "from-indigo-900 to-indigo-800" },
        violet: { primary: "text-violet-500", bg: "bg-violet-500/10", border: "border-violet-500/20", glow: "shadow-violet-500/20", gradient: "from-violet-900 to-violet-800" },
        amber: { primary: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", glow: "shadow-amber-500/20", gradient: "from-amber-900 to-amber-800" },
        rose: { primary: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20", glow: "shadow-rose-500/20", gradient: "from-rose-900 to-rose-800" },
        sky: { primary: "text-sky-500", bg: "bg-sky-500/10", border: "border-sky-500/20", glow: "shadow-sky-500/20", gradient: "from-sky-900 to-sky-800" }
    }

    const themeKeys = Object.keys(themes)
    const staffHash = (staff?.id || 'default').split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0)
    const theme = themes[themeKeys[staffHash % themeKeys.length]]

    return (
        <div className="flex min-h-screen w-full flex-col bg-[#0B0F19] selection:bg-indigo-500/30 pb-32">
            {/* Mega Header */}
            <header className="sticky top-0 z-40 flex h-24 items-center gap-8 border-b border-white/5 bg-[#13151A]/80 backdrop-blur-md px-12 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
                <Button variant="outline" size="icon" onClick={() => router.back()} className="h-12 w-12 border border-white/10 bg-white/5 hover:bg-white/10 rounded-2xl transition-all">
                    <ArrowLeft className="h-6 w-6 text-slate-400" />
                </Button>
                <div className="h-8 w-px bg-white/10" />
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${theme.bg} ${theme.border} shadow-lg`}>
                    <Briefcase className={`h-6 w-6 ${theme.primary}`} />
                </div>
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tighter text-white uppercase leading-none">{staff?.name || 'Unknown Faculty'}</h1>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{staff?.staff_id || 'ID_PENDING'}</p>
                </div>

                <div className="ml-auto flex items-center gap-12">
                    <div className="hidden sm:flex px-6 py-3 border border-white/5 rounded-2xl bg-[#1C1F26] items-center gap-4 text-white font-bold shadow-lg">
                        <Star className="h-5 w-5 text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                        <span className="text-xl tracking-tighter uppercase">{(staff?.student_feedback_rating || 0).toFixed(1)} <span className="text-[10px] opacity-60 ml-2 text-slate-400">Rating</span></span>
                    </div>
                </div>
            </header>

            <main className="flex-1 p-16 md:p-32 space-y-32 mx-auto w-full max-w-none">
                <div className="grid gap-16 lg:grid-cols-12">
                    {/* Left Column: Profile & Info */}
                    <div className="lg:col-span-4 space-y-16">
                        <Card className="border border-white/5 shadow-2xl shadow-black/50 bg-[#1C1F26] rounded-3xl overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                            <div className="h-48 bg-[#13151A] p-8 flex items-end justify-between relative border-b border-white/5">
                                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${theme.gradient}`}></div>
                                <div className={`h-24 w-24 rounded-2xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center text-white font-bold text-5xl border border-white/10 z-10 shadow-lg`}>
                                    {(staff?.name || 'U F').trim().split(' ').map((n: string) => n[0] || '').join('').substring(0, 2).toUpperCase()}
                                </div>
                                <div className={`px-6 py-2 bg-white/5 border border-white/10 ${theme.primary} font-bold text-xs uppercase tracking-widest z-10 rounded-full backdrop-blur-sm`}>
                                    {staff?.department || 'UNDECIDED'}
                                </div>
                            </div>
                            <CardContent className="p-16 pt-20 space-y-16 relative z-10">
                                <div>
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <div className={`h-2 w-2 rounded-full ${theme.bg.replace('/10', '')} shadow-[0_0_8px_currentColor] ${theme.primary}`}></div> Professional Identity
                                    </h4>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-6 p-6 bg-[#13151A] border border-white/5 rounded-2xl group hover:bg-white/[0.02] transition-colors">
                                            <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 group-hover:bg-indigo-500/20 transition-colors">
                                                <Award className="h-6 w-6" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Designation</p>
                                                <p className="text-xl font-bold text-white uppercase tracking-tighter truncate w-[200px]">{staff.designation}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6 p-6 bg-[#13151A] border border-white/5 rounded-2xl group hover:bg-white/[0.02] transition-colors">
                                            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
                                                <Brain className="h-6 w-6" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Expertise</p>
                                                <p className="text-xl font-bold text-white uppercase tracking-tighter truncate w-[200px]">{staff?.primary_skill || 'GENERALIST'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-12 border-t border-white/5">
                                    <h4 className="text-2xl font-[1000] text-slate-600 uppercase tracking-[0.3em] mb-8">Qualifications</h4>
                                    <div className="space-y-10">
                                        <div className="relative pl-12 border-l-4 border-white/10 flex flex-col gap-2">
                                            <div className={cn("absolute -left-[18px] top-0 h-8 w-8 rounded-full border-4 border-[#1C1F26] shadow-xl", theme.primary.replace('text-', 'bg-'))} />
                                            <p className="text-3xl font-[1000] text-white tracking-tighter">{staff?.me_degree || 'MASTER_NODE'}</p>
                                            <p className="text-2xl font-black text-slate-500 uppercase tracking-tight truncate w-full">{staff?.me_college || 'FACULTY_INSTITUTE'}</p>
                                        </div>
                                        <div className="relative pl-12 border-l-4 border-white/5 flex flex-col gap-2">
                                            <div className="absolute -left-[14px] top-0 h-6 w-6 rounded-full bg-slate-600 border-4 border-[#1C1F26] shadow-sm" />
                                            <p className="text-2xl font-[1000] text-slate-300 tracking-tight">{staff?.be_degree || 'BACHELOR_NODE'}</p>
                                            <p className="text-xl font-black text-slate-600 uppercase tracking-tight truncate w-full">{staff?.be_college || 'UNDERGRAD_BASE'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-white/5">
                                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6">Linkage</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-6 p-4 bg-[#13151A] rounded-xl border border-white/5">
                                            <Mail className="h-5 w-5 text-slate-400" />
                                            <span className="text-xs font-bold text-white lowercase truncate">
                                                {staff.user?.institutional_email || `${staff.name.toLowerCase().replace(/\s+/g, '.')}@intel.ac.edu`}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-white/5">
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-amber-400"></div> Security & Access</h4>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-6 bg-[#13151A] p-6 border border-white/5 rounded-2xl">
                                            <div className="h-10 w-10 shrink-0 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                                                <Mail className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-widest leading-none text-slate-500">Login ID</p>
                                                <p className="text-lg font-bold text-white mt-2 truncate max-w-[200px] lowercase">{staff.user?.institutional_email || `${staff.name.toLowerCase().replace(/\s+/g, '.')}@intel.ac.edu`}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6 bg-[#13151A] p-6 border border-white/5 rounded-2xl">
                                            <div className="h-10 w-10 shrink-0 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-400 border border-rose-500/20">
                                                <Key className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-widest leading-none text-slate-500">Access Token / Password</p>
                                                <p className="text-lg font-bold text-slate-300 mt-2 tracking-tight">{staff.user?.plain_password || '••••••••'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Analytics */}
                    <div className="lg:col-span-8 space-y-16">
                        <div className="grid gap-16">
                            {/* Performance Radar */}
                            <Card className="border border-white/5 bg-[#1C1F26] shadow-2xl shadow-black/50 rounded-3xl p-12 relative overflow-hidden group hover:border-[#6366f1]/30 transition-colors">
                                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#6366f1]/5 rounded-full blur-3xl -ml-40 -mt-40 transition-opacity opacity-50 group-hover:opacity-100 pointer-events-none"></div>
                                <CardHeader className="p-0 mb-8 text-center relative z-10">
                                    <div className="mx-auto h-14 w-14 bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 rounded-2xl mb-4 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                                        <TrendingUp className="h-7 w-7" />
                                    </div>
                                    <CardTitle className="text-3xl font-bold tracking-tighter text-white uppercase">Professional DNA</CardTitle>
                                    <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mt-2">AI Behavioral Analysis</CardDescription>
                                </CardHeader>
                                <CardContent className="h-[900px] p-0 relative z-10">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={metricData}>
                                            <PolarGrid stroke="rgba(255,255,255,0.1)" strokeWidth={2} />
                                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 18, fontWeight: 800, letterSpacing: '0.05em' }} />
                                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                            <Radar
                                                name="Staff"
                                                dataKey="A"
                                                stroke={themes[themeKeys[staffHash % themeKeys.length]].primary.replace('text-', '#').replace('emerald-500', '#10b981').replace('indigo-500', '#6366f1').replace('violet-500', '#8b5cf6').replace('amber-500', '#f59e0b').replace('rose-500', '#f43f5e').replace('sky-500', '#0ea5e9')}
                                                fill={themes[themeKeys[staffHash % themeKeys.length]].primary.replace('text-', '#').replace('emerald-500', '#10b981').replace('indigo-500', '#6366f1').replace('violet-500', '#8b5cf6').replace('amber-500', '#f59e0b').replace('rose-500', '#f43f5e').replace('sky-500', '#0ea5e9')}
                                                strokeWidth={4}
                                                fillOpacity={0.3}
                                            />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#13151A', borderRadius: '1.5rem', borderColor: 'rgba(255,255,255,0.1)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', padding: '20px' }}
                                                itemStyle={{ fontSize: '20px', fontWeight: 900, color: '#fff' }}
                                                labelStyle={{ color: '#818cf8', fontWeight: 'bold' }}
                                            />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            {/* Summary Metrics */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                                <MetricTile label="Publications" value={staff?.publications_count || 0} icon={BookOpen} theme={theme} />
                                <MetricTile label="Projects" value={staff?.projects_completed || 0} icon={Rocket} theme={theme} />
                                <MetricTile label="Feedback" value={staff?.student_feedback_rating || 0} icon={Star} theme={theme} />
                                <MetricTile label="Consistency" value={`${Math.round((staff?.consistency_score || 0) * 100)}%`} icon={TrendingUp} theme={theme} />
                            </div>
                        </div>

                        {/* Contribution Mix */}
                        <Card className="border border-white/5 bg-[#1C1F26] shadow-2xl shadow-black/50 rounded-3xl p-12">
                            <CardHeader className="p-0 mb-8">
                                <CardTitle className="text-3xl font-bold text-white tracking-tighter text-center uppercase">Impact Matrix</CardTitle>
                                <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-[#F15BB5] text-center mt-2">Professional Distribution</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[800px] p-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={contributionData} layout="vertical" margin={{ left: 100, right: 100, top: 40, bottom: 40 }}>
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 22, fontWeight: 900, fill: '#64748b' }} width={200} />
                                        <Tooltip
                                            cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                            contentStyle={{ borderRadius: '1.5rem', backgroundColor: '#13151A', borderColor: 'rgba(255,255,255,0.1)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}
                                            itemStyle={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}
                                        />
                                        <Bar dataKey="value" radius={[0, 25, 25, 0]} barSize={80}>
                                            {contributionData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Recent Highlights */}
                        <div className="grid md:grid-cols-2 gap-8">
                            <Card className="border border-white/5 bg-[#1C1F26] shadow-2xl shadow-black/50 rounded-3xl p-10">
                                <CardHeader className="p-0 mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20 rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                                            <Award className="h-6 w-6" />
                                        </div>
                                        <h4 className="text-xl font-bold text-white tracking-tighter uppercase">Achievements</h4>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0 space-y-4">
                                    {[
                                        `Best Research Award in ${staff.primary_skill}`,
                                        `Patent: Advanced ${staff.department} Security Systems`,
                                        `Outstanding Contribution to ${staff.department} Excellence`
                                    ].map((a, i) => (
                                        <div key={i} className="p-4 border border-white/5 bg-[#13151A] rounded-2xl flex items-center gap-4 hover:border-amber-500/30 transition-colors">
                                            <div className="h-2 w-2 bg-amber-400 shrink-0 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                                            <p className="text-xs font-bold text-slate-300 uppercase">{a}</p>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            <Card className="border border-white/5 bg-[#1C1F26] shadow-2xl shadow-black/50 rounded-3xl p-10">
                                <CardHeader className="p-0 mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                                            <Layout className="h-6 w-6" />
                                        </div>
                                        <h4 className="text-xl font-bold text-white tracking-tighter uppercase">Research</h4>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0 flex flex-wrap gap-3">
                                    {[staff.primary_skill, staff.department, "Institutional IQ", "Research Excellence", "Global Impact"].map(f => (
                                        <span key={f} className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-xl text-[10px] font-bold uppercase tracking-widest">
                                            {f}
                                        </span>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
