"use client"

import React, { useState, useEffect } from 'react';
import {
    ShieldCheck, Activity, Layers, Zap, UserCheck, TrendingUp,
    AlertTriangle, Cpu, Crosshair, GraduationCap, Users,
    Briefcase, Award, Brain, BarChart3, PieChart as PieChartIcon,
    ArrowUpRight, Target, Flame, Lightbulb, CheckCircle2,
    Calendar, Library, BookOpen, Clock, Settings2, Sparkles,
    FileText, Share2, Download, TrendingDown, LayoutDashboard,
    AlertCircle, GraduationCap as GradIcon, UserPlus, Send
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis,
    PolarRadiusAxis, Radar, LineChart, Line, Legend
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const DEPARTMENTS = [
    "ALL", "AGRI", "AIDS", "AIML", "BME", "BT", "CIVIL", "CSE", "ECE", "EEE",
    "EIE", "FD", "FT", "IT", "MECH", "MECHATRONICS"
];

export default function DepartmentalTab() {
    const [selectedDept, setSelectedDept] = useState("ALL");
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [interventionModal, setInterventionModal] = useState({ isOpen: false, subject: null as any });

    useEffect(() => {
        const fetchInsights = async () => {
            if (!selectedDept) return;
            setLoading(true);

            const getApiUrl = (path: string) => {
                // Force 127.0.0.1 to avoid localhost resolution issues on some Windows setups
                return `http://127.0.0.1:8000${path}`;
            };

            try {
                const token = localStorage.getItem('token');
                const url = getApiUrl(`/admin/department-insights?department=${selectedDept}`);
                const res = await fetch(url, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    setData(await res.json());
                }
            } catch (err) {
                console.error("Failed to fetch department insights", err);
            } finally {
                setLoading(false);
            }
        };
        fetchInsights();
    }, [selectedDept]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-32 gap-8">
            <div className="relative">
                <TrendingUp className="h-20 w-20 text-indigo-400 animate-spin" />
            </div>
            <p className="text-xl font-bold text-slate-200 tracking-widest uppercase">Initializing Departmental Data...</p>
        </div>
    );

    if (!data) return <div className="p-20 text-center font-bold text-rose-500 bg-rose-50 rounded-none border border-rose-100">Neural Sync Failed. Please refresh.</div>;

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 w-full mx-auto pb-32 pt-16">

            {/* SECTION 1: DEPARTMENT OVERVIEW HEADER */}
            <div className="neon-card relative overflow-hidden group p-8 lg:p-12 mb-10 bg-gradient-to-br from-[#1C1F26] to-[#13151A]">

                <div className="relative z-10 flex flex-col xl:flex-row items-center justify-between gap-12">
                    <div className="flex items-center gap-8">
                        <div className="h-24 w-24 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-[0_0_20px_rgba(79,70,229,0.15)]">
                            <Brain className="h-12 w-12 text-indigo-400" />
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <span className="px-3 py-1 bg-white/5 text-slate-300 text-[10px] font-bold uppercase tracking-widest border border-white/10 rounded-full">Department Node</span>
                                <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_10px_rgba(79,70,229,0.8)]"></div>
                            </div>
                            <div className="flex flex-col">
                                <select
                                    className="text-4xl md:text-5xl font-bold bg-transparent border-none outline-none cursor-pointer tracking-tight text-white focus:ring-0 appearance-none"
                                    value={selectedDept}
                                    onChange={(e) => setSelectedDept(e.target.value)}
                                >
                                    {DEPARTMENTS.map(d => <option key={d} value={d} className="text-base font-medium bg-[#13151A] text-slate-200">{d === "ALL" ? "GLOBAL" : d} ENGINE</option>)}
                                </select>
                                <p className="text-sm font-semibold text-slate-400 mt-2 flex items-center gap-2">
                                    <UserCheck className="h-4 w-4 text-indigo-400" />
                                    HOD: <span className="text-white">{data.metrics.hod_name}</span>
                                    <span className="mx-2 opacity-20">|</span>
                                    <Users className="h-4 w-4 text-indigo-400" />
                                    Faculty: <span className="text-white">{data.metrics.total_faculty} Nodes</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-10 items-center justify-center xl:justify-end">
                        <div className="text-right space-y-2">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Dept Health Score</p>
                            <div className="flex items-center gap-4 justify-end">
                                <div className="h-2 w-32 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${data.metrics.ai_health_score}%` }}
                                        className="h-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                                    ></motion.div>
                                </div>
                                <span className="text-4xl font-black text-white tracking-tight">{data.metrics.ai_health_score}</span>
                            </div>
                        </div>

                        <div className="h-16 w-[1px] bg-white/10 hidden md:block"></div>

                        <div className="flex flex-col items-end gap-2">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Placement Forecast</p>
                            <div className="flex items-center gap-3">
                                <TrendingUp className="h-5 w-5 text-purple-400" />
                                <span className="text-3xl font-black text-white tracking-tight">{data.metrics.placement_forecast_percent}%</span>
                            </div>
                        </div>

                        <motion.div
                            animate={{ scale: [1, 1.02, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className={cn(
                                "px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest border flex items-center gap-3 backdrop-blur-sm shadow-xl",
                                data.metrics.stability_indicator === 'Stable' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]" :
                                    data.metrics.stability_indicator === 'Monitoring' ? "bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.15)]" :
                                        "bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.15)]"
                            )}>
                            <Activity className="h-4 w-4" />
                            {data.metrics.stability_indicator}
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* SECTION 2: ACADEMIC CORE ANALYTICS */}
            {/* SECTION 2: ACADEMIC CORE ANALYTICS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
                <div className="lg:col-span-8">
                    <Card className="neon-card h-full">
                        <CardHeader className="p-8 border-b border-white/5 bg-white/5 flex flex-row items-center justify-between">
                            <div className="space-y-1">
                                <CardTitle className="text-2xl font-bold text-white tracking-tight">Subject Intelligence Dashboard</CardTitle>
                                <CardDescription className="text-xs font-medium text-slate-400 uppercase tracking-widest">Core depth vs external gap analytics</CardDescription>
                            </div>
                            <div className="flex gap-3">
                                <Badge color="emerald">Core</Badge>
                                <Badge color="blue">Non-Core</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 space-y-8">
                            {data.subjects.map((s: any, i: number) => (
                                <motion.div key={i} className="space-y-3 bg-white/5 p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                                    <div className="flex justify-between items-end">
                                        <div className="flex items-center gap-5">
                                            <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center border shadow-inner", s.is_core ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-blue-500/10 border-blue-500/20 text-blue-400")}>
                                                {s.is_core ? <Zap className="h-5 w-5" /> : <Layers className="h-5 w-5" />}
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-bold text-white tracking-tight">{s.subject_name}</h4>
                                                <div className="flex items-center gap-4 mt-1">
                                                    <span className="text-xs font-medium text-slate-500">Backlog Rate: <span className="text-rose-400 font-bold">{s.backlog_rate}%</span></span>
                                                    <span className="text-xs font-medium text-amber-400">Ext. Gap: <span className="text-amber-400 font-bold">{s.internal_external_gap}%</span></span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-3">
                                            <div className="text-right">
                                                <p className="text-2xl font-black text-white tracking-tighter">{s.pass_percentage}%</p>
                                                <p className={cn("text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border mt-1", s.is_most_difficult ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20")}>
                                                    {s.is_most_difficult ? "Intervention Needed" : "Stable Perform"}
                                                </p>
                                            </div>
                                            {s.pass_percentage < 70 && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => setInterventionModal({ isOpen: true, subject: s })}
                                                    className="h-8 bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg px-4 border border-rose-400/50 shadow-[0_0_15px_rgba(244,63,94,0.3)] transition-all flex items-center gap-2 group"
                                                >
                                                    <AlertCircle className="h-3 w-3 group-hover:animate-pulse" />
                                                    Initiate Intervention
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                        <motion.div initial={{ width: 0 }} animate={{ width: `${s.pass_percentage}%` }} className={cn("h-full transition-all duration-1000", s.is_most_difficult ? "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]" : "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]")} />
                                    </div>
                                </motion.div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-4 flex flex-col gap-8">
                    <Card className="neon-card flex-grow relative overflow-hidden group p-8 bg-gradient-to-br from-[#1C1F26] to-[#13151A]">
                        <div className="absolute -top-10 -right-10 opacity-5 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-12">
                            <TrendingUp className="h-64 w-64 text-purple-500" />
                        </div>
                        <div className="relative z-10 space-y-8">
                            <div className="space-y-2">
                                <span className="px-3 py-1 bg-purple-500/10 text-purple-400 text-[10px] font-bold uppercase tracking-widest border border-purple-500/20 rounded-full inline-block mb-2">Growth Intelligence</span>
                                <h3 className="text-3xl font-bold tracking-tight text-white leading-tight">Academic Momentum</h3>
                            </div>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-xs font-semibold text-slate-400 tracking-widest uppercase">
                                        <span>Growth Index</span>
                                        <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">+12%</span>
                                    </div>
                                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                        <motion.div initial={{ width: 0 }} animate={{ width: '82%' }} className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.6)]" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-xs font-semibold text-slate-400 tracking-widest uppercase">
                                        <span>Consistency Score</span>
                                        <span className="text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">94%</span>
                                    </div>
                                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                        <motion.div initial={{ width: 0 }} animate={{ width: '94%' }} className="h-full bg-gradient-to-r from-blue-600 to-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.6)]" />
                                    </div>
                                </div>
                            </div>
                            <div className="pt-6 border-t border-white/10 grid grid-cols-2 gap-4">
                                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                    <p className="text-3xl font-black text-white tracking-tighter">8.01</p>
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mt-1">Avg CGPA</p>
                                </div>
                                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                    <p className="text-3xl font-black text-white tracking-tighter">6.5%</p>
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mt-1">Volatility</p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="neon-card p-6 border-l-4 border-l-amber-500 bg-[#1C1F26]">
                        <div className="flex items-center gap-5">
                            <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                                <Sparkles className="h-6 w-6 text-amber-500" />
                            </div>
                            <p className="text-lg font-medium text-slate-200 leading-relaxed">
                                "Subject-wise external gap is narrowing, indicating improved pedagogical alignment."
                            </p>
                        </div>
                    </Card>
                </div>
            </div>

            {/* SECTION 3: STUDENT SEGMENTATION */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h3 className="text-2xl font-bold text-white tracking-tight">AI Student Segmentation</h3>
                        <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">Autonomous clustering Based on Cognitive Archetypes</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {data.micro_segments.map((seg: any, i: number) => (
                        <div key={i} className="neon-card p-8 group transition-all duration-500 hover:shadow-[0_0_30px_rgba(79,70,229,0.1)]">
                            <div className="flex justify-between items-start mb-6">
                                <span className={cn(
                                    "px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border",
                                    seg.cluster_name === 'High Achievers' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                        seg.cluster_name === 'Critical Zone' ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                                            "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                )}>
                                    {seg.cluster_name}
                                </span>
                                <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:bg-indigo-500/10 group-hover:text-indigo-400 group-hover:border-indigo-500/20 transition-all text-slate-400">
                                    <Users className="h-5 w-5" />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-4xl font-black text-white tracking-tighter">{seg.count}</h4>
                                    <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mt-1">Total Nodes</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {seg.trend_change.startsWith('+') ? <TrendingUp className="h-4 w-4 text-emerald-400" /> : <TrendingDown className="h-4 w-4 text-rose-400" />}
                                    <span className={cn("text-xs font-bold", seg.trend_change.startsWith('+') ? "text-emerald-400" : "text-rose-400")}>{seg.trend_change} from last sem</span>
                                </div>
                                <div className="pt-5 border-t border-white/5 space-y-4">
                                    <SegmentProgress label="Skill Gap" value={seg.core_weak_count} total={seg.count} color="rose" />
                                    <SegmentProgress label="Attendance" value={seg.attendance_risk_count} total={seg.count} color="blue" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* SECTION 4: PLACEMENT INTELLIGENCE */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 mb-10">
                <div className="xl:col-span-5">
                    <Card className="neon-card p-8 h-full bg-[#1C1F26]">
                        <div className="space-y-8">
                            <div className="space-y-1">
                                <CardTitle className="text-2xl font-bold text-white tracking-tight">Placement Eligibility</CardTitle>
                                <CardDescription className="text-xs font-medium text-slate-400 uppercase tracking-widest">Institutional Dream-Offer Mapping</CardDescription>
                            </div>

                            <div className="space-y-8">
                                <EligibilityBar label="IT Services Companies" value={82} icon={<Cpu />} color="blue" sub="TCS, Infosys, Wipro Ready" />
                                <EligibilityBar label="Product / Dream Companies" value={34} icon={<Sparkles />} color="amber" sub="Amazon, Google, Microsoft Pipeline" />
                                <EligibilityBar label="Core Engineering Roles" value={48} icon={<Settings2 />} color="emerald" sub="Dept Specific Core Alignment" />
                                <EligibilityBar label="Higher Studies / Research" value={data.advanced_ai.higher_studies_percent} icon={<GraduationCap />} color="purple" sub="GATE, GRE, Research Oriented" />
                            </div>

                            <div className="p-6 rounded-2xl bg-white/5 flex items-center justify-between border border-white/5">
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">Company Eligibility Count</p>
                                    <p className="text-3xl font-black text-white tracking-tighter">42 Streams</p>
                                </div>
                                <div className="h-14 w-14 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                                    <Briefcase className="h-7 w-7 text-indigo-400" />
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="xl:col-span-7">
                    <Card className="neon-card p-8 h-full bg-[#1C1F26]">
                        <div className="space-y-8">
                            <div className="flex justify-between items-center">
                                <div className="space-y-1">
                                    <CardTitle className="text-2xl font-bold text-white tracking-tight">Skill Gap Analysis</CardTitle>
                                    <CardDescription className="text-xs font-medium text-slate-400 uppercase tracking-widest">Core vs. IT Readiness breakdown</CardDescription>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">Dept skill score</p>
                                    <p className="text-3xl font-black text-emerald-400 tracking-tighter">{data.metrics.skill_gap_index_core_it}%</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <SkillMetricCard label="Coding Proficiency" value={data.metrics.coding_readiness} color="emerald" icon={<Cpu />} trend="+5.2%" />
                                <SkillMetricCard label="Communication" value={data.metrics.communication_readiness} color="blue" icon={<Users />} trend="+2.1%" />
                                <SkillMetricCard label="Aptitude & Logic" value={78.5} color="purple" icon={<Brain />} trend="+8.4%" />
                                <SkillMetricCard label="Core Technical" value={data.metrics.core_skill_depth} color="amber" icon={<Settings2 />} trend="+3.0%" />
                            </div>

                            <div className="relative p-6 rounded-2xl bg-indigo-500/10 overflow-hidden border border-indigo-500/20">
                                <div className="relative z-10 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Lightbulb className="h-5 w-5 text-indigo-400" />
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">AI Strategy Recommendation</p>
                                    </div>
                                    <p className="text-lg font-medium text-indigo-100 leading-relaxed">
                                        "Increase focus on coding bootcamps for 3rd Year students to capture the upcoming hiring surge."
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* SECTION 5: FACULTY IMPACT ANALYTICS */}
            <Card className="neon-card overflow-hidden bg-[#1C1F26] mb-10">
                <CardHeader className="p-8 border-b border-white/5 bg-white/5">
                    <div className="space-y-1">
                        <CardTitle className="text-2xl font-bold text-white tracking-tight">Faculty Impact Scorecard</CardTitle>
                        <CardDescription className="text-xs font-medium text-slate-400 uppercase tracking-widest">Subject Handling Efficiency & Sentiment summary</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/5 bg-[#13151A]">
                                    <th className="px-8 py-5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Faculty Node</th>
                                    <th className="px-8 py-5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Impact Score</th>
                                    <th className="px-8 py-5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Subject Sync</th>
                                    <th className="px-8 py-5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">AI Sentiment / Suggestion</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {data.faculty.map((f: any, i: number) => (
                                    <tr key={i} className="group hover:bg-white/5 transition-all duration-300">
                                        <td className="px-8 py-6">
                                            <div className="text-white font-bold">{f.faculty_name}</div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="text-white">{f.teaching_impact_score}%</div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="text-white">{f.subject_comparison_score}%</div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="text-slate-200 text-lg">"{f.feedback_summary_ai}"</div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>



            {/* SECTION 8: AI WEEKLY INTELLIGENCE REPORT */}
            <Card className="neon-card overflow-hidden bg-[#1C1F26] p-0 border border-white/5 mb-10">
                <div className="flex flex-col xl:flex-row">
                    <div className="xl:w-1/3 bg-indigo-500/10 text-white p-14 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-10 opacity-10">
                            <FileText className="h-48 w-48 text-indigo-400" />
                        </div>
                        <div className="relative z-10 space-y-8">
                            <div className="space-y-4">
                                <span className="px-5 py-2 border border-indigo-500/20 bg-indigo-500/20 text-indigo-300 font-black text-[10px] uppercase tracking-[0.4em] rounded-full">Automatic Report</span>
                                <h2 className="text-5xl font-black uppercase tracking-tighter leading-none text-white">AI Weekly Intelligence</h2>
                            </div>
                            <p className="text-xl font-semibold opacity-80 leading-relaxed text-indigo-200">
                                Institutional decision-ready summary generated using autonomous processing.
                            </p>
                            <div className="flex flex-col gap-4 pt-10">
                                <Button className="h-16 rounded-xl bg-indigo-500 text-white hover:bg-indigo-600 font-black text-xs uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(99,102,241,0.4)] border-none flex gap-4 transition-all">
                                    <Download className="h-5 w-5" /> Download PDF Report
                                </Button>
                                <Button variant="outline" className="h-16 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 hover:text-white font-black text-xs uppercase tracking-[0.2em] flex gap-4 transition-all bg-transparent">
                                    <Share2 className="h-5 w-5" /> Share to HOD
                                </Button>
                            </div>
                        </div>
                    </div>
                    <div className="xl:w-2/3 p-14 flex flex-col justify-center bg-[#13151A]">
                        <div className="space-y-12">
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 border border-white/5 bg-white/5 rounded-xl flex items-center justify-center text-slate-300">
                                        <Lightbulb className="h-5 w-5" />
                                    </div>
                                    <h5 className="text-2xl font-black text-white uppercase tracking-tighter">Strategic Summary</h5>
                                </div>
                                <p className="text-2xl font-semibold text-white leading-relaxed">
                                    "{data.weekly_report.summary}"
                                </p>
                            </div>

                            <div className="h-px w-full bg-white/5" />

                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 border border-emerald-500/20 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400">
                                        <CheckCircle2 className="h-5 w-5" />
                                    </div>
                                    <h5 className="text-2xl font-black text-white uppercase tracking-tighter">Recommended Action</h5>
                                </div>
                                <p className="text-2xl font-semibold text-white leading-relaxed">
                                    "{data.weekly_report.recommendation}"
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* SECTION 9: COMPARATIVE ANALYTICS */}
            <div className="space-y-8 mb-10">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h3 className="text-2xl font-bold text-white tracking-tight">Comparative Performance Hub</h3>
                        <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">Institutional benchmark vs Departmental Reality</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8">
                        <Card className="neon-card bg-[#1C1F26] p-8 h-full border border-white/5">
                            <div className="h-[400px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data.comparative_analysis} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                                        <XAxis
                                            dataKey="metric"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                                            className="uppercase"
                                        />
                                        <YAxis hide />
                                        <Tooltip
                                            cursor={{ fill: '#ffffff05' }}
                                            contentStyle={{ backgroundColor: '#13151A', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', padding: '20px', color: '#fff' }}
                                        />
                                        <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontWeight: 600, textTransform: 'uppercase', fontSize: '10px', color: '#94a3b8' }} />
                                        <Bar dataKey="dept_value" name="Department" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                                        <Bar dataKey="inst_value" name="Institution" fill="#334155" radius={[4, 4, 0, 0]} barSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </div>

                    <div className="lg:col-span-4 grid grid-cols-1 gap-6">
                        {data.comparative_analysis.map((item: any, idx: number) => (
                            <div key={idx} className="p-6 rounded-2xl bg-[#1C1F26] border border-white/5 flex items-center justify-between group hover:border-white/10 transition-colors">
                                <div>
                                    <p className="text-base font-bold text-white uppercase tracking-widest">{item.metric}</p>
                                    <h5 className="text-2xl font-bold tracking-tight mt-2">
                                        {item.dept_value > item.inst_value ? <span className="text-emerald-400">Outperforming</span> : <span className="text-rose-400">Lagging</span>}
                                    </h5>
                                </div>
                                <div className={cn(
                                    "h-16 w-16 rounded-xl border flex items-center justify-center font-bold text-xl shadow-sm",
                                    item.dept_value > item.inst_value ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                )}>
                                    {Math.round(((item.dept_value - item.inst_value) / item.inst_value) * 100)}%
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* BLOCK 10: DEPARTMENT STRATEGIC KPI PANEL */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 pt-10 border-t border-white/5">
                <KPICard label="Graduation Rate" value={`${data.advanced_ai.graduation_rate}%`} icon={<GraduationCap />} />
                <KPICard label="Avg Placement Time" value={`${data.advanced_ai.avg_time_to_placement}m`} icon={<Clock />} />
                <KPICard label="Startup Founders" value={data.advanced_ai.startup_founders_count} icon={<RocketIcon />} />
                <KPICard label="Research Papers" value={data.advanced_ai.research_paper_count} icon={<FileText />} />
                <KPICard label="Higher Studies" value={`${data.advanced_ai.higher_studies_percent}%`} icon={<Library />} />
            </div>

            {/* INTERVENTION MODAL */}
            <Dialog
                isOpen={interventionModal.isOpen}
                onClose={() => setInterventionModal({ isOpen: false, subject: null })}
                title="Strategic Academic Intervention"
                description="Automated remedial workflow for low-performing nodes"
            >
                {interventionModal.subject && (
                    <div className="space-y-8 py-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Subject</p>
                                <p className="text-lg font-bold text-white truncate">{interventionModal.subject.subject_name}</p>
                            </div>
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Performance</p>
                                <p className="text-2xl font-black text-rose-400">{interventionModal.subject.pass_percentage}%</p>
                            </div>
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Backlog</p>
                                <p className="text-2xl font-black text-amber-400">{interventionModal.subject.backlog_rate}%</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-xs font-bold uppercase text-slate-400 tracking-[0.2em] mb-4">Recommended Actions</h4>

                            <Button
                                onClick={() => {
                                    console.log(`Action: Schedule Remedial Classes for ${interventionModal.subject.subject_name}`);
                                    alert(`Remedial workflow initiated for ${interventionModal.subject.subject_name}`);
                                }}
                                className="w-full h-16 bg-[#13151A] hover:bg-[#1C1F26] border border-indigo-500/30 text-white flex items-center justify-between px-8 rounded-2xl group transition-all"
                            >
                                <div className="flex items-center gap-5">
                                    <div className="h-10 w-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/20">
                                        <Calendar className="h-5 w-5" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-bold uppercase tracking-tight">Schedule Remedial Classes</p>
                                        <p className="text-[10px] text-slate-500 font-medium">Create extra sessions & notify faculty</p>
                                    </div>
                                </div>
                                <ArrowUpRight className="h-5 w-5 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                            </Button>

                            <Button
                                onClick={() => console.log(`Action: Assign Faculty Mentor for ${interventionModal.subject.subject_name}`)}
                                className="w-full h-16 bg-[#13151A] hover:bg-[#1C1F26] border border-emerald-500/30 text-white flex items-center justify-between px-8 rounded-2xl group transition-all"
                            >
                                <div className="flex items-center gap-5">
                                    <div className="h-10 w-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20">
                                        <UserPlus className="h-5 w-5" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-bold uppercase tracking-tight">Assign Faculty Mentor</p>
                                        <p className="text-[10px] text-slate-500 font-medium">Link specialists to high-risk students</p>
                                    </div>
                                </div>
                                <ArrowUpRight className="h-5 w-5 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                            </Button>

                            <Button
                                onClick={() => console.log(`Action: Generate Study Plan for ${interventionModal.subject.subject_name}`)}
                                className="w-full h-16 bg-[#13151A] hover:bg-[#1C1F26] border border-purple-500/30 text-white flex items-center justify-between px-8 rounded-2xl group transition-all"
                            >
                                <div className="flex items-center gap-5">
                                    <div className="h-10 w-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400 group-hover:bg-purple-500/20">
                                        <Sparkles className="h-5 w-5" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-bold uppercase tracking-tight">Generate AI Study Plan</p>
                                        <p className="text-[10px] text-slate-500 font-medium">Autonomous weekly roadmap generation</p>
                                    </div>
                                </div>
                                <ArrowUpRight className="h-5 w-5 text-slate-600 group-hover:text-purple-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                            </Button>

                            <Button
                                onClick={() => console.log(`Action: Notify Students for ${interventionModal.subject.subject_name}`)}
                                className="w-full h-16 bg-[#13151A] hover:bg-[#1C1F26] border border-white/10 text-white flex items-center justify-between px-8 rounded-2xl group transition-all"
                            >
                                <div className="flex items-center gap-5">
                                    <div className="h-10 w-10 bg-white/5 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-white/10 group-hover:text-white">
                                        <Send className="h-5 w-5" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-bold uppercase tracking-tight">Notify Affected Students</p>
                                        <p className="text-[10px] text-slate-500 font-medium">Broadcast alert to candidate dashboards</p>
                                    </div>
                                </div>
                                <ArrowUpRight className="h-5 w-5 text-slate-600 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                            </Button>
                        </div>
                    </div>
                )}
            </Dialog>

        </div >
    );
}

// --- Helper UI Components ---

function Badge({ children, color }: { children: string, color: string }) {
    const colors: any = {
        emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        rose: "bg-rose-500/10 text-rose-400 border-rose-500/20"
    };
    return (
        <span className={cn("px-4 py-1.5 rounded-none text-[10px] font-black uppercase tracking-widest border", colors[color])}>
            {children}
        </span>
    );
}

function SegmentProgress({ label, value, total, color }: any) {
    const colors: any = {
        rose: "bg-rose-500",
        blue: "bg-blue-500",
        emerald: "bg-emerald-500"
    };
    const percent = Math.round((value / total) * 100);
    return (
        <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-300">
                <span>{label}</span>
                <span className="text-white">{percent}%</span>
            </div>
            <div className="h-1.5 w-full bg-white/10 border border-white/5 overflow-hidden rounded-full">
                <motion.div initial={{ width: 0 }} animate={{ width: `${percent}%` }} className={cn("h-full rounded-full", colors[color])} />
            </div>
        </div>
    );
}

function EligibilityBar({ label, value, icon, color, sub }: any) {
    const barColors: any = {
        blue: "bg-blue-500",
        amber: "bg-amber-500",
        emerald: "bg-emerald-500",
        purple: "bg-purple-500"
    };
    const iconColors: any = {
        blue: "text-blue-400 bg-blue-500/10 border border-blue-500/20",
        amber: "text-amber-400 bg-amber-500/10 border border-amber-500/20",
        emerald: "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20",
        purple: "text-purple-400 bg-purple-500/10 border border-purple-500/20"
    };
    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", iconColors[color])}>
                        {React.cloneElement(icon, { className: "h-5 w-5" })}
                    </div>
                    <div>
                        <p className="font-black text-white text-sm uppercase tracking-tighter">{label}</p>
                        <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">{sub}</p>
                    </div>
                </div>
                <p className="text-3xl font-black text-white tracking-tighter">{value}%</p>
            </div>
            <div className="h-2.5 w-full bg-white/10 border border-white/5 overflow-hidden rounded-full">
                <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} className={cn("h-full rounded-full shadow-[0_0_10px_rgba(255,255,255,0.2)]", barColors[color])} />
            </div>
        </div>
    );
}

function SkillMetricCard({ label, value, color, icon, trend }: any) {
    const colors: any = {
        emerald: { bar: "bg-emerald-500", icon: "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20" },
        blue: { bar: "bg-indigo-500", icon: "text-indigo-400 bg-indigo-500/10 border border-indigo-500/20" },
        purple: { bar: "bg-purple-500", icon: "text-purple-400 bg-purple-500/10 border border-purple-500/20" },
        amber: { bar: "bg-amber-500", icon: "text-amber-400 bg-amber-500/10 border border-amber-500/20" }
    };
    return (
        <div className="p-6 rounded-2xl bg-[#13151A] border border-white/5 hover:border-indigo-500/30 hover:bg-white/[0.02] transition-colors group">
            <div className="flex justify-between items-start mb-6">
                <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center transition-all", colors[color].icon)}>
                    {React.cloneElement(icon, { className: "h-5 w-5" })}
                </div>
                <span className="text-[10px] font-bold text-white bg-white/5 border border-white/10 rounded-md px-2 py-1 flex items-center gap-1 group-hover:border-indigo-500/20">
                    <TrendingUp className="h-3 w-3 text-emerald-400" />
                    {trend}
                </span>
            </div>
            <div className="space-y-4">
                <div>
                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</h5>
                    <p className="text-4xl font-bold text-white tracking-tighter mt-1">{value}%</p>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} className={cn("h-full rounded-full shadow-[0_0_10px_rgba(255,255,255,0.2)]", colors[color].bar)} />
                </div>
            </div>
        </div>
    );
}



function KPICard({ label, value, icon }: any) {
    return (
        <div className="flex items-center gap-5 p-6 rounded-2xl bg-[#1C1F26] border border-white/5 group hover:border-white/10 transition-colors">
            <div className="h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/20 transition-all shadow-sm">
                {React.cloneElement(icon, { className: "h-5 w-5" })}
            </div>
            <div>
                <p className="text-2xl font-black text-white tracking-tight leading-none">{value}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{label}</p>
            </div>
        </div>
    );
}

function RocketIcon() {
    return (
        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
            <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
            <path d="M9 12H4s.5-1 1-4c1.5 0 3 .5 3 .5L12 9" />
            <path d="M12 15v5s1-.5 4-1c0-1.5-.5-3-.5-3L15 12" />
        </svg>
    )
}
