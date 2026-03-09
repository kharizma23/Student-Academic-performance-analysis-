"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Activity,
    Target,
    Zap,
    TrendingUp,
    ArrowUpRight,
    CheckCircle2,
    Circle,
    Calendar,
    Clock,
    Plus,
    BrainCircuit,
    Sparkles,
    MessageSquare,
    ChevronRight,
    LayoutDashboard,
    ListTodo,
    Play,
    RotateCcw,
    Loader2,
    Search,
    Trophy,
    UserCheck
} from "lucide-react"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

export default function StudentDashboard() {
    const router = useRouter()
    const [student, setStudent] = useState<any>(null)
    const [todos, setTodos] = useState<any[]>([])
    const [studyPlan, setStudyPlan] = useState<any[]>([])
    const [newTodo, setNewTodo] = useState("")
    const [goal, setGoal] = useState("")
    const [isGenerating, setIsGenerating] = useState(false)
    const [loading, setLoading] = useState(true)
    const [feedbackList, setFeedbackList] = useState<any[]>([])
    const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
    const [seconds, setSeconds] = useState(1500) // 25 minutes default
    const [showReschedule, setShowReschedule] = useState<string | null>(null) // todoId
    const [rescheduleDate, setRescheduleDate] = useState("")
    const [searchTerm, setSearchTerm] = useState("")
    const [highlightedDays, setHighlightedDays] = useState<number[]>([])

    useEffect(() => {
        let interval: any
        if (activeTaskId) {
            interval = setInterval(() => {
                setSeconds(prev => (prev > 0 ? prev - 1 : 0))
            }, 1000)
        } else {
            setSeconds(1500)
        }
        return () => clearInterval(interval)
    }, [activeTaskId])

    useEffect(() => {
        fetchData()
    }, [])

    const getApiUrl = (path: string) => {
        // Force 127.0.0.1 to avoid localhost resolution issues on some Windows setups
        return `http://127.0.0.1:8000${path}`;
    };

    const fetchData = async () => {
        const token = localStorage.getItem('token')
        const headers = { 'Authorization': `Bearer ${token}` }

        try {
            const profileRes = await fetch(getApiUrl("/student/profile"), { headers })
            if (profileRes.status === 401) {
                router.push("/")
                return
            }
            if (profileRes.ok) setStudent(await profileRes.json())

            const todosRes = await fetch(getApiUrl("/student/todos"), { headers })
            if (todosRes.ok) setTodos(await todosRes.json())

            const planRes = await fetch(getApiUrl("/student/study-plan"), { headers })
            if (planRes.ok) setStudyPlan(await planRes.json())

            const feedbackRes = await fetch(getApiUrl("/student/feedback"), { headers })
            if (feedbackRes.ok) setFeedbackList(await feedbackRes.json())
        } catch (error) {
            console.error("Failed to fetch dashboard data", error)
        } finally {
            setLoading(false)
        }
    }

    const handleAddTodo = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newTodo) return

        const token = localStorage.getItem('token')
        const response = await fetch(getApiUrl("/student/todos"), {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ task_name: newTodo, student_id: student?.id })
        })

        if (response.ok) {
            setNewTodo("")
            fetchData()
        }
    }

    const handleGenerateRoadmap = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!goal.trim()) return

        setIsGenerating(true)
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(getApiUrl('/student/generate-roadmap'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ goal })
            })

            if (response.ok) {
                setGoal("")
                fetchData()
            }
        } catch (error) {
            console.error("Error generating roadmap:", error)
        } finally {
            setIsGenerating(false)
        }
    }

    const handleRescheduleTodo = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        if (!showReschedule || !rescheduleDate) return

        try {
            const token = localStorage.getItem('token')
            let targetId = showReschedule;

            if (showReschedule.startsWith('plan-')) {
                const planId = showReschedule.split('-')[1];
                const planItem = studyPlan.find(p => p.id === planId);
                if (planItem) {
                    const createRes = await fetch(getApiUrl('/student/todos'), {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            task_name: planItem.topic,
                            difficulty: "Medium",
                            priority: "Medium",
                            status: "Not Started"
                        })
                    });
                    if (createRes.ok) {
                        const newTodo = await createRes.json();
                        targetId = newTodo.id;
                    }
                }
            }

            await fetch(getApiUrl(`/student/todos/${targetId}/reschedule`), {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ due_date: rescheduleDate })
            })
            setShowReschedule(null)
            setRescheduleDate("")
            fetchData()
        } catch (error) {
            console.error("Error rescheduling todo:", error)
            fetchData()
        }
    }

    const handleMapClick = (topic: string) => {
        const baseTopicMatch = topic.match(/\[.*?\][^(]+/);
        if (baseTopicMatch) {
            setSearchTerm(baseTopicMatch[0].trim());
        } else {
            setSearchTerm(topic.split(" (Day")[0].trim());
        }

        const searchInput = document.getElementById("roadmap-search");
        if (searchInput) {
            searchInput.focus();
            searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    const handleStartTask = async (id: string, e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault()
            e.stopPropagation()
        }

        let targetId = id
        const token = localStorage.getItem('token')

        try {
            if (id.startsWith('plan-') || id.startsWith('extra-')) {
                let taskName = "";
                if (id.startsWith('plan-')) {
                    const planId = id.split('-')[1];
                    const planItem = studyPlan.find(p => p.id.toString() === planId);
                    if (planItem) {
                        taskName = planItem.topic;
                        const hrsMatch = planItem.topic.match(/- (\d+) Hrs/);
                        if (hrsMatch) {
                            setSeconds(parseInt(hrsMatch[1], 10) * 3600);
                        } else {
                            setSeconds(1500);
                        }
                    }
                } else if (id.startsWith('extra-')) {
                    taskName = decodeURIComponent(id.replace('extra-', ''));
                    setSeconds(1500);
                }

                if (taskName) {
                    const createRes = await fetch(getApiUrl('/student/todos'), {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            task_name: taskName,
                            difficulty: id.startsWith('extra-') ? "Medium" : "High",
                            priority: "Medium",
                            status: "Not Started"
                        })
                    });
                    if (createRes.ok) {
                        const newTodo = await createRes.json();
                        targetId = newTodo.id;
                    } else {
                        return;
                    }
                }
            }

            // Optimistic UI update
            setTodos(prev => prev.map(t => t.id === targetId ? { ...t, status: 'In Progress' } : t))
            setActiveTaskId(targetId)

            const response = await fetch(getApiUrl(`/student/todos/${targetId}/start`), {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (response.ok) {
                fetchData()
            } else {
                fetchData() // revert if error
            }
        } catch (error) {
            console.error("Error starting task:", error)
            fetchData() // revert
        }
    }

    const handleCompleteTask = async (id: string, e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault()
            e.stopPropagation()
        }

        let targetId = id
        const token = localStorage.getItem('token')

        try {
            if (id.startsWith('plan-') || id.startsWith('extra-')) {
                let taskName = "";
                if (id.startsWith('plan-')) {
                    const planId = id.split('-')[1];
                    const planItem = studyPlan.find(p => p.id === planId);
                    if (planItem) taskName = planItem.topic;
                } else if (id.startsWith('extra-')) {
                    taskName = decodeURIComponent(id.replace('extra-', ''));
                }

                if (taskName) {
                    const createRes = await fetch(getApiUrl('/student/todos'), {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            task_name: taskName,
                            difficulty: id.startsWith('extra-') ? "Medium" : "High",
                            priority: "Medium",
                            status: "Not Started"
                        })
                    });
                    if (createRes.ok) {
                        const newTodo = await createRes.json();
                        targetId = newTodo.id;
                    } else {
                        return;
                    }
                }
            }

            // Optimistic UI update
            setTodos(prev => prev.map(t => t.id === targetId ? { ...t, status: 'Completed', is_completed: true } : t))
            setActiveTaskId(null)

            const response = await fetch(getApiUrl(`/student/todos/${targetId}/complete`), {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (response.ok) {
                fetchData() // Refetch everything to get new XP and stats!
            } else {
                fetchData() // revert
            }
        } catch (error) {
            console.error("Error completing task:", error)
            fetchData() // revert
        }
    }

    const toggleTodo = async (id: string) => {
        const token = localStorage.getItem('token')
        await fetch(getApiUrl(`/student/todos/${id}`), {
            method: "PATCH",
            headers: { 'Authorization': `Bearer ${token}` }
        })
        fetchData()
    }

    if (loading) return (
        <div className="flex items-center justify-center h-[600px]">
            <div className="h-14 w-14 shrink-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    )

    return (
        <main className="flex-1 p-8 md:p-12 space-y-12 w-full mx-auto min-h-screen">
            <div className="flex flex-col lg:flex-row gap-10 animate-in pb-10">
                {/* Main Content Area */}
                <div className="flex-1 space-y-10">
                    <div className="flex flex-col gap-4">
                        <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-white mb-2">Student Interface</h1>
                        <p className="text-lg text-slate-300 font-semibold">Welcome back, <span className="text-white font-extrabold border-b-2 border-indigo-500/50 pb-0.5">{student?.user?.full_name || "Scholar"}</span>. Ready to reach your goals today?</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            title="Daily Streak"
                            value={student?.streak_count || "0"}
                            subValue="Days active"
                            icon={Zap}
                            color="text-amber-400"
                            iconColor="text-amber-400"
                        />
                        <StatCard
                            title="Productivity XP"
                            value={student?.xp_points || "0"}
                            subValue="Tasks completed"
                            icon={Sparkles}
                            color="text-emerald-400"
                            iconColor="text-emerald-400"
                        />
                        <StatCard
                            title="Growth Index"
                            value={student?.growth_index?.toFixed(1) || "0.0"}
                            subValue="Skill progression rate"
                            icon={TrendingUp}
                            color="text-white"
                            iconColor="text-purple-400"
                        />
                        <StatCard
                            title="Current CGPA"
                            value={student?.current_cgpa?.toFixed(2) || "0.00"}
                            subValue="Cumulative"
                            icon={Activity}
                            color="text-white"
                            iconColor="text-indigo-400"
                        />
                    </div>

                    <div className="grid gap-8 lg:grid-cols-2">
                        {/* Daily Roadmap Card */}
                        <Card className="neon-card lg:col-span-1 h-full flex flex-col">
                            <CardHeader className="p-6 border-b border-white/5 bg-white/5">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-3 text-sm font-bold tracking-tight text-white">
                                        <Zap className="h-5 w-5 text-indigo-400" />
                                        Daily Roadmap
                                    </CardTitle>
                                    <div className="flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Active</span>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 flex-1 flex flex-col min-h-0 overflow-hidden px-6 pb-6 relative">
                                <form onSubmit={handleGenerateRoadmap} className="flex gap-2 mt-6">
                                    <div className="relative flex-1 group/input">
                                        <Input
                                            placeholder="What's your goal? (e.g., Master DSA)"
                                            value={goal}
                                            onChange={(e) => setGoal(e.target.value)}
                                            className="h-12 pl-5 pr-12 bg-white/5 border-white/5 focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/10 text-[11px] font-bold text-slate-300 rounded-xl transition-all"
                                            disabled={isGenerating}
                                        />
                                        <Sparkles className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-500/40 group-focus-within/input:text-indigo-400 transition-colors" />
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={isGenerating || !goal.trim()}
                                        className="h-12 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[10px] uppercase tracking-widest shrink-0 shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all flex items-center gap-3"
                                    >
                                        {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                                    </Button>
                                </form>

                                <div className="mt-4 relative group/search">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within/search:text-indigo-400 transition-colors" />
                                    <Input
                                        placeholder="Search for a course or task..."
                                        className="h-10 pl-11 pr-4 bg-white/5 border-white/5 focus:border-indigo-500/30 focus:ring-0 text-[11px] font-bold text-slate-300 rounded-xl transition-all"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-[450px] mt-4">
                                    {(() => {
                                        const activeTodos = todos.filter(t => !t.is_completed);
                                        const filteredTodos = activeTodos.filter(t => t.task_name.toLowerCase().includes(searchTerm.toLowerCase()));
                                        let results = [...filteredTodos];
                                        if (searchTerm.trim().length > 0) {
                                            const planMatchesMap = new Map();
                                            studyPlan.forEach(p => {
                                                if (p.is_completed) return;

                                                const baseTopicMatch = p.topic.match(/(.*)\s+\(Day \d+\/\d+\)/);
                                                const baseTopic = baseTopicMatch ? baseTopicMatch[1].trim() : p.topic;

                                                if (baseTopic.toLowerCase().includes(searchTerm.toLowerCase())) {
                                                    if (!planMatchesMap.has(baseTopic)) {
                                                        const hrsMatch = p.topic.match(/- (\d+) Hrs/);
                                                        const hrs = hrsMatch ? parseInt(hrsMatch[1], 10) : 0;

                                                        const allDays = studyPlan.filter(d => d.topic.startsWith(baseTopic));
                                                        const totalDays = allDays.length;
                                                        const completedDays = allDays.filter(d => d.is_completed).length;
                                                        const totalHrs = totalDays * hrs;
                                                        const remainingHrs = (totalDays - completedDays) * hrs;

                                                        planMatchesMap.set(baseTopic, {
                                                            id: `plan-${p.id}`,
                                                            task_name: baseTopic,
                                                            difficulty: "Medium",
                                                            status: "Not Started",
                                                            is_completed: false,
                                                            is_from_plan: true,
                                                            base_topic: baseTopic,
                                                            all_plan_days: allDays.map(d => d.day_number),
                                                            hours_per_day: hrs,
                                                            total_days: totalDays,
                                                            completed_days: completedDays,
                                                            total_hrs: totalHrs,
                                                            remaining_hrs: remainingHrs
                                                        });
                                                    }
                                                }
                                            });
                                            const planMatches = Array.from(planMatchesMap.values());
                                            const existingNames = new Set(results.map(r => r.task_name.toLowerCase()));
                                            planMatches.forEach(pm => {
                                                if (!existingNames.has(pm.task_name.toLowerCase())) {
                                                    results.push(pm);
                                                    existingNames.add(pm.task_name.toLowerCase());
                                                }
                                            });

                                            // Dynamic Generation for arbitrary search terms
                                            if (results.length < 20 && searchTerm.trim().length > 1) {
                                                const extraPrefixes = [
                                                    "Master", "Deep Dive into", "Practice", "Optimize", "Scale",
                                                    "Review", "Advanced Concept:", "Build Project in", "Case Study:",
                                                    "Core logic of", "Architecture of", "Fundamentals of", "Troubleshoot",
                                                    "Deploy", "Test", "Analyze", "Design", "Implement", "Explore", "Research"
                                                ];
                                                let missingCount = 20 - results.length;
                                                let pIdx = 0;

                                                while (missingCount > 0 && pIdx < extraPrefixes.length) {
                                                    const prefix = extraPrefixes[pIdx];
                                                    const fakeTaskName = `${prefix} ${searchTerm.trim()}`;

                                                    if (!existingNames.has(fakeTaskName.toLowerCase())) {
                                                        results.push({
                                                            id: `extra-${encodeURIComponent(fakeTaskName)}`,
                                                            task_name: fakeTaskName,
                                                            difficulty: ["Master", "Optimize", "Scale", "Advanced Concept:", "Architecture of"].includes(prefix) ? "High" : "Medium",
                                                            status: "Not Started",
                                                            is_completed: false,
                                                            is_from_plan: false,
                                                            is_extra_search: true
                                                        });
                                                        existingNames.add(fakeTaskName.toLowerCase());
                                                        missingCount--;
                                                    }
                                                    pIdx++;
                                                }
                                            }
                                        }

                                        return results.map((todo) => {
                                            const normalizedTaskName = todo.task_name.toLowerCase();
                                            const matchPlan = studyPlan.find(p => p.topic && normalizedTaskName.includes(p.topic.toLowerCase())) ||
                                                (todo.is_from_plan ? studyPlan.find(p => p.topic?.toLowerCase() === normalizedTaskName) : null);
                                            const isInTask = !!matchPlan;

                                            return (
                                                <div
                                                    key={todo.id}
                                                    onClick={() => {
                                                        if (todo.is_from_plan && todo.all_plan_days) {
                                                            setHighlightedDays(todo.all_plan_days);
                                                            setTimeout(() => setHighlightedDays([]), 3000);
                                                            document.getElementById('progress-map-container')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                        } else if (matchPlan) {
                                                            setHighlightedDays([matchPlan.day_number]);
                                                            setTimeout(() => setHighlightedDays([]), 3000);
                                                            document.getElementById('progress-map-container')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                        }
                                                    }}
                                                    className={cn(
                                                        "flex flex-col gap-3 p-5 rounded-2xl border transition-all duration-300",
                                                        matchPlan ? "cursor-pointer" : "",
                                                        todo.is_completed ? "bg-emerald-500/5 border-emerald-500/20 opacity-80" :
                                                            todo.status === "In Progress" ? "bg-indigo-500/10 border-indigo-500/30 border-animate" :
                                                                "bg-[#13151A] border-white/5 hover:border-indigo-500/30"
                                                    )}
                                                >
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                                {isInTask ? (
                                                                    <span
                                                                        className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 text-[8px] font-black uppercase border border-purple-500/20 transition-colors"
                                                                    >
                                                                        In Task {matchPlan ? `(Day ${matchPlan.day_number})` : ''}
                                                                    </span>
                                                                ) : (
                                                                    <span className="px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-400 text-[8px] font-black uppercase border border-slate-500/20">Out of Task</span>
                                                                )}
                                                                <span className={cn(
                                                                    "px-2 py-0.5 rounded-full text-[8px] font-black uppercase border",
                                                                    todo.difficulty === "High" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                                                                )}>{todo.difficulty}</span>
                                                                {todo.due_date && <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[8px] font-black uppercase border border-amber-500/20 text-nowrap">Scheduled: {new Date(todo.due_date).toLocaleDateString()}</span>}
                                                            </div>
                                                            <h4 className="text-[13px] font-bold text-white leading-tight truncate">{todo.task_name}</h4>
                                                            {todo.is_from_plan && todo.total_days > 1 && (
                                                                <div className="mt-2 text-[10px] flex items-center gap-3 text-slate-400 font-bold">
                                                                    <span className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded"><Calendar className="w-3 h-3 text-indigo-400" /> {todo.completed_days} / {todo.total_days} Days Covered</span>
                                                                    <span className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded"><Clock className="w-3 h-3 text-amber-400" /> {todo.remaining_hrs} Hrs Remaining</span>
                                                                </div>
                                                            )}
                                                            {todo.status === "In Progress" && (
                                                                <div className="flex items-center gap-3 mt-3">
                                                                    <div className="h-1 w-20 bg-white/5 rounded-full overflow-hidden">
                                                                        <div className="h-full bg-indigo-500" style={{ width: `${(seconds / (todo.hours_per_day ? todo.hours_per_day * 3600 : 1500)) * 100}%` }} />
                                                                    </div>
                                                                    <span className="text-[10px] font-black text-indigo-400">
                                                                        {(() => {
                                                                            const h = Math.floor(seconds / 3600);
                                                                            const m = Math.floor((seconds % 3600) / 60);
                                                                            const s = seconds % 60;
                                                                            return h > 0 ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}` : `${m}:${s.toString().padStart(2, '0')}`;
                                                                        })()}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {!todo.is_completed ? (
                                                                <>
                                                                    {todo.status === "Not Started" ? (
                                                                        <Button variant="ghost" size="sm" className="h-8 rounded-xl bg-white/5 text-slate-300 hover:bg-white/10 text-[10px] font-bold px-3" onClick={() => handleStartTask(todo.id)}>
                                                                            <Play className="h-3 w-3 mr-1.5 text-indigo-400" /> Start
                                                                        </Button>
                                                                    ) : (
                                                                        <Button variant="ghost" size="sm" className="h-8 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-[10px] font-bold px-3" onClick={(e) => handleCompleteTask(todo.id, e)}>
                                                                            <CheckCircle2 className="h-3 w-3 mr-1.5" /> Complete
                                                                        </Button>
                                                                    )}
                                                                    <Button variant="ghost" size="sm" className="h-8 rounded-xl bg-white/5 text-slate-300 hover:bg-white/10 text-[10px] font-bold px-3" onClick={() => setShowReschedule(todo.id)}>
                                                                        <RotateCcw className="h-3 w-3 mr-1.5 text-slate-400" /> Reschedule
                                                                    </Button>
                                                                </>
                                                            ) : <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        });
                                    })()}
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex flex-col gap-6 lg:h-full">
                            <Card className="neon-card flex-1 flex flex-col">
                                <CardHeader className="p-6 border-b border-white/5 bg-white/5">
                                    <CardTitle className="flex items-center gap-3 text-sm font-bold tracking-tight text-white">
                                        <Calendar className="h-5 w-5 text-purple-400" />
                                        100-Day Progress Map
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 flex-1 flex flex-col justify-center" id="progress-map-container">
                                    <div className="grid grid-cols-10 gap-1.5 overflow-y-auto pr-2 custom-scrollbar">
                                        {studyPlan.map((day) => (
                                            <div
                                                key={day.id}
                                                onClick={() => handleMapClick(day.topic)}
                                                className={cn(
                                                    "aspect-square rounded-md flex items-center justify-center border transition-all cursor-pointer group relative",
                                                    highlightedDays.includes(day.day_number) ? "bg-white text-black font-black border-white shadow-[0_0_20px_rgba(255,255,255,0.8)] animate-pulse scale-110 z-10" :
                                                        day.is_completed ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300" :
                                                            day.is_rescheduled ? "bg-amber-500/20 border-amber-500/50 text-amber-400 font-black shadow-[0_0_15px_rgba(245,158,11,0.2)]" :
                                                                "bg-[#0D0E12] border-white/5 text-slate-600 hover:border-white/10 hover:text-slate-400"
                                                )}
                                            >
                                                <span className="text-[10px] font-bold">{day.day_number}</span>
                                                <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-[#1C1F26] border border-white/10 text-white text-[10px] p-4 rounded-2xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none shadow-2xl scale-95 group-hover:scale-100 origin-bottom">
                                                    <div className="font-black text-indigo-400 mb-2 uppercase tracking-widest flex items-center gap-2">
                                                        <Calendar className="h-3 w-3" /> Day {day.day_number} Progress
                                                    </div>
                                                    <div className="text-[9px] font-bold text-slate-400 mb-3 border-b border-white/5 pb-2">Target: {day.topic}</div>
                                                    {day.is_rescheduled && !day.is_completed && (
                                                        <div className="text-amber-400 text-[10px] font-bold mb-2 flex items-center gap-1">
                                                            <Clock className="w-3 h-3" /> Scheduled for later
                                                        </div>
                                                    )}
                                                    {day.completed_tasks && day.completed_tasks.length > 0 ? (
                                                        <div className="space-y-2">
                                                            {day.completed_tasks.map((task: any, idx: number) => (
                                                                <div key={idx} className="bg-white/5 p-2 rounded-lg border border-white/5 text-emerald-400 font-bold">
                                                                    {task.task_name}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : <div className="text-slate-600 italic">No tasks yet.</div>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="neon-card flex-1 min-h-[300px]">
                                <CardHeader className="p-6 border-b border-white/5 bg-white/5">
                                    <CardTitle className="flex items-center gap-3 text-sm font-bold tracking-tight text-white">
                                        <Trophy className="h-5 w-5 text-amber-400" />
                                        Extra Achievements
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 overflow-y-auto max-h-[350px] custom-scrollbar">
                                    <div className="space-y-3">
                                        {(() => {
                                            const studyPlanTopics = studyPlan.map(d => d.topic?.toLowerCase() || "");
                                            const completedTodos = todos.filter(t => t.is_completed);
                                            const rawExtraTasks = completedTodos
                                                .filter(t => !studyPlanTopics.some(topic => topic.includes(t.task_name.toLowerCase()) || t.task_name.toLowerCase().includes(topic.replace("study:", "").trim())));

                                            const seenNames = new Set();
                                            const extraTasks = [];
                                            for (const t of rawExtraTasks) {
                                                if (!seenNames.has(t.task_name.toLowerCase())) {
                                                    seenNames.add(t.task_name.toLowerCase());
                                                    extraTasks.push(t);
                                                }
                                            }

                                            return extraTasks.length > 0 ? extraTasks.map((task: any, idx) => (
                                                <div key={idx} className="flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-xl">
                                                    <Trophy className="h-4 w-4 text-amber-500" />
                                                    <div className="flex-1 text-[11px] font-bold text-slate-200">{task.task_name}</div>
                                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                                </div>
                                            )) : <p className="text-[10px] text-slate-600 text-center uppercase tracking-widest">No extra feats yet</p>
                                        })()}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Staff Feedback Section */}
                    {feedbackList.length > 0 && (
                        <Card className="neon-card overflow-hidden">
                            <CardHeader className="bg-white/5 border-b border-white/5 p-6">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-3 text-lg font-bold tracking-tight text-white">
                                        <MessageSquare className="h-5 w-5 text-purple-400" />
                                        Staff Feedback
                                    </CardTitle>
                                    <span className="text-xs font-semibold text-slate-400 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                                        {feedbackList.length} Evaluation{feedbackList.length > 1 ? 's' : ''} Received
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 space-y-8">
                                {feedbackList.map((fb: any, idx: number) => {
                                    const metrics = [
                                        { label: 'Technical Clarity', key: 'q1_technical_clarity' },
                                        { label: 'Problem Solving', key: 'q2_problem_solving' },
                                        { label: 'Code Efficiency', key: 'q3_code_efficiency' },
                                        { label: 'Algorithm Knowledge', key: 'q4_algorithm_knowledge' },
                                        { label: 'Debugging Skills', key: 'q5_debugging_skills' },
                                        { label: 'Concept Application', key: 'q6_concept_application' },
                                        { label: 'Mathematical Aptitude', key: 'q7_mathematical_aptitude' },
                                        { label: 'System Design', key: 'q8_system_design' },
                                        { label: 'Documentation', key: 'q9_documentation_quality' },
                                        { label: 'Test Coverage', key: 'q10_test_coverage_awareness' },
                                        { label: 'Presentation', key: 'q11_presentation_skills' },
                                        { label: 'Collaborative Spirit', key: 'q12_collaborative_spirit' },
                                        { label: 'Adaptability', key: 'q13_adaptability' },
                                        { label: 'Curiosity Level', key: 'q14_curiosity_level' },
                                        { label: 'Deadline Discipline', key: 'q15_deadline_discipline' },
                                        { label: 'Resourcefulness', key: 'q16_resourcefulness' },
                                        { label: 'Critical Thinking', key: 'q17_critical_thinking' },
                                        { label: 'Punctuality', key: 'q18_puncuality' },
                                        { label: 'Peer Mentoring', key: 'q19_peer_mentoring' },
                                        { label: 'Leadership Potential', key: 'q20_leadership_potential' },
                                        { label: 'Ethical Awareness', key: 'q21_ethical_awareness' },
                                        { label: 'Feedback Receptivity', key: 'q22_feedback_receptivity' },
                                        { label: 'Passion for Field', key: 'q23_passion_for_field' },
                                        { label: 'Originality of Ideas', key: 'q24_originality_of_ideas' },
                                        { label: 'Consistency Index', key: 'q25_consistency_index' },
                                    ];
                                    return (
                                        <div key={fb.id || idx} className="space-y-5 p-6 bg-white/3 rounded-2xl border border-white/5">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/5">
                                                <div>
                                                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                        Evaluation #{idx + 1}
                                                        <span className="text-white/20 px-2">•</span>
                                                        <span className="text-indigo-400 normal-case tracking-normal font-extrabold flex items-center gap-1.5 line-clamp-1">
                                                            <UserCheck className="w-4 h-4" />
                                                            {fb.faculty_name || "Faculty Member"}
                                                        </span>
                                                    </p>
                                                    {fb.detailed_remarks && (
                                                        <p className="text-sm font-medium text-slate-300 italic mt-1 border-l-2 border-purple-500/50 pl-3">
                                                            "{fb.detailed_remarks}"
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3 shrink-0">
                                                    <div className="text-center">
                                                        <div className={cn(
                                                            "text-3xl font-black",
                                                            fb.overall_rating >= 8 ? 'text-emerald-400' : fb.overall_rating >= 5 ? 'text-amber-400' : 'text-rose-400'
                                                        )}>{fb.overall_rating?.toFixed(1)}</div>
                                                        <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Overall</div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                                                {metrics.map((m) => {
                                                    const score = fb[m.key] ?? 0;
                                                    const colorClass = score >= 8 ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                                                        : score >= 5 ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300'
                                                            : 'bg-rose-500/15 border-rose-500/30 text-rose-300';
                                                    return (
                                                        <div key={m.key} className={cn('p-3 rounded-xl border text-center', colorClass)}>
                                                            <div className="text-xl font-black">{score}</div>
                                                            <div className="text-[9px] uppercase tracking-wider font-bold mt-1 leading-tight opacity-80">{m.label}</div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>
                    )}

                    {/* Performance Chart */}
                    <Card className="neon-card overflow-hidden">
                        <CardHeader className="bg-white/5 border-b border-white/5">
                            <CardTitle className="text-xl font-bold tracking-tight text-white">Performance Projection</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[400px] w-full mt-6">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={[
                                    { name: 'Sem 1', val: 7.2 },
                                    { name: 'Sem 2', val: 7.8 },
                                    { name: 'Sem 3', val: 7.5 },
                                    { name: 'Sem 4', val: 8.2 },
                                    { name: 'Sem 5', val: 8.7 },
                                ]}>
                                    <defs>
                                        <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#818cf8" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                    <YAxis domain={[0, 10]} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                    <Tooltip contentStyle={{ backgroundColor: '#1C1F26', borderRadius: '12px', border: 'none' }} />
                                    <Area type="monotone" dataKey="val" stroke="#818cf8" strokeWidth={3} fill="url(#colorVal)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                <div className="w-full lg:w-[400px] space-y-6">
                    <Card className="neon-card p-6 lg:p-8 sticky top-24 border-t-4 border-t-emerald-500">
                        <div className="space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                                    <BrainCircuit className="h-7 w-7 text-emerald-400" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold tracking-tight text-white">AI Engine</h3>
                                    <p className="text-xs font-semibold text-emerald-500 uppercase tracking-widest mt-1">Navigator Node</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-[#13151A] p-5 rounded-2xl border border-white/5 group cursor-pointer hover:border-emerald-500/30 hover:bg-white/5 transition-all relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                                    <div className="flex items-center justify-between mb-3 relative z-10">
                                        <span className="flex items-center gap-2 text-xs font-bold uppercase text-slate-400 tracking-widest">
                                            <Sparkles className="h-4 w-4 text-emerald-400" />
                                            Career Insight
                                        </span>
                                        <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-emerald-400 transition-colors" />
                                    </div>
                                    <div className="text-sm font-semibold text-white leading-relaxed relative z-10">
                                        {(() => {
                                            const suggestions = student?.ai_scores?.career_suggestions;
                                            if (!suggestions) return <span className="text-slate-500 font-normal">Waiting for faculty feedback to generate career roadmap...</span>;
                                            try {
                                                const parsed = JSON.parse(suggestions);
                                                const primaryRole = parsed.primary_path || (Array.isArray(parsed) && typeof parsed[0] === 'object' ? parsed[0].role : parsed[0]) || "Standard Path";
                                                return (
                                                    <div className="space-y-1 mt-2">
                                                        <p className="text-emerald-400 text-lg">{primaryRole}</p>
                                                        <p className="text-xs text-slate-400 font-medium">Growth Potential: <span className="text-white">{parsed.growth_potential || "High"}</span></p>
                                                    </div>
                                                );
                                            } catch (e) {
                                                return suggestions;
                                            }
                                        })()}
                                    </div>
                                </div>

                                <div className="bg-[#13151A] p-5 rounded-2xl border border-white/5 group cursor-pointer hover:border-blue-500/30 hover:bg-white/5 transition-all relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                                    <span className="flex items-center gap-2 text-xs font-bold uppercase text-slate-400 tracking-widest mb-3 relative z-10">
                                        <ArrowUpRight className="h-4 w-4 text-blue-400" />
                                        Recommended Skills
                                    </span>
                                    <div className="relative z-10">
                                        {(() => {
                                            const courses = student?.ai_scores?.recommended_courses;
                                            if (!courses) return <span className="text-sm text-slate-500 font-normal">Focus on building foundational projects in your core department subjects.</span>;
                                            try {
                                                const parsed = JSON.parse(courses);
                                                const strong = parsed.strong || [];
                                                return (
                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        {strong.slice(0, 3).map((s: string, i: number) => (
                                                            <span key={i} className="text-xs font-medium bg-blue-500/10 text-blue-300 px-3 py-1.5 rounded-lg border border-blue-500/20">{s}</span>
                                                        ))}
                                                    </div>
                                                );
                                            } catch (e) {
                                                return <span className="text-sm text-white">{courses}</span>;
                                            }
                                        })()}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-white/10">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Recent Faculty Feedback</h4>
                                <div className="space-y-4">
                                    {student?.feedback?.length > 0 ? (
                                        student.feedback.slice(0, 2).map((fb: any) => (
                                            <div key={fb.id} className="text-sm font-medium leading-relaxed italic text-slate-400 border-l-2 border-purple-500/50 pl-4 py-1">
                                                "{fb.detailed_remarks?.substring(0, 80)}..."
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm font-medium text-slate-500 italic">No feedback entries yet.</p>
                                    )}
                                </div>
                            </div>

                            <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] font-semibold h-14 rounded-xl flex items-center justify-center gap-3 mt-6 transition-all border border-emerald-500/50">
                                <MessageSquare className="h-5 w-5" />
                                Launch AI Interface
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Reschedule Modal */}
            {showReschedule && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <Card className="w-full max-w-md bg-[#0D0E12] border-white/10 neon-card">
                        <CardHeader>
                            <CardTitle className="text-white">Reschedule Task</CardTitle>
                            <CardDescription className="text-slate-400">Select a new date for this task</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <input
                                type="date"
                                className="w-full bg-[#13151A] border border-white/10 rounded-xl h-12 px-5 text-white focus:outline-none focus:border-indigo-500"
                                value={rescheduleDate}
                                onChange={(e) => setRescheduleDate(e.target.value)}
                            />
                            <div className="flex gap-3">
                                <Button
                                    onClick={() => setShowReschedule(null)}
                                    variant="outline"
                                    className="flex-1 border-white/5 text-white hover:bg-white/5"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={() => handleRescheduleTodo()}
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white"
                                >
                                    Save Date
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </main>
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
            <CardContent className="px-6 pb-8">
                <div className={cn("text-5xl font-black tracking-tighter mb-2 font-sans", color)}>{value}</div>
                {subValue && <p className="text-sm text-slate-400 font-bold uppercase tracking-wider opacity-80">{subValue}</p>}
            </CardContent>
        </Card>
    )
}
