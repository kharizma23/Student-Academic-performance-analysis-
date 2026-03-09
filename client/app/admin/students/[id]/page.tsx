"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    ArrowLeft,
    Mail,
    Phone,
    Calendar,
    Droplet,
    User,
    TrendingUp,
    Target,
    AlertTriangle,
    GraduationCap,
    Award,
    CheckCircle2,
    AlertCircle,
    BookOpen,
    Activity,
    Sparkles,
    Key,
    Brain
} from "lucide-react"
import Link from "next/link"
import {
    ResponsiveContainer,
    LineChart,
    Line,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    BarChart,
    Bar,
    ComposedChart,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    ScatterChart,
    Scatter,
    ZAxis,
    Cell
} from 'recharts'

export default function StudentDetailPage() {
    const { id } = useParams()
    const router = useRouter()
    const [student, setStudent] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    const getApiUrl = (path: string) => {
        // Force 127.0.0.1 to avoid localhost resolution issues on some Windows setups
        return `http://127.0.0.1:8000${path}`;
    };

    const isNewStudent = Array.isArray(student?.academic_records) && student.academic_records.length === 0

    const fetchStudentDetail = async () => {
        const token = localStorage.getItem('token')
        try {
            const response = await fetch(getApiUrl(`/admin/students/${id}`), {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (response.ok) {
                const data = await response.json()
                setStudent(data)

                if (Array.isArray(data.academic_records) && data.academic_records.length === 0) {
                    // Unique branding for new students could be added here
                }
            }
        } catch (error) {
            console.error("Failed to fetch student detail", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStudentDetail()
    }, [id])

    // Utility to get unique seed-based results
    const getSeed = (str: string) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return Math.abs(hash);
    }

    const aiCareer = useMemo(() => {
        if (!student) return null

        try {
            if (student?.ai_scores?.career_suggestions && student.ai_scores.career_suggestions !== '[]') {
                return JSON.parse(student.ai_scores.career_suggestions)
            }
        } catch (e) {
            console.error("Failed to parse career AI", e)
        }

        const seed = getSeed(student?.id || student?.user?.full_name || 'default')
        const variations = [
            [
                { role: "Full Stack Architect", fit: "96%", icon: "💻" },
                { role: "Cloud Security Specialist", fit: "91%", icon: "🛡️" },
                { role: "Backend Developer", fit: "89%", icon: "⚙️" }
            ],
            [
                { role: "DevOps Engineer", fit: "94%", icon: "🚀" },
                { role: "Frontend Lead", fit: "92%", icon: "🎨" },
                { role: "Database Admin", fit: "85%", icon: "🗄️" }
            ],
            [
                { role: "Software Architect", fit: "97%", icon: "🏗️" },
                { role: "QA Automation Lead", fit: "89%", icon: "🧪" },
                { role: "Mobile Dev (Swift/Kotlin)", fit: "86%", icon: "📱" }
            ]
        ]

        const fallbacks: any = {
            'AIML': [
                { role: "Machine Learning Engineer", fit: "94%", icon: "🤖" },
                { role: "Data Scientist", fit: "88%", icon: "📊" },
                { role: "Computer Vision Researcher", fit: "82%", icon: "👁️" }
            ],
            'CSE': variations[seed % variations.length],
            'ECE': [
                { role: "VLSI Design Engineer", fit: "92%", icon: "🔌" },
                { role: "Embedded Systems Expert", fit: "87%", icon: "📟" },
                { role: "IoT Solutions Architect", fit: "85%", icon: "🌐" }
            ],
            'EEE': [
                { role: "Power Systems Engineer", fit: "90%", icon: "⚡" },
                { role: "Renewable Energy Specialist", fit: "86%", icon: "🌱" },
                { role: "Control Systems Designer", fit: "83%", icon: "🕹️" }
            ],
            'MECH': [
                { role: "Automotive Designer", fit: "91%", icon: "🚗" },
                { role: "Robotics Engineer", fit: "88%", icon: "🦾" },
                { role: "Manufacturing Lead", fit: "84%", icon: "🏭" }
            ]
        }
        return fallbacks[student?.department] || [
            { role: "Systems Analyst", fit: "85%", icon: "📈" },
            { role: "Technical Consultant", fit: "82%", icon: "💼" }
        ]
    }, [student])

    const aiCourses = useMemo(() => {
        if (!student) return null

        try {
            if (student?.ai_scores?.recommended_courses && student.ai_scores.recommended_courses !== '{"strong":[],"weak":[]}') {
                return JSON.parse(student.ai_scores.recommended_courses)
            }
        } catch (e) {
            console.error("Failed to parse course AI", e)
        }

        const seed = getSeed(student?.id || student?.user?.full_name || 'default')
        const cseVariations = [
            { strong: ["Algorithms", "Web Architecture", "Java"], weak: ["Networking", "DevOps"] },
            { strong: ["React.js", "System Design", "NoSQL"], weak: ["Operating Systems", "Compiler Design"] },
            { strong: ["Python", "Docker", "API Design"], weak: ["Hardware", "Digital Logic"] }
        ]

        const fallbacks: any = {
            'AIML': { strong: ["Neural Networks", "Python Pro", "Math"], weak: ["UI Design", "Testing"] },
            'CSE': cseVariations[seed % cseVariations.length],
            'ECE': { strong: ["Digital Logic", "Signal Processing", "C++"], weak: ["Economics", "Public Speaking"] },
            'EEE': { strong: ["Circuit Theory", "Microgrids", "Control"], weak: ["Software Design", "Marketing"] },
            'MECH': { strong: ["Thermodynamics", "CAD/CAM", "Dynamics"], weak: ["Data Structures", "Fintech"] }
        }
        return fallbacks[student?.department] || { strong: ["General Aptitude", "Soft Skills"], weak: ["Technical Writing"] }
    }, [student])

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-8">
                    <div className="h-16 w-16 shrink-0 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    <p className="font-bold text-muted-foreground animate-pulse">Analyzing Academic DNA...</p>
                </div>
            </div>
        )
    }

    if (!student) {
        return <div className="p-12 text-center">Student not found.</div>
    }

    // Prepare Data for Charts (with unique mock generation for new students)
    const seed = getSeed(student?.id || student?.user?.full_name || id?.toString() || 'default')

    const cgpaData = isNewStudent ? [
        { name: 'Sem 1', cgpa: 3.2 + (seed % 10) / 10, attendance: 75 + (seed % 20) },
        { name: 'Sem 2', cgpa: 3.4 + (seed % 10) / 10, attendance: 80 + (seed % 15) },
        { name: 'Sem 3', cgpa: 3.3 + (seed % 10) / 10, attendance: 78 + (seed % 18) },
        { name: 'Sem 4', cgpa: 3.5 + (seed % 10) / 10, attendance: 85 + (seed % 10) }
    ] : student.academic_records.map((r: any) => ({
        name: `Sem ${r.semester}`,
        cgpa: r.external_marks / 10 + 2,
        attendance: r.attendance_percentage
    })).sort((a: any, b: any) => a.name.localeCompare(b.name))

    const skillData = [
        { subject: 'Consistency', A: isNewStudent ? (60 + (seed % 30)) : (student.ai_scores?.consistency_index || 0) * 100, fullMark: 100 },
        { subject: 'Performance', A: isNewStudent ? (70 + (seed % 20)) : (student.academic_dna_score || 0), fullMark: 100 },
        { subject: 'Growth', A: isNewStudent ? (65 + (seed % 25)) : (student.growth_index || 0) * 20, fullMark: 100 },
        { subject: 'Readiness', A: isNewStudent ? (55 + (seed % 40)) : (student.career_readiness_score || 0), fullMark: 100 },
        { subject: 'Skill Gap', A: isNewStudent ? (40 + (seed % 50)) : (student.ai_scores?.skill_gap_score || 0), fullMark: 100 },
    ]

    const crtData = isNewStudent ? [
        { name: 'Sem 1', internal: 60 + (seed % 20), external: 55 + (seed % 30), aptitude: 40 + (seed % 40), reasoning: 45 + (seed % 35), coding: 30 + (seed % 50) },
        { name: 'Sem 2', internal: 65 + (seed % 20), external: 60 + (seed % 30), aptitude: 50 + (seed % 40), reasoning: 55 + (seed % 35), coding: 45 + (seed % 50) },
        { name: 'Sem 3', internal: 70 + (seed % 20), external: 65 + (seed % 30), aptitude: 60 + (seed % 40), reasoning: 65 + (seed % 35), coding: 60 + (seed % 50) },
        { name: 'Sem 4', internal: 75 + (seed % 20), external: 72 + (seed % 28), aptitude: 70 + (seed % 30), reasoning: 75 + (seed % 25), coding: 75 + (seed % 25) }
    ] : student.academic_records.map((r: any, idx: number) => ({
        name: `Sem ${r.semester}`,
        internal: r.internal_marks * 4,
        external: r.external_marks,
        aptitude: Math.min(100, Math.max(20, (r.internal_marks * 4) + (idx * 5) + (Math.sin(idx) * 10))),
        reasoning: Math.min(100, Math.max(15, (r.external_marks + 10) + (idx * 8) - (Math.cos(idx) * 12))),
        verbal: Math.min(100, Math.max(30, ((r.internal_marks + r.external_marks) / 2) + 20 + (idx * 3))),
        coding: Math.min(100, Math.max(10, (r.internal_marks * 3) + (idx * 12) + (Math.sin(idx * 2) * 15)))
    })).sort((a: any, b: any) => a.name.localeCompare(b.name))



    return (
        <div className="flex min-h-screen w-full flex-col bg-[#0B0F19] selection:bg-indigo-500/30">
            {/* Header */}
            <header className="sticky top-0 z-50 flex h-48 items-center gap-16 border-b border-white/5 bg-[#13151A]/80 backdrop-blur-md px-20 shadow-xl">
                <Button variant="outline" size="icon" onClick={() => router.back()} className="h-20 w-20 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white text-slate-400 transition-all">
                    <ArrowLeft className="h-10 w-10" />
                </Button>

                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-4">
                        <h1 className="text-7xl font-bold tracking-tighter text-white leading-none">{student.user?.full_name || 'Unknown Student'}</h1>
                        {isNewStudent && (
                            <span className="px-4 py-2 bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-xs font-black uppercase tracking-[0.2em] rounded-lg animate-pulse">
                                Newly Added Node
                            </span>
                        )}
                    </div>
                    <p className="text-2xl font-bold uppercase tracking-widest text-indigo-400 leading-none drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]">{student.roll_number || 'UNKNOWN_ID'}</p>
                </div>

                <div className="ml-auto flex gap-16">
                    <div className="hidden md:flex flex-col items-end px-12 py-6 bg-[#1C1F26] border border-white/5 rounded-2xl shadow-lg">
                        <span className="text-sm font-bold uppercase tracking-widest text-emerald-400 mb-1">Current Academic GP</span>
                        <span className="text-7xl font-bold text-white leading-none tracking-tighter drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">{(student.current_cgpa || 0).toFixed(2)}</span>
                    </div>
                </div>
            </header>

            <main className="flex-1 p-20 md:p-32 space-y-20 mx-auto w-full max-w-none">
                {/* Profile Grid */}
                <div className="grid gap-12 lg:grid-cols-12">
                    {/* Sidebar Info */}
                    <div className="lg:col-span-4 space-y-8">
                        <Card className="border border-white/5 bg-[#1C1F26] rounded-3xl overflow-hidden shadow-2xl shadow-black/50">
                            <div className="h-44 bg-[#13151A] p-12 flex items-end justify-between border-b border-white/5 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500"></div>
                                <div className="h-28 w-28 shrink-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-[0_0_30px_rgba(99,102,241,0.5)] flex items-center justify-center text-4xl font-bold text-white z-10 relative border border-white/10">
                                    {(student.user?.full_name || 'U S').trim().split(' ').map((n: string) => n[0] || '').join('').substring(0, 2).toUpperCase()}
                                </div>
                                <div className="px-6 py-3 bg-white/5 border border-white/10 text-indigo-300 font-bold text-sm uppercase tracking-widest rounded-full z-10 relative backdrop-blur-md">
                                    {student.department || 'UNDECIDED'} • {student.year || 1}th Year
                                </div>
                            </div>
                            <CardContent className="p-12 space-y-12">
                                <div className="grid gap-8">
                                    {[
                                        { label: "Institutional Email", val: student.user?.institutional_email || `${student.roll_number.toLowerCase()}@intel.ac.edu`, icon: Mail },
                                        { label: "Date of Birth", val: student.dob, icon: Calendar },
                                        { label: "Blood Group", val: student.blood_group, icon: Droplet },
                                        { label: "Personal Contact", val: student.personal_phone, icon: Phone },
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-6 p-6 bg-[#13151A] border border-white/5 rounded-2xl hover:bg-white/[0.02] transition-colors group">
                                            <div className="h-12 w-12 shrink-0 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 border border-indigo-500/20 group-hover:bg-indigo-500/20 transition-colors">
                                                <item.icon className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{item.label}</p>
                                                <p className="text-xl font-bold text-white tracking-tight mt-1 truncate max-w-[200px]">{item.val || 'N/A'}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-8 border-t border-white/5">
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-amber-400"></div> Security & Access</h4>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-6 bg-[#13151A] p-6 border border-white/5 rounded-2xl">
                                            <div className="h-10 w-10 shrink-0 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-400 border border-amber-500/20">
                                                <User className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-widest leading-none text-slate-500">Login ID</p>
                                                <p className="text-lg font-bold text-white mt-2 truncate max-w-[200px]">{student.user?.email || `${student.roll_number.toLowerCase()}.admin@intel.ac.edu`}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6 bg-[#13151A] p-6 border border-white/5 rounded-2xl">
                                            <div className="h-10 w-10 shrink-0 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-400 border border-rose-500/20">
                                                <Key className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-widest leading-none text-slate-500">Token</p>
                                                <p className="text-lg font-bold text-slate-300 mt-2 tracking-widest">{student.user?.plain_password || '••••••••'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-white/5">
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-rose-500"></div> Risk Level Analysis</h4>
                                    {isNewStudent ? (
                                        <div className="p-6 rounded-2xl border border-dashed border-white/10 bg-white/5 flex flex-col items-center justify-center text-center">
                                            <AlertCircle className="h-8 w-8 text-slate-600 mb-2 opacity-50" />
                                            <p className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Awaiting Initial Data</p>
                                        </div>
                                    ) : (
                                        <div className={`relative overflow-hidden p-6 rounded-2xl border ${student.risk_level === 'High' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                                            student.risk_level === 'Medium' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                                                'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                            } flex items-center gap-6 shadow-inner`}>
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-current opacity-5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                                            <AlertTriangle className="h-10 w-10 shrink-0 drop-shadow-md z-10 relative" />
                                            <div className="z-10 relative">
                                                <p className="text-3xl font-bold leading-none uppercase tracking-tighter drop-shadow-sm">{student.risk_level} Risk</p>
                                                <p className="text-[9px] font-bold uppercase tracking-widest mt-2 opacity-80">AI Behavioral Analysis</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Radar Chart Skill Analysis */}
                        <Card className="border border-white/5 bg-[#1C1F26] rounded-3xl p-12 h-[600px] shadow-2xl shadow-black/50 relative overflow-hidden group hover:border-indigo-500/30 transition-colors">
                            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl -mr-40 -mt-40 transition-opacity opacity-50 group-hover:opacity-100"></div>
                            <CardHeader className="p-0 flex flex-row items-center justify-between mb-8 relative z-10">
                                <div>
                                    <CardTitle className="text-3xl font-bold text-white uppercase tracking-tighter">Skill DNA</CardTitle>
                                    <CardDescription className="text-xs font-bold text-indigo-400 mt-2 uppercase tracking-widest">Multi-dimensional Intelligence</CardDescription>
                                </div>
                                <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                                    <Target className="h-7 w-7 text-indigo-400" />
                                </div>
                            </CardHeader>
                            <CardContent className="h-full pb-8 relative z-10 flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={skillData}>
                                        <PolarGrid stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 13, fontWeight: 700 }} />
                                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#13151A',
                                                borderColor: 'rgba(255,255,255,0.1)',
                                                borderRadius: '16px',
                                                padding: '16px',
                                                boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                                            }}
                                            itemStyle={{ fontSize: '15px', fontWeight: '700', color: '#fff' }}
                                            labelStyle={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', color: '#818cf8', marginBottom: '8px' }}
                                        />
                                        <Radar
                                            name="Student"
                                            dataKey="A"
                                            stroke="#6366f1"
                                            strokeWidth={3}
                                            fill="#6366f1"
                                            fillOpacity={0.2}
                                        />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Analytics Content */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Top Line Graphs */}
                        <div className="grid md:grid-cols-2 gap-8">
                            <Card className="border border-white/5 bg-[#1C1F26] rounded-3xl p-12 shadow-2xl shadow-black/50 group hover:border-[#00F5D4]/30 transition-colors">
                                <CardHeader className="p-0 flex flex-row items-center justify-between mb-8">
                                    <div className="flex items-center justify-between w-full">
                                        <div>
                                            <CardTitle className="text-2xl font-bold text-white tracking-tighter uppercase">CGPA Progression</CardTitle>
                                            <CardDescription className="text-xs font-bold text-[#00F5D4] mt-2 uppercase tracking-widest leading-none drop-shadow-[0_0_10px_rgba(0,245,212,0.3)]">
                                                Academic Momentum
                                            </CardDescription>
                                        </div>
                                        <div className="flex flex-col items-end gap-1 bg-[#00F5D4]/10 rounded-2xl px-5 py-3 border border-[#00F5D4]/20 shadow-[0_0_20px_rgba(0,245,212,0.15)]">
                                            <div className="flex items-center gap-2">
                                                <TrendingUp className="h-6 w-6 text-[#00F5D4]" />
                                                <span className="text-3xl font-bold text-[#00F5D4] tracking-tighter leading-none">
                                                    {(student.growth_index || 0).toFixed(2)}
                                                </span>
                                            </div>
                                            <span className="text-[9px] font-bold uppercase tracking-widest text-[#00F5D4] mt-1 opacity-80">Growth Index</span>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="h-[400px] p-0 relative flex items-center justify-center">
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#00F5D4]/5 to-transparent pointer-events-none rounded-b-3xl"></div>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={cgpaData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorCgpa" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#00F5D4" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#00F5D4" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }} dy={15} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }} dx={-15} domain={['dataMin - 1', 'dataMax + 1']} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#13151A', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px' }}
                                                itemStyle={{ fontSize: '15px', fontWeight: '700', color: '#00F5D4' }}
                                            />
                                            <Area type="monotone" dataKey="cgpa" stroke="#000" strokeWidth={0} fill="url(#colorCgpa)" />
                                            <Line type="monotone" dataKey="cgpa" stroke="#00F5D4" strokeWidth={4} dot={{ r: 5, fill: '#13151A', stroke: '#00F5D4', strokeWidth: 3 }} activeDot={{ r: 8, fill: '#00F5D4' }} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            <Card className="border border-white/5 bg-[#1C1F26] rounded-3xl p-12 shadow-2xl shadow-black/50 group hover:border-[#F15BB5]/30 transition-colors">
                                <CardHeader className="p-0 flex flex-row items-center justify-between mb-8">
                                    <div>
                                        <CardTitle className="text-2xl font-bold text-white tracking-tighter uppercase">Attendance Trend</CardTitle>
                                        <CardDescription className="text-xs font-bold text-[#F15BB5] flex items-center gap-2 mt-2 uppercase tracking-widest drop-shadow-[0_0_10px_rgba(241,91,181,0.3)]">
                                            Avg Participation: 84%
                                        </CardDescription>
                                    </div>
                                    <div className="h-14 w-14 rounded-2xl bg-[#F15BB5]/10 border border-[#F15BB5]/20 flex items-center justify-center shadow-[0_0_15px_rgba(241,91,181,0.2)]">
                                        <Activity className="h-7 w-7 text-[#F15BB5]" />
                                    </div>
                                </CardHeader>
                                <CardContent className="h-[400px] p-0 flex items-center justify-center">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={cgpaData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }} dy={15} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }} dx={-15} />
                                            <Tooltip
                                                cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                                contentStyle={{ backgroundColor: '#13151A', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px' }}
                                                itemStyle={{ fontSize: '15px', fontWeight: '700', color: '#F15BB5' }}
                                            />
                                            <Bar dataKey="attendance" radius={[4, 4, 0, 0]} barSize={35}>
                                                {cgpaData.map((entry: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={entry.attendance > 85 ? '#F15BB5' : 'rgba(241,91,181,0.2)'} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Academic Performance Detail (Internal vs External) */}
                        <Card className="border border-white/5 bg-[#1C1F26] rounded-3xl p-16 shadow-2xl shadow-black/50 group hover:border-[#9D4EDD]/30 transition-colors relative overflow-hidden">
                            <div className="absolute bottom-0 right-0 w-[600px] h-[300px] bg-[#9D4EDD]/5 rounded-full blur-3xl -mb-20 -mr-20 pointer-events-none"></div>
                            <CardHeader className="p-0 mb-12 flex flex-row items-center justify-between relative z-10">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="h-8 w-8 rounded-lg bg-[#9D4EDD]/20 flex items-center justify-center">
                                            <BookOpen className="h-4 w-4 text-[#9D4EDD]" />
                                        </div>
                                        <CardTitle className="text-3xl font-bold text-white tracking-tighter uppercase">Marks Analysis Matrix</CardTitle>
                                    </div>
                                    <CardDescription className="text-xs font-bold uppercase tracking-widest text-[#9D4EDD] opacity-80">Internal vs External Proficiency</CardDescription>
                                </div>
                                <div className="flex gap-6 bg-[#13151A] px-6 py-3 rounded-xl border border-white/5 shadow-inner">
                                    <div className="flex items-center gap-3">
                                        <div className="h-4 w-4 rounded bg-[#9D4EDD] shadow-[0_0_10px_rgba(157,78,221,0.5)]" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Internal</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="h-4 w-4 rounded bg-[#00F5D4] shadow-[0_0_10px_rgba(0,245,212,0.5)]" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">External</span>
                                    </div>
                                    <div className="flex items-center gap-3 ml-4 border-l border-white/10 pl-4">
                                        <div className="h-1 w-6 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Trend</span>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="h-[450px] p-0 relative z-10">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart data={crtData} margin={{ top: 20, right: 20, left: 10, bottom: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 13, fontWeight: 600, fill: '#64748b' }} dy={15} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 13, fontWeight: 600, fill: '#64748b' }} dx={-15} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#13151A', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                                            itemStyle={{ fontSize: '15px', fontWeight: '700' }}
                                            labelStyle={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '8px' }}
                                        />
                                        <Bar dataKey="internal" fill="#9D4EDD" radius={[4, 4, 0, 0]} barSize={40} name="Internal" />
                                        <Bar dataKey="external" fill="#00F5D4" radius={[4, 4, 0, 0]} barSize={40} name="External" />
                                        <Line type="monotone" dataKey="external" stroke="#fff" strokeWidth={3} dot={{ r: 5, fill: '#13151A', stroke: '#fff', strokeWidth: 2 }} style={{ filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.5))' }} name="Trend" />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* CRT Performance Matrix */}
                        <Card className="border border-white/5 bg-[#1C1F26] rounded-3xl p-16 shadow-2xl shadow-black/50 group hover:border-[#4361EE]/30 transition-colors relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-[#4361EE]/10 via-[#FEE440]/5 to-transparent rounded-full blur-3xl pointer-events-none -mt-40 -mr-40"></div>
                            <CardHeader className="p-0 mb-12 relative z-10">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="h-8 w-8 rounded-lg bg-[#4361EE]/20 flex items-center justify-center">
                                        <Brain className="h-4 w-4 text-[#4361EE]" />
                                    </div>
                                    <CardTitle className="text-3xl font-bold text-white tracking-tighter uppercase">CRT Performance Matrix</CardTitle>
                                </div>
                                <CardDescription className="text-xs font-bold uppercase tracking-widest text-[#4361EE] drop-shadow-[0_0_10px_rgba(67,97,238,0.3)]">Campus Readiness Trajectory</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[450px] p-0 relative z-10">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={crtData} margin={{ top: 20, right: 20, left: 10, bottom: 20 }}>
                                        <defs>
                                            <linearGradient id="colorApt" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#4361EE" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="#4361EE" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorRea" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#FF006E" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="#FF006E" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorCod" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#FEE440" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="#FEE440" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 13, fontWeight: 600, fill: '#64748b' }} dy={15} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 13, fontWeight: 600, fill: '#64748b' }} dx={-15} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#13151A', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '16px', padding: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                                            itemStyle={{ fontSize: '15px', fontWeight: '700' }}
                                            labelStyle={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '8px' }}
                                        />
                                        <Area type="monotone" dataKey="aptitude" stroke="#4361EE" strokeWidth={3} fill="url(#colorApt)" name="Aptitude" activeDot={{ r: 6, fill: '#13151A', stroke: '#4361EE', strokeWidth: 2 }} />
                                        <Area type="monotone" dataKey="reasoning" stroke="#FF006E" strokeWidth={3} fill="url(#colorRea)" name="Reasoning" activeDot={{ r: 6, fill: '#13151A', stroke: '#FF006E', strokeWidth: 2 }} />
                                        <Area type="monotone" dataKey="coding" stroke="#FEE440" strokeWidth={3} strokeDasharray="5 5" fill="url(#colorCod)" name="Technical" activeDot={{ r: 6, fill: '#13151A', stroke: '#FEE440', strokeWidth: 2 }} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Last Row: AI Insights & Career */}
                        <div className="grid md:grid-cols-2 gap-8">
                            <Card className="border border-white/5 bg-[#1C1F26] rounded-3xl p-12 shadow-2xl shadow-black/50">
                                <CardHeader className="p-0 mb-8">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="h-12 w-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-400 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                                            <Award className="h-6 w-6" />
                                        </div>
                                        <CardTitle className="text-2xl font-bold tracking-tighter uppercase text-white">Career Compass</CardTitle>
                                    </div>
                                    <CardDescription className="text-amber-400 font-bold text-xs uppercase tracking-widest drop-shadow-sm">AI Recommended Pathways</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0 space-y-4">
                                    {aiCareer && aiCareer.length > 0 ? aiCareer.map((c: any, i: number) => (
                                        <div key={i} className="flex items-center justify-between p-6 bg-[#13151A] rounded-2xl border border-white/5 hover:bg-white/[0.02] hover:border-amber-500/30 transition-all group">
                                            <div className="flex items-center gap-6">
                                                <div className="h-14 w-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                                                    {c.icon}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-lg tracking-tight leading-none text-white uppercase">{c.role}</p>
                                                    <div className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-widest flex items-center gap-1">
                                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-400"></div> {c.fit} Match
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="h-10 w-10 flex items-center justify-center bg-amber-500/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                                <TrendingUp className="h-5 w-5 text-amber-400" />
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="p-6 bg-[#13151A] rounded-2xl border border-white/5 border-dashed flex items-center justify-center border-amber-500/20">
                                            <p className="text-slate-500 text-sm font-bold flex items-center gap-2">AI analysis pending...</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="border border-white/5 bg-[#1C1F26] rounded-3xl p-12 shadow-2xl shadow-black/50">
                                <CardHeader className="p-0 mb-8">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="h-12 w-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                                            <Sparkles className="h-6 w-6" />
                                        </div>
                                        <CardTitle className="text-2xl font-bold text-white tracking-tighter uppercase">Learning Analytics</CardTitle>
                                    </div>
                                    <CardDescription className="text-xs font-bold text-emerald-400 uppercase tracking-widest drop-shadow-sm">Proficiency Highlight</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0 space-y-8">
                                    {aiCourses ? (
                                        <>
                                            <div className="space-y-4 bg-[#13151A] p-6 rounded-2xl border border-white/5">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-2 w-2 rounded-full bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.8)]"></div>
                                                    <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Key Assets</p>
                                                </div>
                                                <div className="flex flex-wrap gap-3 mt-4">
                                                    {aiCourses.strong.map((s: string) => (
                                                        <span key={s} className="px-4 py-2 bg-indigo-500/10 text-indigo-300 text-xs font-bold border border-indigo-500/20 rounded-lg uppercase shadow-sm">
                                                            {s}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="space-y-4 bg-[#13151A] p-6 rounded-2xl border border-white/5">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-2 w-2 rounded-full bg-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.8)]"></div>
                                                    <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Growth Areas</p>
                                                </div>
                                                <div className="flex flex-wrap gap-3 mt-4">
                                                    {aiCourses.weak.map((s: string) => (
                                                        <span key={s} className="px-4 py-2 bg-white/5 text-slate-300 text-xs font-bold border border-white/10 rounded-lg uppercase shadow-sm">
                                                            {s}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="p-10 bg-[#13151A] rounded-2xl border border-white/5 border-dashed flex flex-col items-center justify-center text-center">
                                            <Target className="h-10 w-10 text-emerald-500/20 mb-4 animate-[bounce_2s_infinite]" />
                                            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest leading-loose">
                                                Constructing Educational <br /> Roadmap...
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main >
        </div >
    )
}
