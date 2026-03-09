"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Users,
    TrendingUp,
    AlertTriangle,
    Search,
    Filter,
    ChevronRight,
    GraduationCap,
    MessageSquare,
    Save,
    CheckCircle2,
    X
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function FacultyDashboard() {
    const [error, setError] = useState<string | null>(null)

    const getApiUrl = (path: string) => {
        // Force 127.0.0.1 to avoid localhost resolution issues on some Windows setups
        return `http://127.0.0.1:8000${path}`;
    };

    const [staff, setStaff] = useState<any>(null)
    const [students, setStudents] = useState<any[]>([])
    const [selectedYear, setSelectedYear] = useState(1)
    const [loading, setLoading] = useState(true)
    const [showFeedbackModal, setShowFeedbackModal] = useState(false)
    const [selectedStudent, setSelectedStudent] = useState<any>(null)
    const [evaluatedStudentIds, setEvaluatedStudentIds] = useState<string[]>([])
    const [feedbackData, setFeedbackData] = useState<any>({
        detailed_remarks: "",
        ...Object.fromEntries(Array.from({ length: 25 }, (_, i) => [`q${i + 1}`, 5]))
    })

    useEffect(() => {
        fetchStaffProfile()
    }, [])

    useEffect(() => {
        if (staff) {
            fetchStudents()
        }
    }, [staff, selectedYear])

    const fetchStaffProfile = async () => {
        const token = localStorage.getItem('token')
        try {
            const response = await fetch(getApiUrl("/staff/my-profile"), {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (response.ok) {
                setStaff(await response.json())
            }
        } catch (error) {
            console.error("Failed to fetch staff profile", error)
        }
    }

    const fetchStudents = async () => {
        setLoading(true)
        const token = localStorage.getItem('token')
        try {
            const response = await fetch(getApiUrl(`/staff/students?year=${selectedYear}`), {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (response.ok) {
                setStudents(await response.json())
            }

            const evaluatedResponse = await fetch(getApiUrl(`/staff/evaluated-students?year=${selectedYear}`), {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (evaluatedResponse.ok) {
                setEvaluatedStudentIds(await evaluatedResponse.json())
            }
        } catch (error) {
            console.error("Failed to fetch students or evaluated list", error)
        } finally {
            setLoading(false)
        }
    }

    const handleFeedbackSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const token = localStorage.getItem('token')

        // Map q1 to q1_technical_clarity etc in the backend format
        const metricNames = [
            "technical_clarity", "problem_solving", "code_efficiency", "algorithm_knowledge", "debugging_skills",
            "concept_application", "mathematical_aptitude", "system_design", "documentation_quality", "test_coverage_awareness",
            "presentation_skills", "collaborative_spirit", "adaptability", "curiosity_level", "deadline_discipline",
            "resourcefulness", "critical_thinking", "puncuality", "peer_mentoring", "leadership_potential",
            "ethical_awareness", "feedback_receptivity", "passion_for_field", "originality_of_ideas", "consistency_index"
        ]

        const payload: any = {
            student_id: selectedStudent.id,
            detailed_remarks: feedbackData.detailed_remarks
        }

        metricNames.forEach((name, i) => {
            payload[`q${i + 1}_${name}`] = feedbackData[`q${i + 1}`]
        })

        try {
            const response = await fetch(getApiUrl("/staff/feedback"), {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })
            if (response.ok) {
                setShowFeedbackModal(false)
                setEvaluatedStudentIds([...evaluatedStudentIds, selectedStudent.id])
                setSelectedStudent(null)
                // Reset form
                setFeedbackData({
                    detailed_remarks: "",
                    ...Object.fromEntries(Array.from({ length: 25 }, (_, i) => [`q${i + 1}`, 5]))
                })
            }
        } catch (error) {
            console.error("Feedback submission failed", error)
        }
    }

    const metrics = [
        "Technical Clarity", "Problem Solving", "Code Efficiency", "Algorithm Knowledge", "Debugging Skills",
        "Concept Application", "Mathematical Aptitude", "System Design", "Documentation Quality", "Test Coverage Awareness",
        "Presentation Skills", "Collaborative Spirit", "Adaptability", "Curiosity Level", "Deadline Discipline",
        "Resourcefulness", "Critical Thinking", "Punctuality", "Peer Mentoring", "Leadership Potential",
        "Ethical Awareness", "Feedback Receptivity", "Passion for Field", "Originality of Ideas", "Consistency Index"
    ]

    return (
        <div className="flex flex-col gap-10 animate-in pb-20 w-full max-w-[1600px] mx-auto p-8 md:p-12 min-h-screen">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-8 border-b border-white/10">
                <div className="space-y-3">
                    <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-white mb-2">Faculty Console</h1>
                    <p className="text-slate-400 font-medium text-sm flex items-center gap-2">
                        <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-white font-semibold">Department of {staff?.department}</span>
                        <span>{students.length} Under Management</span>
                    </p>
                </div>
                <div className="flex bg-[#13151A] border border-white/10 p-1 rounded-xl shadow-inner">
                    {[1, 2, 3, 4].map((year) => (
                        <button
                            key={year}
                            onClick={() => setSelectedYear(year)}
                            className={cn(
                                "px-6 py-2.5 text-xs font-semibold rounded-lg transition-all",
                                selectedYear === year ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:text-white"
                            )}
                        >
                            Year {year}
                        </button>
                    ))}
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-6 md:grid-cols-3">
                <StatCard
                    title="Total Scoped Students"
                    value={students.length}
                    icon={Users}
                    subValue={`Active in ${staff?.department}`}
                    iconColor="text-blue-400"
                />
                <StatCard
                    title="Avg Dept Performance"
                    value="7.82"
                    icon={TrendingUp}
                    subValue="+0.12 this semester"
                    color="text-white"
                    iconColor="text-emerald-400"
                />
                <StatCard
                    title="Pending Feedback"
                    value={Math.max(0, students.length - evaluatedStudentIds.length)}
                    icon={AlertTriangle}
                    subValue="Evaluations required"
                    color="text-white"
                    iconColor="text-amber-400"
                />
            </div>

            {/* Student Directory Table-like View */}
            <Card className="neon-card overflow-hidden">
                <CardHeader className="p-8 border-b border-white/5 bg-white/5">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                        <div className="space-y-2">
                            <CardTitle className="text-2xl font-bold tracking-tight text-white">Student Registry</CardTitle>
                            <CardDescription className="text-sm font-medium text-slate-500">Select record for multidimensional assessment</CardDescription>
                        </div>
                        <div className="relative w-full lg:w-[400px]">
                            <div className="relative flex items-center bg-[#13151A] border border-white/10 rounded-xl px-4 h-12 w-full shadow-inner focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all">
                                <Search className="h-5 w-5 text-slate-400 mr-3" />
                                <Input placeholder="Filter records..." className="bg-transparent border-none text-sm font-medium text-white placeholder:text-slate-500 focus-visible:ring-0 p-0 h-full w-full" />
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-white/5">
                        {loading ? (
                            <div className="p-24 text-center">
                                <div className="h-16 w-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
                                <p className="text-slate-400 font-semibold text-sm">Fetching Directory...</p>
                            </div>
                        ) : (
                            students.map((student) => (
                                <div
                                    key={student.id}
                                    className="p-8 hover:bg-white/5 transition-all flex flex-col md:flex-row md:items-center justify-between group"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className="h-16 w-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold text-2xl border border-indigo-500/20 shadow-sm">
                                            {student.name.charAt(0)}
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-xl font-bold text-white tracking-tight">{student.name}</p>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-semibold text-slate-400 bg-[#13151A] px-2.5 py-1 rounded-md border border-white/5">
                                                    ID: {student.roll_number}
                                                </span>
                                                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                                                    GPA: {student.current_cgpa}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-8 mt-6 md:mt-0">
                                        <div className="hidden lg:block text-right">
                                            <p className={cn(
                                                "text-xs font-semibold px-3 py-1 rounded-full border",
                                                student.risk_level === "High" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : "bg-white/5 text-slate-400 border-white/10"
                                            )}>
                                                STAT: {student.risk_level}
                                            </p>
                                        </div>
                                        {evaluatedStudentIds.includes(student.id) ? (
                                            <Button
                                                disabled
                                                className="h-12 px-6 bg-emerald-500/20 text-emerald-400 font-semibold text-sm rounded-xl border border-emerald-500/30"
                                            >
                                                <CheckCircle2 className="mr-2 h-5 w-5" />
                                                Evaluated
                                            </Button>
                                        ) : (
                                            <Button
                                                onClick={() => {
                                                    setSelectedStudent(student)
                                                    setShowFeedbackModal(true)
                                                }}
                                                className="h-12 px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition-all border border-indigo-500/50 shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                                            >
                                                Assess Student
                                                <ChevronRight className="ml-2 h-5 w-5" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                        {!loading && students.length === 0 && (
                            <div className="p-20 text-center space-y-4">
                                <div className="h-16 w-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
                                    <Users className="h-8 w-8 text-slate-500" />
                                </div>
                                <p className="text-sm font-semibold text-slate-400">No Students Found in this Batch</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Feedback Modal (25 Questions) */}
            {showFeedbackModal && selectedStudent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-8">
                    <Card className="max-w-4xl w-full max-h-[90vh] flex flex-col neon-card overflow-hidden">
                        <CardHeader className="p-6 md:p-8 bg-white/5 border-b border-white/5 flex flex-row items-center justify-between shrink-0">
                            <div className="flex items-center gap-5">
                                <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                                    <GraduationCap className="h-6 w-6 text-purple-400" />
                                </div>
                                <div className="space-y-1">
                                    <CardTitle className="text-xl font-bold tracking-tight text-white">Assessment Matrix</CardTitle>
                                    <CardDescription className="text-sm font-medium text-slate-400">{selectedStudent.name} | {selectedStudent.roll_number}</CardDescription>
                                </div>
                            </div>
                            <button onClick={() => setShowFeedbackModal(false)} className="h-10 w-10 rounded-xl bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 flex items-center justify-center transition-all border border-white/10">
                                <X className="h-5 w-5" />
                            </button>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-[#13151A] custom-scrollbar">
                            <form onSubmit={handleFeedbackSubmit} className="space-y-8">
                                <div className="grid gap-6 md:grid-cols-2">
                                    {metrics.map((metric, index) => (
                                        <div key={index} className="space-y-4 bg-white/5 p-5 rounded-2xl border border-white/5 hover:border-purple-500/30 transition-all">
                                            <div className="flex items-center justify-between">
                                                <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                                                    Q{index + 1}. {metric}
                                                </label>
                                                <span className="text-lg font-bold text-white bg-white/5 px-3 py-1 rounded-md border border-white/10">{feedbackData[`q${index + 1}`]}</span>
                                            </div>
                                            <Input
                                                type="range"
                                                min="1"
                                                max="10"
                                                step="1"
                                                className="h-2 w-full appearance-none bg-white/10 rounded-full outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500 cursor-pointer"
                                                value={feedbackData[`q${index + 1}`]}
                                                onChange={(e) => setFeedbackData({ ...feedbackData, [`q${index + 1}`]: parseInt(e.target.value) })}
                                            />
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-3 pt-6 border-t border-white/10">
                                    <label className="text-sm font-semibold text-white flex items-center gap-2">
                                        <MessageSquare className="h-4 w-4 text-purple-400" />
                                        Detailed Remarks / AI Training Data
                                    </label>
                                    <Textarea
                                        required
                                        className="border border-white/10 bg-white/5 p-4 min-h-[120px] focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 text-sm font-medium text-white placeholder:text-slate-500 rounded-xl resize-none transition-all"
                                        placeholder="Discuss primary vectors..."
                                        value={feedbackData.detailed_remarks}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFeedbackData({ ...feedbackData, detailed_remarks: e.target.value })}
                                    />
                                </div>

                                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
                                    <div className="text-left space-y-1">
                                        <p className="text-sm font-semibold text-white">System Impact</p>
                                        <p className="text-xs font-medium text-slate-400">Instant Insight synchronization.</p>
                                    </div>
                                    <Button type="submit" className="h-12 px-8 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm rounded-xl transition-all border border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.3)] w-full sm:w-auto">
                                        <Save className="h-5 w-5 mr-2" />
                                        Publish Evaluation
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}

function StatCard({ title, value, subValue, icon: Icon, color = "text-white", iconColor = "text-indigo-400" }: any) {
    return (
        <Card className="neon-card relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-6 px-6">
                <CardTitle className="text-xs font-semibold tracking-widest text-slate-400 uppercase">{title}</CardTitle>
                <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                    <Icon className={cn("h-6 w-6", iconColor)} />
                </div>
            </CardHeader>
            <CardContent className="px-6 pb-6">
                <div className={cn("text-4xl font-black tracking-tight mb-1 font-sans", color)}>{value}</div>
                {subValue && <p className="text-xs text-slate-500 font-medium">{subValue}</p>}
            </CardContent>
        </Card>
    )
}
