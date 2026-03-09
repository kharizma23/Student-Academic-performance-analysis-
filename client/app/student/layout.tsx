import Link from "next/link"
import { LayoutDashboard, GraduationCap, LineChart, BookOpen, Settings, User, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export default function StudentLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen w-full flex-col bg-[#0A0A0B] md:flex-row">
            {/* Sidebar */}
            <aside className="fixed inset-y-0 left-0 z-50 hidden w-80 flex-col border-r border-white/5 bg-[#0D0E12] sm:flex transition-all duration-300 shadow-2xl">
                <div className="flex h-24 items-center px-8 border-b border-white/5">
                    <Link className="flex items-center gap-6 group" href="/student">
                        <div className="h-12 w-12 bg-indigo-600 flex items-center justify-center text-white rounded-xl shadow-[0_0_15px_rgba(79,70,229,0.3)]">
                            <GraduationCap className="h-8 w-8" />
                        </div>
                        <span className="font-black text-2xl tracking-tighter text-white uppercase">Portal</span>
                    </Link>
                </div>

                <div className="flex-1 overflow-auto py-10">
                    <nav className="grid gap-2 px-6 text-[10px] font-bold uppercase tracking-widest">
                        <NavItem href="/student" icon={LayoutDashboard} label="Dashboard" active />
                        <NavItem href="/student/academics" icon={BookOpen} label="Academics" />
                        <NavItem href="/student/analytics" icon={LineChart} label="AI Analytics" />
                        <NavItem href="/student/profile" icon={User} label="My Profile" />
                        <div className="mt-10 pt-10 border-t border-white/5">
                            <NavItem href="/student/settings" icon={Settings} label="Settings" />
                            <NavItem href="/" icon={LogOut} label="Logout" className="text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 border-none" />
                        </div>
                    </nav>
                </div>

                <div className="p-4 mt-auto">
                    <div className="bg-[#13151A] p-5 rounded-2xl border border-white/5 shadow-inner">
                        <p className="text-[10px] font-black text-slate-500 mb-3 uppercase tracking-widest">System Status</p>
                        <div className="flex items-center gap-4">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Neural Engines Live</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex flex-col flex-1 sm:pl-80 min-w-0">
                <header className="sticky top-0 z-40 flex h-24 items-center gap-8 border-b border-white/5 bg-[#0D0E12]/80 backdrop-blur-xl px-4 sm:px-12">
                    <div className="flex-1 flex items-center justify-between gap-8">
                        <div className="flex items-center gap-8">
                            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest hidden md:block">
                                Academic Cycle <span className="text-white ml-2">2023-24</span>
                            </h2>
                        </div>
                        <div className="flex items-center gap-8">
                            <div className="hidden sm:flex h-11 items-center px-6 rounded-xl border border-white/5 bg-[#13151A] text-[10px] font-black uppercase tracking-widest text-indigo-400">
                                Student Node <span className="text-white ml-3">2024001</span>
                            </div>
                            <div className="h-12 w-12 bg-indigo-600/10 border border-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 shadow-lg">
                                <User className="h-6 w-6" />
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-6 lg:p-12 animate-in">
                    {children}
                </main>
            </div>
        </div>
    )
}

function NavItem({ href, icon: Icon, label, active, className }: { href: string, icon: any, label: string, active?: boolean, className?: string }) {
    return (
        <Link
            href={href}
            className={cn(
                "group flex items-center gap-6 px-6 py-4 rounded-xl transition-all",
                active
                    ? "bg-indigo-600/10 text-white border border-indigo-500/30 shadow-[inset_0_0_20px_rgba(79,70,229,0.05)]"
                    : "text-slate-500 hover:text-white hover:bg-white/5 border border-transparent",
                className
            )}
        >
            <Icon className={cn("h-5 w-5", active ? "text-indigo-400" : "text-slate-500 group-hover:text-indigo-400 transition-colors")} />
            <span className="font-bold text-xs">{label}</span>
        </Link>
    )
}
