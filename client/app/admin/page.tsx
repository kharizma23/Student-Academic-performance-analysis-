"use client"
import { useEffect, useState, useMemo } from "react"
import React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Dialog } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
    Users,
    GraduationCap,
    Target,
    Award,
    AlertTriangle,
    TrendingUp,
    Layers,
    Briefcase,
    Activity,
    BarChart3,
    Zap,
    RefreshCw,
    Search,
    ShieldCheck,
    ChevronRight,
    ArrowUpRight,
    TrendingDown,
    Trash2,
    UserCircle,
    FileText,
    Mail,
    Bell,
    Globe,
    LayoutGrid,
    Loader2
} from "lucide-react"
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    BarChart,
    Bar
} from "recharts"
import DepartmentalTab from "@/components/DepartmentalTab"

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

const COLORS = ['#9D4EDD', '#4361EE', '#00F5D4', '#F15BB5', '#FEE440', '#FF006E'];

const DEPARTMENTS = [
    "AGRI", "AIDS", "AIML", "BME", "BT", "CIVIL", "CSE", "ECE", "EEE",
    "EIE", "FD", "FT", "IT", "MECH", "MECHATRONICS"
];

// --- Helper Components for Interactivity ---

function InterventionModal({ isOpen, onClose, cluster }: { isOpen: boolean, onClose: () => void, cluster: any }) {
    if (!cluster) return null;
    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            title={`Intervention Strategy: ${cluster.name}`}
            description="Tailored clinical and academic steps recommended by AI for this segment."
        >
            <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-8">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Target Count</p>
                        <p className="text-2xl font-bold text-white">{cluster.count} Students</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                        <p className="text-sm font-bold text-rose-400 uppercase tracking-widest mb-1">Priority Level</p>
                        <p className="text-2xl font-bold text-rose-500">Critical</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <h4 className="font-bold text-slate-400 flex items-center gap-4 uppercase text-sm tracking-widest">
                        <div className="h-3 w-3 shrink-0 rounded-full bg-indigo-500" />
                        AI Recommended Actions
                    </h4>
                    <ul className="space-y-3">
                        {[
                            "Mandatory 1-on-1 performance review with Department HOD.",
                            "Enrolment in the 'Back-on-Track' Peer Mentoring program.",
                            "Bi-weekly counseling sessions to address academic stress levels.",
                            "Customized learning pathway with reduced extracurricular load."
                        ].map((task, i) => (
                            <li key={i} className="flex items-start gap-6 p-4 bg-[#13151A] text-sm font-medium text-slate-300 border border-white/5 rounded-xl">
                                <ShieldCheck className="h-6 w-6 text-indigo-400 shrink-0 mt-0.5" />
                                {task}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="space-y-4">
                    <h4 className="font-bold text-rose-500 flex items-center gap-4 uppercase text-sm tracking-widest">
                        <div className="h-3 w-3 shrink-0 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
                        Primary Impacted Students
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-xs font-bold uppercase text-slate-300">
                        {["Roll #737622CSE101", "Roll #737622CSE142", "Roll #737622CSE189", "Roll #737622CSE204"].map(roll => (
                            <div key={roll} className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer">
                                <span>{roll}</span>
                                <ChevronRight className="h-4 w-4 shrink-0 text-slate-500" />
                            </div>
                        ))}
                    </div>
                </div>

                <Button className="w-full bg-indigo-500 text-white rounded-xl h-14 text-xs uppercase tracking-widest font-bold shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:bg-indigo-600 transition-all mt-4 border-none" onClick={onClose}>
                    Assign Mentors & Notify Students
                </Button>
            </div>
        </Dialog>
    );
}

function GlobalActionPlanModal({ isOpen, onClose, data }: { isOpen: boolean, onClose: () => void, data: any }) {
    if (!data || !data.action_plan) return null;
    const plan = data.action_plan;

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            title={`Institutional Action Plan`}
            description="Global strategic roadmap generated by AI based on institutional performance mapping."
            className="max-w-none"
        >
            <div className="space-y-8 py-4">
                <div className="bg-[#1C1F26] p-8 border border-white/10 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <ShieldCheck className="h-28 w-28 shrink-0 text-white" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm font-bold uppercase tracking-[0.3em] text-indigo-400 mb-2">Executive Summary</p>
                        <h3 className="text-3xl font-bold leading-tight uppercase font-sans tracking-tighter text-white">{plan.executive_summary}</h3>
                    </div>
                    <div className="text-right relative z-10">
                        <p className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-1">Institutional Efficiency</p>
                        <p className="text-4xl font-bold text-emerald-400">{plan.roi_efficiency}</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                    <div className="space-y-4">
                        <h4 className="font-bold text-white uppercase text-xs tracking-[0.2em] flex items-center gap-4">
                            <Activity className="h-8 w-8 shrink-0 text-indigo-400" /> Core Strategies
                        </h4>
                        <div className="space-y-3">
                            {plan.strategies.map((item: any, i: number) => (
                                <div key={i} className="p-4 rounded-xl border border-white/5 bg-[#13151A] shadow-sm hover:border-indigo-500/30 transition-colors">
                                    <p className="font-bold text-white text-sm mb-1">{item.label}</p>
                                    <p className="text-xs text-slate-400 font-medium leading-relaxed">{item.detail}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h4 className="font-bold text-white uppercase text-xs tracking-[0.2em] flex items-center gap-4">
                            <Layers className="h-8 w-8 shrink-0 text-emerald-400" /> Resource Mapping
                        </h4>
                        <div className="p-6 bg-[#13151A] rounded-xl border border-white/5 flex items-center justify-between group">
                            <div>
                                <p className="text-sm font-bold text-slate-300">{plan.resource_label}</p>
                                <p className="text-sm font-bold text-indigo-400 uppercase tracking-widest mt-1">Budget Impact</p>
                            </div>
                            <p className="text-2xl font-bold text-emerald-400">{plan.resource_value}</p>
                        </div>

                        <div className="space-y-4 mt-6">
                            <h5 className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em] mb-2">Execution Roadmap</h5>
                            {plan.roadmap.map((step: any, i: number) => (
                                <div key={i} className="flex gap-6 items-center">
                                    <div className="h-10 w-10 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-sm font-bold text-white shrink-0">
                                        {i + 1}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-300 uppercase">{step.title}</p>
                                        <p className="text-xs font-medium text-slate-500 mt-1">{step.detail}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="pt-4 space-y-6">
                            <div className="flex items-start gap-4 p-4 border border-dashed border-white/20 rounded-xl text-xs font-bold text-slate-400 leading-relaxed italic uppercase bg-white/5">
                                <Zap className="h-6 w-6 text-amber-400 shrink-0 mt-0.5" />
                                "{plan.insight_quote}"
                            </div>
                            <Button className="w-full bg-indigo-500 hover:bg-indigo-600 h-14 rounded-xl font-bold text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] border-none uppercase tracking-widest transition-all">
                                Finalize & Disseminate Plan
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </Dialog>
    );
}


function AddStudentModal({ isOpen, onClose, onSuccess }: { isOpen: boolean, onClose: () => void, onSuccess: () => void }) {
    const [formData, setFormData] = useState({
        full_name: "", personal_email: "",
        department: "CSE", year: 1, dob: "", blood_group: "O+",
        parent_phone: "", personal_phone: "", previous_school: "", current_cgpa: 0.0
    });
    const batch = { 1: "25", 2: "24", 3: "23", 4: "22" }[formData.year as 1 | 2 | 3 | 4] || "25";
    const firstName = formData.full_name.trim().split(' ')[0].toLowerCase() || "name";
    const previewEmail = `${firstName}.${formData.department.toLowerCase()}${batch}@gmail.com`;
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const hostname = typeof window !== 'undefined' ? window.location.hostname : '127.0.0.1';
            const url = `http://${hostname}:8000/admin/students`;
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                alert("Student Enrolled! AI Career Compass & Analytics have been generated.");
                onSuccess();
                onClose();
            } else {
                alert("Failed to enroll student.");
            }
        } catch (err) { console.error(err); alert("Error enrolling student"); }
        finally { setLoading(false); }
    };

    if (!isOpen) return null;
    return (
        <Dialog isOpen={isOpen} onClose={onClose} title="Enroll New Student" description="Create student profile and auto-generate AI analytics.">
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Full Name</label>
                        <input required className="w-full h-14 p-4 rounded-xl bg-[#13151A] border border-white/10 font-bold text-white outline-none focus:border-indigo-500 transition-all placeholder:text-slate-700"
                            value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} placeholder="e.g. Kharizma A" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Email</label>
                        <input required type="email" className="w-full h-14 p-4 rounded-xl bg-[#13151A] border border-white/10 font-bold text-white outline-none focus:border-indigo-500 transition-all placeholder:text-slate-700"
                            value={formData.personal_email} onChange={e => setFormData({ ...formData, personal_email: e.target.value })} placeholder="student@example.com" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Department</label>
                        <select className="w-full h-14 p-4 rounded-xl bg-[#13151A] border border-white/10 font-bold text-white outline-none focus:border-indigo-500 transition-all"
                            value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })}>
                            {DEPARTMENTS.map(d => <option key={d} value={d} className="bg-[#13151A]">{d}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Year</label>
                        <select className="w-full h-14 p-4 rounded-xl bg-[#13151A] border border-white/10 font-bold text-white outline-none focus:border-indigo-500 transition-all"
                            value={formData.year} onChange={e => setFormData({ ...formData, year: parseInt(e.target.value) })}>
                            {[1, 2, 3, 4].map(y => <option key={y} value={y} className="bg-[#13151A]">Year {y}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Date of Birth</label>
                        <input type="date" className="w-full h-14 p-4 rounded-xl bg-[#13151A] border border-white/10 font-bold text-white outline-none focus:border-indigo-500 transition-all [color-scheme:dark]"
                            value={formData.dob} onChange={e => setFormData({ ...formData, dob: e.target.value })} />
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-8">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Blood Group</label>
                        <select className="w-full h-12 p-3 rounded-xl bg-[#13151A] border border-white/10 font-bold text-white outline-none focus:border-indigo-500 transition-all text-xs"
                            value={formData.blood_group} onChange={e => setFormData({ ...formData, blood_group: e.target.value })}>
                            {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(bg => <option key={bg} value={bg} className="bg-[#13151A]">{bg}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Parent Phone</label>
                        <input required type="tel" maxLength={10} pattern="[0-9]{10}" className="w-full h-12 p-3 rounded-xl bg-[#13151A] border border-white/10 font-bold text-white outline-none focus:border-indigo-500 transition-all text-xs"
                            placeholder="10-digit #" value={formData.parent_phone} onChange={e => setFormData({ ...formData, parent_phone: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Personal Phone</label>
                        <input required type="tel" maxLength={10} pattern="[0-9]{10}" className="w-full h-12 p-3 rounded-xl bg-[#13151A] border border-white/10 font-bold text-white outline-none focus:border-indigo-500 transition-all text-xs"
                            placeholder="10-digit #" value={formData.personal_phone} onChange={e => setFormData({ ...formData, personal_phone: e.target.value })} />
                    </div>
                </div>
                <div className="p-4 bg-white/5/10 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="h-10 w-10 shrink-0 bg-white/5/10 rounded-lg flex items-center justify-center">
                            <Mail className="h-8 w-8 shrink-0 text-primary shrink-0" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Auto-Generated Email</p>
                            <p className="text-xs font-semibold text-white tracking-tight">{previewEmail}</p>
                        </div>
                    </div>
                </div>
                <Button disabled={loading} type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white h-20 rounded-2xl font-bold border border-indigo-500/50 shadow-[0_0_20px_rgba(79,70,229,0.4)] flex items-center justify-center uppercase tracking-widest transition-all">
                    {loading ? <RefreshCw className="h-8 w-8 animate-spin mr-4" /> : <Zap className="h-8 w-8 text-white mr-4" />}
                    {loading ? "COMMITTING ENROLLMENT..." : "COMMIT ENROLLMENT & GENERATE DNA"}
                </Button>
            </form>
        </Dialog>
    );
}

function AddStaffModal({ isOpen, onClose, onSuccess }: { isOpen: boolean, onClose: () => void, onSuccess: () => void }) {
    const [formData, setFormData] = useState({
        full_name: "", personal_email: "",
        staff_id: "", department: "CSE", designation: "Assistant Professor",
        personal_phone: "", primary_skill: "", education: ""
    });
    const firstName = formData.full_name.trim().split(' ')[0].toLowerCase() || "faculty";
    const previewEmail = `${firstName}${formData.department.toLowerCase()}###@gmail.com`.toLowerCase();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const hostname = typeof window !== 'undefined' ? window.location.hostname : '127.0.0.1';
            const url = `http://${hostname}:8000/admin/staff`;
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                alert("Staff Member Added Successfully!");
                onSuccess();
                onClose();
            } else { alert("Failed to add staff."); }
        } catch (err) { console.error(err); alert("Error adding staff"); }
        finally { setLoading(false); }
    };

    if (!isOpen) return null;
    return (
        <Dialog isOpen={isOpen} onClose={onClose} title="Add Faculty Member" description="Register new staff and assign department roles.">
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Full Name</label>
                        <input required className="w-full h-14 p-4 rounded-xl bg-[#13151A] border border-white/10 font-bold text-white outline-none focus:border-indigo-500 transition-all placeholder:text-slate-700"
                            value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Email</label>
                        <input required type="email" className="w-full h-14 p-4 rounded-xl bg-[#13151A] border border-white/10 font-bold text-white outline-none focus:border-indigo-500 transition-all placeholder:text-slate-700"
                            value={formData.personal_email} onChange={e => setFormData({ ...formData, personal_email: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Staff ID (Optional)</label>
                        <input className="w-full h-14 p-4 rounded-xl bg-[#13151A] border border-white/10 font-bold text-white outline-none focus:border-indigo-500 transition-all placeholder:text-slate-700" placeholder="Auto-generated if empty"
                            value={formData.staff_id} onChange={e => setFormData({ ...formData, staff_id: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Department</label>
                        <select className="w-full h-14 p-4 rounded-xl bg-[#13151A] border border-white/10 font-bold text-white outline-none focus:border-indigo-500 transition-all"
                            value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })}>
                            {DEPARTMENTS.map(d => <option key={d} value={d} className="bg-[#13151A]">{d}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Designation</label>
                        <input className="w-full h-14 p-4 rounded-xl bg-[#13151A] border border-white/10 font-bold text-white outline-none focus:border-indigo-500 transition-all placeholder:text-slate-700" value={formData.designation} onChange={e => setFormData({ ...formData, designation: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Primary Skill</label>
                        <input className="w-full h-14 p-4 rounded-xl bg-[#13151A] border border-white/10 font-bold text-white outline-none focus:border-indigo-500 transition-all placeholder:text-slate-700" value={formData.primary_skill} onChange={e => setFormData({ ...formData, primary_skill: e.target.value })} />
                    </div>
                </div>
                <div className="p-4 bg-white/5/10 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="h-10 w-10 shrink-0 bg-white/5/10 rounded-lg flex items-center justify-center">
                            <Mail className="h-5 w-5 text-indigo-400" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Institutional Email Preview</p>
                            <p className="text-xs font-bold text-white tracking-tight">{previewEmail}</p>
                        </div>
                    </div>
                </div>
                <Button disabled={loading} type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white h-14 rounded-xl font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)] border border-emerald-500/50 uppercase tracking-widest transition-all">
                    {loading ? <RefreshCw className="h-6 w-6 animate-spin mr-2" /> : <ShieldCheck className="h-6 w-6 text-white mr-2" />}
                    {loading ? "Registering..." : "Register Faculty Node"}
                </Button>
            </form>
        </Dialog>
    );
}

function StudentPredictionInsightPanel({ isOpen, onClose, data, loading }: { isOpen: boolean, onClose: () => void, data: any, loading: boolean }) {
    if (!isOpen) return null;

    return (
        <Dialog 
            isOpen={isOpen} 
            onClose={onClose} 
            title={loading ? "Analyzing Student DNA..." : `Prediction Insight: ${data?.student_name}`}
            description="Advanced cognitive mapping and performance trajectory forecast."
            className="max-w-6xl"
        >
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-6">
                    <Loader2 className="h-12 w-12 animate-spin text-indigo-500" />
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Processing neural patterns...</p>
                </div>
            ) : data && (
                <div className="space-y-8 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* 1. Performance Trend Line Graph */}
                        <Card className="bg-[#13151A] border-white/5 p-6">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-3">
                                <TrendingUp className="h-4 w-4 text-indigo-400" /> Performance Trajectory
                            </h4>
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={data.performance_trend}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="semester" />
                                        <YAxis domain={[0, 10]} />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#1C1F26', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                        />
                                        <Line 
                                            type="monotone" 
                                            dataKey="cgpa" 
                                            stroke="#4361EE" 
                                            strokeWidth={4} 
                                            dot={{ fill: '#4361EE', strokeWidth: 2, r: 6 }}
                                            activeDot={{ r: 8, strokeWidth: 0 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>

                        {/* 2. Subject Strength Radar Chart */}
                        <Card className="bg-[#13151A] border-white/5 p-6">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-3">
                                <Target className="h-4 w-4 text-emerald-400" /> Subject Intelligence
                            </h4>
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data.subject_skills}>
                                        <PolarGrid stroke="rgba(255,255,255,0.1)" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                                        <Radar name="Score" dataKey="score" stroke="#00F5D4" fill="#00F5D4" fillOpacity={0.5} />
                                        <Tooltip contentStyle={{ backgroundColor: '#1C1F26', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>

                        {/* 3. Academic Activity Bar Chart */}
                        <Card className="bg-[#13151A] border-white/5 p-6">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-3">
                                <Activity className="h-4 w-4 text-purple-400" /> Study Behavior Analytics
                            </h4>
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data.academic_activities}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="category" />
                                        <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                        <Tooltip contentStyle={{ backgroundColor: '#1C1F26', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                                        <Bar dataKey="score" fill="#9D4EDD" radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>

                        {/* 4. Rank Probability Gauge Chart (Simulated with Pie) */}
                        <Card className="bg-[#13151A] border-white/5 p-6 flex flex-col items-center justify-center">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-3 self-start">
                                <Award className="h-4 w-4 text-amber-400" /> Rank Retention Probability
                            </h4>
                            <div className="relative h-[200px] w-full flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { name: 'Probability', value: data.rank_probability },
                                                { name: 'Remaining', value: 100 - data.rank_probability }
                                            ]}
                                            startAngle={180}
                                            endAngle={0}
                                            innerRadius="70%"
                                            outerRadius="100%"
                                            cy="85%"
                                            paddingAngle={0}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            <Cell fill="#FEE440" />
                                            <Cell fill="#1E293B" />
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pt-24 text-center">
                                    <span className="text-4xl font-black text-white">{data.rank_probability}%</span>
                                    <span className="text-[10px] font-bold uppercase text-slate-500 tracking-tighter">Confidence Score</span>
                                </div>
                            </div>
                            <p className="text-[11px] text-slate-500 text-center px-4 mt-2">
                                Student has a <span className="text-amber-400 font-bold">{data.rank_probability}%</span> chance of maintaining or improving their current department rank.
                            </p>
                        </Card>
                    </div>
                </div>
            )}
        </Dialog>
    );
}

export default function AdminDashboard() {
    const router = useRouter();
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('global');
    const [selectedCluster, setSelectedCluster] = useState<any>(null);
    const [isInterventionOpen, setIsInterventionOpen] = useState(false);
    const [isActionPlanOpen, setIsActionPlanOpen] = useState(false);

    const getApiUrl = (path: string) => {
        // Force 127.0.0.1 to avoid localhost resolution issues on some Windows setups
        return `http://127.0.0.1:8000${path}`;
    };

    // --- User Directory State ---
    const [userType, setUserType] = useState<'student' | 'staff'>('student')
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<any[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [isAddStudentOpen, setIsAddStudentOpen] = useState(false)
    const [isAddStaffOpen, setIsAddStaffOpen] = useState(false)

    // --- Targeted Assessment State (Departmental) ---
    const [assessmentDeptFilter, setAssessmentDeptFilter] = useState('ALL');
    const [assessmentYearFilter, setAssessmentYearFilter] = useState('ALL');
    const [assessmentRiskFilter, setAssessmentRiskFilter] = useState('ALL'); // 'ALL' or 'AT_RISK'
    const [selectedAssessmentStudents, setSelectedAssessmentStudents] = useState<string[]>([]);
    const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
    const [selectedMockTest, setSelectedMockTest] = useState('');
    const [assessmentStudents, setAssessmentStudents] = useState<any[]>([]);
    const [isAssessmentLoading, setIsAssessmentLoading] = useState(false);
    const [isInsightLoading, setIsInsightLoading] = useState(false);

    const [predictiveRanks, setPredictiveRanks] = useState<any[]>([]);
    const [isGeneratingRanks, setIsGeneratingRanks] = useState(false);
    const [selectedStudentPrediction, setSelectedStudentPrediction] = useState<any>(null);
    const [isPredictionInsightOpen, setIsPredictionInsightOpen] = useState(false);

    const [predictiveYearFilter, setPredictiveYearFilter] = useState('ALL');
    const [predictiveDeptFilter, setPredictiveDeptFilter] = useState('ALL');

    const fetchPredictiveRanks = async () => {
        setIsGeneratingRanks(true);
        try {
            const token = localStorage.getItem('token');
            let url = getApiUrl('/admin/predictive/ranks');
            const params = new URLSearchParams();
            if (predictiveYearFilter !== 'ALL') params.append('year', predictiveYearFilter);
            if (predictiveDeptFilter !== 'ALL') params.append('department', predictiveDeptFilter);
            
            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setPredictiveRanks(data);
            }
        } catch (error) {
            console.error("Failed to fetch predictive ranks", error);
        } finally {
            setIsGeneratingRanks(false);
        }
    };

    const fetchStudentInsight = async (studentId: string) => {
        setIsInsightLoading(true);
        setIsPredictionInsightOpen(true);
        try {
            const token = localStorage.getItem('token');
            const url = getApiUrl(`/admin/predictive/student-insight/${studentId}`);
            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setSelectedStudentPrediction(data);
            }
        } catch (error) {
            console.error("Failed to fetch student insight", error);
        } finally {
            setIsInsightLoading(false);
        }
    };

    useEffect(() => {
        const fetchAssessmentStudents = async () => {
            setIsAssessmentLoading(true);
            try {
                const token = localStorage.getItem('token');
                let path = `/admin/students?risk_level=${assessmentRiskFilter}`;
                if (assessmentDeptFilter !== 'ALL') path += `&department=${assessmentDeptFilter}`;
                if (assessmentYearFilter !== 'ALL') path += `&year=${assessmentYearFilter.replace('Year ', '')}`;

                const url = getApiUrl(path);

                const res = await fetch(url, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setAssessmentStudents(data);
                }
            } catch (error) {
                console.error("Failed to fetch assessment students", error);
            } finally {
                setIsAssessmentLoading(false);
            }
        };

        if (activeTab === 'dept' || activeTab === 'global') {
            fetchAssessmentStudents();
        }
    }, [assessmentDeptFilter, assessmentYearFilter, assessmentRiskFilter, activeTab]);

    const handleSelectAllAssessment = () => {
        if (selectedAssessmentStudents.length === assessmentStudents.length) {
            setSelectedAssessmentStudents([]);
        } else {
            setSelectedAssessmentStudents(assessmentStudents.map((s: any) => s.id));
        }
    };

    const handleAssignAssessments = async () => {
        if (!selectedMockTest || selectedAssessmentStudents.length === 0) return;

        try {
            const token = localStorage.getItem('token');
            const url = getApiUrl('/admin/remedial-assessments');
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    subject: selectedMockTest,
                    student_ids: selectedAssessmentStudents
                })
            });

            if (res.ok) {
                alert(`Successfully dispatched ${selectedMockTest} assessment to ${selectedAssessmentStudents.length} students.`);
                setSelectedAssessmentStudents([]);
                setSelectedMockTest('');
            } else {
                alert("Failed to assign assessments.");
            }
        } catch (error) {
            console.error("Assignment failed", error);
            alert("An error occurred while assigning assessments.");
        }
    };

    // Search Logic
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (activeTab === 'users') {
                performSearch()
            }
        }, 500)

        return () => clearTimeout(delayDebounceFn)
    }, [searchQuery, userType, activeTab])

    const performSearch = async () => {
        setIsSearching(true)
        try {
            const token = localStorage.getItem('token')
            const endpoint = userType === 'student' ? 'students' : 'staff'
            const url = getApiUrl(`/admin/${endpoint}?search=${searchQuery}`)

            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setSearchResults(Array.isArray(data) ? data : [])
            } else {
                setSearchResults([])
            }
        } catch (error) {
            console.error("Search failed", error)
            setSearchResults([])
        } finally {
            setIsSearching(false)
        }
    }

    const handleDeleteUser = async (id: string) => {
        if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return

        try {
            const token = localStorage.getItem('token')
            const endpoint = userType === 'student' ? 'students' : 'staff'
            const url = getApiUrl(`/admin/${endpoint}/${id}`)
            const res = await fetch(url, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            })

            if (res.ok) {
                performSearch()
                alert(`${userType === 'student' ? 'Student' : 'Staff'} deleted successfully`)
            } else {
                alert("Failed to delete user")
            }
        } catch (error) {
            console.error("Delete failed", error)
        }
    }

    useEffect(() => {
        const fetchOverview = async () => {
            const token = localStorage.getItem('token')
            if (!token) {
                router.push('/login')
                return
            }
            try {
                const url = getApiUrl('/admin/overview');
                const response = await fetch(url, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (response.ok) {
                    const overviewData = await response.json()

                    if (overviewData.error) {
                        if (overviewData.error === "Unauthorized") {
                            localStorage.removeItem('token')
                            router.push('/login')
                        } else {
                            setError(overviewData.error)
                        }
                        return
                    }
                    setData(overviewData)
                } else {
                    if (response.status === 401 || response.status === 403) {
                        localStorage.removeItem('token')
                        router.push('/login')
                    } else {
                        const errData = await response.json().catch(() => null)
                        setError(`Server Error ${response.status}: ${errData?.detail || response.statusText}`)
                    }
                }
            } catch (error: any) {
                console.error("Failed to fetch dashboard overview", error)
                setError(error.message || "Network error")
            } finally {
                setLoading(false)
            }
        }
        fetchOverview()
    }, [router])

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-8">
                    <Loader2 className="h-14 w-14 animate-spin text-black" />
                    <p className="text-sm font-bold tracking-[0.3em] uppercase">Initializing Engine...</p>
                </div>
            </div>
        )
    }

    if (error) return <div className="flex h-screen flex-col items-center justify-center space-y-4"><p className="text-xl font-bold text-rose-500">Failed to load institutional data</p><p className="text-sm text-zinc-500">{error}</p></div>;
    if (!data) return <div className="p-12 text-center">Failed to load institutional data.</div>;

    return (
        <div className="flex min-h-screen w-full flex-col bg-[#13151A] text-white selection:bg-indigo-500/30 font-sans">
            {/* Sticky Header */}
            <header className="sticky top-0 z-[100] h-24 border-b border-white/5 bg-[#1A1D27]/80 backdrop-blur-xl px-8 shadow-sm">
                <div className="mx-auto flex h-full w-full items-center justify-between">
                    <div className="flex items-center gap-6 group">
                        <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                            <ShieldCheck className="h-8 w-8" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-white">Institutional Console</h1>
                            <p className="text-xs font-medium text-slate-400 mt-1">Integrated Intelligence System</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-12">
                        <div className="hidden xl:flex items-center gap-10 border-r border-white/10 pr-8 mr-2">
                            <div className="flex flex-col text-right">
                                <span className="text-sm font-bold text-zinc-700 uppercase tracking-widest mb-1 tracking-widest">System Health</span>
                                <span className="text-xs font-bold text-emerald-400">99.8% OPTIMAL</span>
                            </div>
                            <div className="flex flex-col text-right">
                                <span className="text-sm font-bold text-zinc-700 uppercase tracking-widest mb-1 tracking-widest">Active Alerts</span>
                                <span className="text-xs font-bold text-rose-400">2 CRITICAL</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <Link href="/admin/students">
                                <button className="h-11 px-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-semibold transition-all">
                                    Archive Ops
                                </button>
                            </Link>
                            <button
                                onClick={() => {
                                    localStorage.removeItem('token')
                                    router.push('/')
                                }}
                                className="h-11 px-6 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold transition-all border border-rose-500/20"
                            >
                                Security Exit
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 w-full max-w-none mx-auto relative">
                {/* Left Sidebar Menu */}
                <aside className="w-96 shrink-0 border-r border-white/5 bg-[#1C1F26]/30 p-6 lg:p-10 hidden md:block">
                    <div className="sticky top-32 flex flex-col">
                        <div className="bg-[#1C1F26] p-4 rounded-3xl border border-white/5 shadow-xl flex flex-col gap-2 w-full">
                            <div className="flex flex-col gap-3">
                                {[
                                    { id: 'global', label: 'Institutional', icon: Globe },
                                    { id: 'dept', label: 'Departmental', icon: LayoutGrid },
                                    { id: 'predictive', label: 'Predictive', icon: Zap },
                                    { id: 'users', label: 'Directory', icon: Users },
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={cn(
                                            "flex items-center gap-5 px-6 py-5 rounded-2xl text-lg font-bold transition-all justify-start w-full",
                                            activeTab === tab.id
                                                ? "bg-indigo-600 text-white shadow-[0_0_30px_rgba(79,70,229,0.2)]"
                                                : "text-slate-400 hover:text-white hover:bg-white/5 bg-[#13151A]/60 border border-white/5"
                                        )}
                                    >
                                        <div className={cn("p-3 rounded-xl", activeTab === tab.id ? "bg-white/20" : "bg-white/5")}>
                                            <tab.icon className="h-8 w-8 shrink-0" />
                                        </div>
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>

                <main className="flex-1 p-8 md:p-12 space-y-12 w-full max-w-none overflow-hidden">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-8 border-b border-white/5">
                        <div className="space-y-3">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                                <Zap className="h-3 w-3" /> System Active
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
                                Academic Intelligence
                            </h2>
                            <p className="text-slate-400 font-medium max-w-2xl text-sm">
                                Institutional cognitive mapping and predictive analytics framework.
                            </p>
                        </div>
                    </div>

                    {/* 1. INSTITUTIONAL SUMMARY CARDS (Animated) */}
                    {(activeTab === 'global') && (
                        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                            {[
                                { label: "Total Students", value: data.institutional.total_students, icon: Users, accent: "text-[#4361EE]", bg: "bg-[#4361EE]/10", border: "border-[#4361EE]/20" },
                                { label: "Active Students", value: data.institutional.active_students, icon: GraduationCap, accent: "text-[#00F5D4]", bg: "bg-[#00F5D4]/10", border: "border-[#00F5D4]/20" },
                                { label: "Placement Readiness", value: `${data.institutional.placement_readiness_avg}%`, icon: Target, accent: "text-[#F15BB5]", bg: "bg-[#F15BB5]/10", border: "border-[#F15BB5]/20" },
                                { label: "DNA Score", value: data.institutional.dna_score, icon: Award, accent: "text-[#9D4EDD]", bg: "bg-[#9D4EDD]/10", border: "border-[#9D4EDD]/20" },
                                { label: "Risk Ratio", value: `${data.institutional.risk_ratio}%`, icon: AlertTriangle, accent: "text-[#FF006E]", bg: "bg-[#FF006E]/10", border: "border-[#FF006E]/20" },
                                { label: "Growth Index", value: data.institutional.avg_growth_index, icon: TrendingUp, accent: "text-[#FEE440]", bg: "bg-[#FEE440]/10", border: "border-[#FEE440]/20" },
                            ].map((item, i) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05, duration: 0.5 }}
                                    key={i}
                                    className="h-full"
                                >
                                    <Card className="neon-card bg-[#1C1F26] border-white/5 hover:border-white/10 transition-all cursor-default group overflow-hidden h-full min-h-[160px] flex flex-col justify-between p-0 shadow-lg">
                                        <div className="p-6 relative z-10 flex flex-col h-full justify-between w-full flex-grow">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className={cn("p-2.5 rounded-xl flex items-center justify-center border transition-all", item.bg, item.accent, item.border)}>
                                                    <item.icon className="h-5 w-5 shrink-0" />
                                                </div>
                                                <p className="text-xs font-semibold text-slate-400 text-right">{item.label}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className="text-3xl font-bold text-white tracking-tight leading-none">{item.value}</h3>
                                            </div>
                                            <div className="mt-5 flex items-center gap-4 w-full">
                                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                    <div className={cn("h-full transition-all duration-1000", item.accent.replace('text-', 'bg-'))} style={{ width: '70%' }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    <div className="grid gap-12 grid-cols-1 lg:grid-cols-12">

                        {/* 10. AI INSIGHT GENERATOR (AUTO SUMMARY) */}
                        {(activeTab === 'global') && (
                            <div className="lg:col-span-12">
                                <Card className="neon-card relative overflow-hidden group">
                                    <CardContent className="p-8 lg:p-12 relative z-10 flex flex-col md:flex-row items-center gap-10 lg:gap-16">
                                        <div className="h-24 w-24 rounded-3xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 shrink-0 relative shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                                            <Activity className="h-12 w-12" />
                                        </div>
                                        <div className="space-y-4 text-center md:text-left">
                                            <div className="flex items-center justify-center md:justify-start gap-6">
                                                <div className="flex items-center gap-3 bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20">
                                                    <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-400 animate-ping"></span>
                                                    <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">WEEKLY intel ENGINE</span>
                                                </div>
                                                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                                                    v4.0.2-ALPHA
                                                </div>
                                            </div>
                                            <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight tracking-tight max-w-none">
                                                {data.weekly_insight}
                                            </h3>
                                            <div className="flex flex-col md:flex-row md:items-center gap-8 pt-2">
                                                <p className="text-sm font-medium leading-relaxed max-w-3xl text-slate-400">
                                                    AI logic (SHAP) suggests focusing on Core Engineering lab utilization to bridge the current skill gap identified in final year students.
                                                </p>
                                                <button className="shrink-0 bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg border border-white/10 backdrop-blur-md">
                                                    Full Report
                                                </button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* 2. AI EARLY WARNING SYSTEM & 3. PERFORMANCE CLUSTERING */}
                        {(activeTab === 'global') && (
                            <>
                                <div className="lg:col-span-4 flex flex-col gap-8">
                                    <Card className="neon-card h-full flex flex-col">
                                        <CardHeader className="border-b border-white/5 bg-white/5 py-5 px-6">
                                            <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-3 text-white">
                                                <ShieldCheck className="h-5 w-5 text-rose-500" />
                                                Risk Assessment
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="flex-1 flex flex-col justify-between p-6">
                                            <div className="space-y-8">
                                                <div className="flex justify-between items-center bg-[#13151A] p-5 rounded-2xl border border-white/5">
                                                    <div>
                                                        <p className="text-xs font-semibold uppercase text-slate-500 mb-1">High Risk</p>
                                                        <p className="text-3xl font-bold text-rose-500 leading-none">{data.early_warning.high_risk_count}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs font-semibold uppercase text-slate-500 mb-1">Medium Risk</p>
                                                        <p className="text-3xl font-bold text-amber-500 leading-none">{data.early_warning.medium_risk_count}</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    <div className="flex justify-between text-xs font-semibold uppercase tracking-widest text-slate-400">
                                                        <span>Neutralization Strategy</span>
                                                        <span className="text-emerald-400">{data.early_warning.low_risk_percent}% Stable</span>
                                                    </div>
                                                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${data.early_warning.low_risk_percent}%` }}
                                                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="p-6 bg-rose-500/10 rounded-2xl space-y-2 border border-rose-500/20 text-center">
                                                    <p className="text-xs font-bold uppercase tracking-widest text-rose-400">Predicted Dropout Rate</p>
                                                    <div className="text-4xl font-black text-rose-500 drop-shadow-[0_0_10px_rgba(244,63,94,0.4)]">{data.early_warning.dropout_probability_next_6m}%</div>
                                                </div>
                                            </div>

                                            <Button
                                                onClick={() => {
                                                    setSelectedCluster(data.performance_clusters[3]);
                                                    setIsInterventionOpen(true);
                                                }}
                                                className="w-full mt-8 bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)] h-14 font-bold text-xs uppercase tracking-widest rounded-xl transition-all"
                                            >
                                                View Intervention Plan
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </div>

                                <div className="lg:col-span-8">
                                    <Card className="neon-card h-full">
                                        <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 bg-white/5 py-5 px-8">
                                            <div>
                                                <CardTitle className="text-lg font-bold uppercase tracking-wide flex items-center gap-3 text-white">
                                                    <Layers className="h-6 w-6 shrink-0 text-indigo-400" />
                                                    Performance Clustering
                                                </CardTitle>
                                                <CardDescription className="text-xs font-semibold text-slate-500 mt-1">KMeans (n=4) grouping based on CGPA and Growth.</CardDescription>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="grid md:grid-cols-2 gap-10 items-center p-6 lg:p-10">
                                            <div className="h-[300px] lg:h-[400px] w-full">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={data.performance_clusters}
                                                            cx="50%"
                                                            cy="50%"
                                                            innerRadius="70%"
                                                            outerRadius="90%"
                                                            paddingAngle={8}
                                                            dataKey="count"
                                                            stroke="none"
                                                            cornerRadius={4}
                                                        >
                                                            {data.performance_clusters.map((entry: any, index: number) => (
                                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip
                                                            contentStyle={{ backgroundColor: '#1C1F26', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                                                            itemStyle={{ color: '#fff' }}
                                                        />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>
                                            <div className="space-y-4">
                                                {data.performance_clusters.map((cluster: any, i: number) => (
                                                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-4 w-4 rounded-full shadow-lg" style={{ backgroundColor: COLORS[i % COLORS.length], boxShadow: `0 0 10px ${COLORS[i % COLORS.length]}80` }}></div>
                                                            <div>
                                                                <p className="text-sm font-bold text-white">{cluster.name}</p>
                                                                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{cluster.description}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-lg font-bold text-white">{cluster.count}</p>
                                                            <p className="text-sm font-bold" style={{ color: COLORS[i % COLORS.length] }}>{cluster.percentage}%</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>

                                    </Card>
                                </div>
                            </>
                        )}

                        {/* 4. DEPARTMENT PERFORMANCE INDEX */}
                        {activeTab === 'global' && (
                            <div className="lg:col-span-12">
                                <Card className="neon-card overflow-hidden">
                                    <CardHeader className="bg-white/5 border-b border-white/5 p-8 lg:p-10">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                            <div>
                                                <CardTitle className="text-2xl lg:text-3xl font-bold tracking-tight flex items-center gap-4 text-white">
                                                    <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                                                        <BarChart3 className="h-7 w-7 text-indigo-400" />
                                                    </div>
                                                    Department Performance Index
                                                </CardTitle>
                                                <CardDescription className="text-sm font-medium text-slate-500 mt-2">
                                                    Institutional benchmarking based on composite AI readiness scoring.
                                                </CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-collapse">
                                                <thead className="bg-[#13151A] text-xs font-semibold uppercase tracking-widest text-slate-500 border-b border-white/5">
                                                    <tr>
                                                        <th className="px-8 py-5">Rank</th>
                                                        <th className="px-8 py-5">Department</th>
                                                        <th className="px-8 py-5">Avg CGPA</th>
                                                        <th className="px-8 py-5">Growth</th>
                                                        <th className="px-8 py-5">Placement</th>
                                                        <th className="px-8 py-5">Skill</th>
                                                        <th className="px-8 py-5 bg-white/5">Risk</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/5">
                                                    {data.department_ranking.map((dept: any, i: number) => (
                                                        <tr key={i} className="hover:bg-white/5 transition-all group">
                                                            <td className="px-8 py-6">
                                                                <div className="h-10 w-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-bold text-sm text-indigo-400">
                                                                    #{dept.overall_rank}
                                                                </div>
                                                            </td>
                                                            <td className="px-8 py-6 font-bold text-sm text-white">{dept.department}</td>
                                                            <td className="px-8 py-6">
                                                                <div className="font-bold text-sm text-white bg-white/5 px-4 py-1.5 rounded-lg border border-white/10 inline-block">
                                                                    {dept.avg_cgpa}
                                                                </div>
                                                            </td>
                                                            <td className="px-8 py-6 font-bold text-sm text-slate-400">{dept.avg_growth}</td>
                                                            <td className="px-8 py-6">
                                                                <span className="font-bold text-sm text-white">{dept.placement_readiness}%</span>
                                                            </td>
                                                            <td className="px-8 py-6 font-bold text-sm text-slate-500">{dept.skill_score}</td>
                                                            <td className="px-8 py-6 font-bold text-sm text-rose-400 bg-rose-400/5">{dept.risk_percent}%</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* 5. PREDICTIVE PLACEMENT FORECAST & 6. FACULTY IMPACT */}
                        {(activeTab === 'global') && (
                            <>
                                <div className="lg:col-span-6">
                                    <Card className="neon-card h-full">
                                        <CardHeader className="border-b border-white/5 bg-white/5 py-5 px-8">
                                            <CardTitle className="text-lg font-bold tracking-tight flex items-center gap-3 text-white">
                                                <Briefcase className="h-6 w-6 text-emerald-400" />
                                                Placement Forecast
                                            </CardTitle>
                                            <CardDescription className="text-xs font-semibold text-slate-500 mt-1">Next batch projection using current readiness indicators.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="grid sm:grid-cols-2 gap-10 lg:gap-12 items-center p-8">
                                            <div className="relative flex items-center justify-center w-full h-[300px]">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={[
                                                                { name: 'Predicted', value: data.placement_forecast.forecast_placement_percent },
                                                                { name: 'Gap', value: 100 - data.placement_forecast.forecast_placement_percent }
                                                            ]}
                                                            startAngle={180}
                                                            endAngle={0}
                                                            innerRadius="75%"
                                                            outerRadius="100%"
                                                            cy="85%"
                                                            paddingAngle={0}
                                                            dataKey="value"
                                                            stroke="none"
                                                        >
                                                            <Cell fill="#10B981" />
                                                            <Cell fill="#1E293B" />
                                                        </Pie>
                                                    </PieChart>
                                                </ResponsiveContainer>
                                                <div className="absolute inset-0 flex flex-col items-center justify-center pt-24">
                                                    <span className="text-5xl font-black text-white">{data.placement_forecast.forecast_placement_percent}%</span>
                                                    <span className="text-xs font-bold uppercase text-slate-500 tracking-widest mt-1">Institution Forecast</span>
                                                </div>
                                            </div>
                                            <div className="space-y-6">
                                                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                                    <p className="text-xs font-semibold tracking-widest text-slate-500 uppercase">Core vs IT Ratio</p>
                                                    <p className="text-2xl font-bold text-white mt-1">{data.placement_forecast.core_vs_it_ratio}</p>
                                                </div>
                                                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                                    <p className="text-xs font-semibold tracking-widest text-slate-500 uppercase">Readiness Avg</p>
                                                    <p className="text-2xl font-bold text-white mt-1">{data.placement_forecast.avg_career_readiness}%</p>
                                                </div>
                                                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                                                    <p className="text-xs font-bold text-rose-400 uppercase tracking-widest">Global Skill Gap</p>
                                                    <div className="text-2xl font-bold text-rose-500 mt-1">{data.placement_forecast.skill_gap_avg}%</div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                <div className="lg:col-span-6">
                                    <Card className="neon-card h-full">
                                        <CardHeader className="border-b border-white/5 bg-white/5 py-5 px-8">
                                            <CardTitle className="text-lg font-bold tracking-tight flex items-center gap-3 text-white">
                                                <Activity className="h-6 w-6 text-purple-400" />
                                                Faculty Impact Analytics
                                            </CardTitle>
                                            <CardDescription className="text-xs font-semibold text-slate-500 mt-1">Measured by student improvement after feedback cycles.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="h-[400px] lg:h-[450px] p-8">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data.faculty_impact}>
                                                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                                                    <PolarAngleAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} />
                                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
                                                    <Radar name="Impact Score" dataKey="impact_score" stroke="#9D4EDD" fill="#9D4EDD" fillOpacity={0.4} />
                                                    <Tooltip
                                                        contentStyle={{ backgroundColor: '#1C1F26', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                                                        itemStyle={{ color: '#fff' }}
                                                    />
                                                </RadarChart>
                                            </ResponsiveContainer>
                                        </CardContent>
                                    </Card>
                                </div>
                            </>
                        )}

                        {/* 7. BURNOUT & ACADEMIC STRESS HEATMAP & 8. RESOURCE OPTIMIZATION */}
                        {(activeTab === 'global') && (
                            <>
                                <div className="lg:col-span-8">
                                    <Card className="neon-card h-full">
                                        <CardHeader className="border-b border-white/5 bg-white/5 py-5 px-8">
                                            <CardTitle className="text-lg font-bold tracking-tight flex items-center gap-3 text-white">
                                                <Activity className="h-6 w-6 text-rose-500" />
                                                Student Stress Heatmap
                                            </CardTitle>
                                            <CardDescription className="text-xs font-semibold text-slate-500 mt-1">Risk mapping by Semester vs Performance Volatility.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="py-8 px-8">
                                            <div className="grid grid-cols-6 gap-4">
                                                <div className="col-span-1"></div>
                                                {['S1', 'S2', 'S3', 'S4', 'S5'].map(s => <div key={s} className="text-center text-xs font-semibold text-slate-400">{s}</div>)}
                                                {['AIML', 'CSE', 'ECE', 'EEE', 'MECH'].map((dept, i) => (
                                                    <React.Fragment key={dept}>
                                                        <div className="text-xs font-semibold flex items-center justify-end pr-4 text-slate-400">{dept}</div>
                                                        {[1, 2, 3, 4, 5].map(s => {
                                                            const isHigh = (i + s) % 5 === 0;
                                                            const isMed = (i + s) % 3 === 0;
                                                            return (
                                                                <div
                                                                    key={`${dept}-${s}`}
                                                                    className={cn("h-12 rounded-xl transition-all hover:scale-105 hover:shadow-lg border border-white/5",
                                                                        isHigh ? "bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]" :
                                                                            isMed ? "bg-amber-500" : "bg-emerald-500/80"
                                                                    )}
                                                                ></div>
                                                            )
                                                        })}
                                                    </React.Fragment>
                                                ))}
                                            </div>
                                            <div className="mt-8 flex justify-center gap-8 bg-white/5 py-3 rounded-2xl border border-white/5">
                                                {['Low Stress', 'Moderate', 'High Risk'].map((l, i) => (
                                                    <div key={l} className="flex items-center gap-3">
                                                        <div className={cn("h-4 w-4 rounded-full", i === 0 ? "bg-emerald-500" : i === 1 ? "bg-amber-500" : "bg-rose-500")}></div>
                                                        <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">{l}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                <div className="lg:col-span-4">
                                    <Card className="neon-card h-full">
                                        <CardHeader className="border-b border-white/5 bg-white/5 py-5 px-8">
                                            <CardTitle className="text-lg font-bold tracking-tight flex items-center gap-3 text-white">
                                                <Zap className="h-6 w-6 text-amber-500" />
                                                Resource Opt
                                            </CardTitle>
                                            <CardDescription className="text-xs font-semibold text-slate-500 mt-1">Utilization & Demand Forecast.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-8 py-8 px-8">
                                            {[
                                                { label: "Faculty Load", value: data.resource_opt.faculty_load_percent, color: "#10B981" },
                                                { label: "Lab Utilization", value: data.resource_opt.lab_utilization_percent, color: "#4361EE" },
                                                { label: "Remedial Need", value: data.resource_opt.remedial_need_percent, color: "#F59E0B" }
                                            ].map((item, i) => (
                                                <div key={i} className="space-y-3">
                                                    <div className="flex justify-between text-xs font-semibold uppercase text-slate-400 tracking-wider">
                                                        <span>{item.label}</span>
                                                        <span className="text-white">{item.value}%</span>
                                                    </div>
                                                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${item.value}%` }}
                                                            className="h-full"
                                                            style={{ backgroundColor: item.color, boxShadow: `0 0 10px ${item.color}80` }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="pt-2">
                                                <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                                                    <div className="h-12 w-12 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                                                        <RefreshCw className="h-6 w-6 text-amber-400 animate-spin-slow" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-semibold text-amber-500 uppercase tracking-widest mb-1">Demand Forecast</p>
                                                        <p className="text-lg font-bold text-white leading-tight">{data.resource_opt.coaching_demand}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </>
                        )}

                        {/* --- 2. DEPARTMENTAL VIEW --- */}
                        {activeTab === 'dept' && (
                            <div className="w-full mt-4 lg:col-span-12">
                                <DepartmentalTab />
                            </div>
                        )}

                        {/* --- 3. PREDICTIVE VIEW --- */}
                        {activeTab === 'predictive' && (
                            <div className="w-full space-y-12 lg:col-span-12">
                                <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-[#1C1F26] p-10 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-10 opacity-5">
                                        <Zap className="h-32 w-32 text-white" />
                                    </div>
                                    <div className="relative z-10 w-full md:w-auto flex-1">
                                        <h3 className="text-3xl font-bold text-white mb-2 uppercase tracking-tighter">Next Semester Rank Prediction</h3>
                                        <p className="text-slate-400 font-medium text-sm">AI Engine is ready to simulate academic performance based on historical vectors.</p>
                                        
                                        <div className="flex flex-wrap gap-4 mt-6">
                                            <div className="space-y-1.5 w-full sm:w-auto">
                                                <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold ml-1">Department View</label>
                                                <select 
                                                    value={predictiveDeptFilter}
                                                    onChange={(e) => setPredictiveDeptFilter(e.target.value)}
                                                    className="w-full sm:w-48 bg-[#13151A] border border-white/10 rounded-xl px-4 py-3 text-sm font-semibold text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                                >
                                                    <option value="ALL">Global Engine (All)</option>
                                                    <option value="AIML">AIML</option>
                                                    <option value="AGRI">AGRI</option>
                                                    <option value="EEE">EEE</option>
                                                    <option value="EIE">EIE</option>
                                                    <option value="ECE">ECE</option>
                                                    <option value="BT">BT</option>
                                                    <option value="BME">BME</option>
                                                    <option value="CIVIL">CIVIL</option>
                                                    <option value="IT">IT</option>
                                                    <option value="MECH">MECH</option>
                                                    <option value="MECHATRONICS">MECHATRONICS</option>
                                                    <option value="CSE">CSE</option>
                                                    <option value="FT">FT</option>
                                                    <option value="FD">FD</option>
                                                    <option value="AIDS">AIDS</option>
                                                </select>
                                            </div>
                                            <div className="space-y-1.5 w-full sm:w-auto">
                                                <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold ml-1">Academic Year</label>
                                                <select 
                                                    value={predictiveYearFilter}
                                                    onChange={(e) => setPredictiveYearFilter(e.target.value)}
                                                    className="w-full sm:w-40 bg-[#13151A] border border-white/10 rounded-xl px-4 py-3 text-sm font-semibold text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                                >
                                                    <option value="ALL">All Cohorts</option>
                                                    <option value="1">Alpha (Year 1)</option>
                                                    <option value="2">Beta (Year 2)</option>
                                                    <option value="3">Gamma (Year 3)</option>
                                                    <option value="4">Delta (Year 4)</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    <Button 
                                        onClick={fetchPredictiveRanks}
                                        disabled={isGeneratingRanks}
                                        className="relative z-10 h-16 px-10 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-[0_0_20px_rgba(79,70,229,0.4)] border-none uppercase tracking-widest text-xs transition-all w-full md:w-auto mt-6 md:mt-0"
                                    >
                                        {isGeneratingRanks ? <RefreshCw className="h-6 w-6 animate-spin mr-3" /> : <Zap className="h-6 w-6 mr-3" />}
                                        {isGeneratingRanks ? 'Analyzing Vectors...' : 'Generate Rank Prediction'}
                                    </Button>
                                </div>

                                {predictiveRanks.length > 0 && (
                                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                                        <Card className="neon-card overflow-hidden">
                                            <CardHeader className="bg-white/5 border-b border-white/5 p-8">
                                                <CardTitle className="text-xl font-bold uppercase tracking-widest flex items-center gap-4 text-white">
                                                    <Award className="h-7 w-7 text-amber-400" />
                                                    Predicted Rank List
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-0">
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-left border-collapse">
                                                        <thead className="bg-[#13151A] text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 border-b border-white/5">
                                                            <tr>
                                                                <th className="px-10 py-6">Rank</th>
                                                                <th className="px-10 py-6">Student Name</th>
                                                                <th className="px-10 py-6">Current CGPA</th>
                                                                <th className="px-10 py-6">Predicted CGPA</th>
                                                                <th className="px-10 py-6">Status</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-white/5">
                                                            {predictiveRanks.map((student) => (
                                                                <tr key={student.student_id} className="hover:bg-indigo-500/5 transition-all group">
                                                                    <td className="px-10 py-6">
                                                                        <div className="h-10 w-10 rounded-xl bg-[#13151A] border border-white/10 flex items-center justify-center font-bold text-white shadow-sm">
                                                                            #{student.rank}
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-10 py-6">
                                                                        <button 
                                                                            onClick={() => fetchStudentInsight(student.student_id)}
                                                                            className="font-bold text-slate-300 hover:text-indigo-400 transition-colors text-left"
                                                                        >
                                                                            {student.student_name}
                                                                        </button>
                                                                    </td>
                                                                    <td className="px-10 py-6 font-bold text-slate-500">
                                                                        {student.current_cgpa || '8.2'} 
                                                                    </td>
                                                                    <td className="px-10 py-6">
                                                                        <div className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg inline-block font-black text-indigo-400">
                                                                            {student.predicted_cgpa}
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-10 py-6">
                                                                        <span className="flex items-center gap-2 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                                                                            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                                                                            Ascending Trajectory
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                )}
                            </div>
                        )}
                    </div> {/* Close grid container for older sections if it was left open */}

                    {/* User Management View */}
                    {
                        activeTab === 'users' && (
                            <div className="w-full pb-16">
                                <Card className="neon-card bg-[#1C1F26]">
                                    <div className="bg-[#13151A] border-b border-white/5 p-8 lg:p-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 rounded-t-2xl">
                                        <div className="text-white space-y-2">
                                            <h2 className="text-3xl font-bold tracking-tight flex items-center gap-4 text-white">
                                                <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                                                    <UserCircle className="h-7 w-7 text-indigo-400" />
                                                </div>
                                                User Directory
                                            </h2>
                                            <p className="text-sm font-medium text-slate-500 mt-2">Security Control Center</p>
                                        </div>
                                        <div className="flex flex-wrap gap-4 items-center">
                                            <div className="flex bg-[#13151A] border border-white/10 rounded-xl p-1 shadow-inner">
                                                <button
                                                    onClick={() => setUserType('student')}
                                                    className={cn(
                                                        "px-5 py-2.5 text-xs font-semibold rounded-lg transition-all",
                                                        userType === 'student' ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:text-white hover:bg-white/5"
                                                    )}
                                                >
                                                    Students
                                                </button>
                                                <button
                                                    onClick={() => setUserType('staff')}
                                                    className={cn(
                                                        "px-5 py-2.5 text-xs font-semibold rounded-lg transition-all",
                                                        userType === 'staff' ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:text-white hover:bg-white/5"
                                                    )}
                                                >
                                                    Faculty
                                                </button>
                                            </div>
                                            <Button
                                                onClick={() => userType === 'student' ? setIsAddStudentOpen(true) : setIsAddStaffOpen(true)}
                                                className="bg-indigo-600 hover:bg-indigo-500 border border-indigo-500/50 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)] h-11 text-xs font-semibold px-6 rounded-xl transition-all"
                                            >
                                                Add {userType === 'student' ? 'Student' : 'Faculty'}
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="p-8 lg:p-12 space-y-10">
                                        <div className="relative">
                                            <div className="relative flex items-center bg-[#13151A] border border-white/10 rounded-2xl px-6 h-16 w-full shadow-inner focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                                                <Search className="h-6 w-6 text-slate-400" />
                                                <input
                                                    type="text"
                                                    placeholder={`Query ${userType} databases...`}
                                                    className="w-full h-full bg-transparent pl-4 border-none font-medium text-white placeholder:text-slate-500 focus:ring-0 outline-none text-base"
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                />
                                                {isSearching && <RefreshCw className="h-5 w-5 text-indigo-400 animate-spin" />}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            {isSearching ? (
                                                <div className="text-center py-20">
                                                    <Loader2 className="h-8 w-8 text-indigo-400 animate-spin mx-auto mb-4" />
                                                    <p className="font-semibold text-slate-500 text-sm">Accessing Secure Records...</p>
                                                </div>
                                            ) : searchResults.length > 0 ? (
                                                <div className="space-y-3">
                                                    {searchResults.map((user) => (
                                                        <div key={user.id} className="flex flex-col md:flex-row md:items-center justify-between p-6 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all group">
                                                            <div className="flex items-center gap-6">
                                                                <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold text-xl border border-indigo-500/20 shadow-sm">
                                                                    {(user.name || user.full_name || '?')[0]}
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-white text-lg tracking-tight">
                                                                        {user.name || user.full_name}
                                                                    </p>
                                                                    <div className="flex items-center gap-4 mt-1.5">
                                                                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest bg-[#13151A] px-2.5 py-1 rounded-md border border-white/5">
                                                                            ID: {userType === 'student' ? (user.roll_number || 'N/A') : (user.staff_id || 'N/A')}
                                                                        </span>
                                                                        <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                                                                            {user.department || 'GENERAL'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-3 mt-6 md:mt-0">
                                                                <Link href={`/admin/${userType === 'student' ? 'students' : 'staff'}/${user.id}`}>
                                                                    <Button variant="outline" className="h-11 w-11 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 hover:text-white transition-all text-slate-400 p-0">
                                                                        <ArrowUpRight className="h-5 w-5" />
                                                                    </Button>
                                                                </Link>
                                                                <Button
                                                                    variant="outline"
                                                                    onClick={() => handleDeleteUser(user.id)}
                                                                    className="h-11 w-11 rounded-xl border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 transition-all text-rose-400 p-0"
                                                                >
                                                                    <Trash2 className="h-5 w-5" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-20 rounded-3xl border border-dashed border-white/10 bg-white/5">
                                                    <h3 className="text-sm font-semibold text-slate-400 mb-1">
                                                        {searchQuery ? `No matches identified for "${searchQuery}"` : `No ${userType}s found in the database`}
                                                    </h3>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        )
                    }
                </main>
            </div>

            {/* 11. Footer */}
            <footer className="mt-20 border-t bg-white/5/5 py-12 px-12">
                <div className="w-full mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
                    <div className="flex items-center gap-8">
                        <div className="h-10 w-10 shrink-0 rounded-lg bg-white/5/10 flex items-center justify-center text-zinc-500">
                            <ShieldCheck className="h-9 w-9 shrink-0 shrink-0" />
                        </div>
                        <p className="text-sm font-bold text-zinc-500 uppercase tracking-tighter">Student Academic Platform v4.0 (AI Unleashed)</p>
                    </div>
                    <div className="flex gap-12">
                        <a href="#" className="text-sm font-bold text-zinc-700 uppercase tracking-widest mb-1 hover:text-primary transition-colors">Documentation</a>
                        <a href="#" className="text-sm font-bold text-zinc-700 uppercase tracking-widest mb-1 hover:text-primary transition-colors">API Status</a>
                        <a href="#" className="text-sm font-bold text-zinc-700 uppercase tracking-widest mb-1 hover:text-primary transition-colors">Contact Support</a>
                    </div>
                </div>
            </footer>

            {/* Custom Global Styles for Premium Aesthetics */}
            <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;900&display=swap');
        
        body {
          font-family: 'Outfit', sans-serif;
        }

        .recharts-cartesian-grid-horizontal line, 
        .recharts-cartesian-grid-vertical line {
            stroke: rgba(255,255,255,0.05);
        }
        
        .recharts-polar-grid-angle line,
        .recharts-polar-grid-concentric polygon {
            stroke: rgba(255,255,255,0.1) !important;
        }
        
        text.recharts-text, text.recharts-cartesian-axis-tick-value {
            fill: #94a3b8 !important; /* text-slate-400 */
        }
    `}</style>

            {/* --- Interactive Modals --- */}
            <InterventionModal
                isOpen={isInterventionOpen}
                onClose={() => setIsInterventionOpen(false)}
                cluster={selectedCluster}
            />
            <GlobalActionPlanModal
                isOpen={isActionPlanOpen}
                onClose={() => setIsActionPlanOpen(false)}
                data={data}
            />
            <AddStudentModal
                isOpen={isAddStudentOpen}
                onClose={() => setIsAddStudentOpen(false)}
                onSuccess={() => { performSearch(); }}
            />
            <AddStaffModal
                isOpen={isAddStaffOpen}
                onClose={() => setIsAddStaffOpen(false)}
                onSuccess={() => { performSearch(); }}
            />
            <StudentPredictionInsightPanel
                isOpen={isPredictionInsightOpen}
                onClose={() => setIsPredictionInsightOpen(false)}
                data={selectedStudentPrediction}
                loading={isInsightLoading}
            />
        </div >
    );
}
