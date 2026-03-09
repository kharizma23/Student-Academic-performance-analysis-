"use client"

import { useState, useEffect } from "react"
import { LogOut, Settings2, X, ShieldAlert, Maximize2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

export function GlobalWidget() {
    const [isOpen, setIsOpen] = useState(false)
    const router = useRouter()

    useEffect(() => {
        // Theme is now controlled by standard Next.js/Tailwind defaults (Light mode)
        const root = document.documentElement
        root.classList.remove('theme-invert')
    }, [])

    const handleExit = () => {
        localStorage.removeItem('token')
        router.push('/')
    }

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }

    return (
        <div className="fixed bottom-10 right-10 z-[1000] flex flex-col items-end gap-10">
            {/* Viewport Glow Neutralization - Explicitly removed blue inset shadow */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="flex flex-col gap-8"
                    >
                        {/* Terminal Control Panel */}
                        <div className="bg-black p-6 border-2 border-black w-80 relative overflow-hidden group">

                            <p className="text-[10px] font-bold uppercase text-zinc-500 tracking-[0.3em] mb-6 text-center">
                                System Terminal
                            </p>

                            <div className="flex flex-col gap-6">
                                <div className="flex items-center gap-6 px-5 py-4 bg-zinc-900 border border-zinc-800 text-white">
                                    <ShieldAlert className="h-8 w-8 shrink-0 text-white" />
                                    <span className="text-xs font-bold uppercase tracking-widest ">Active Node</span>
                                </div>

                                {/* Full Screen Toggle */}
                                <button
                                    onClick={toggleFullScreen}
                                    className="flex items-center gap-6 px-5 py-4 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors text-white group/fs"
                                >
                                    <Maximize2 className="h-8 w-8 shrink-0 text-white" />
                                    <span className="text-xs font-bold uppercase tracking-widest">Full Screen</span>
                                </button>
                            </div>
                        </div>

                        {/* Security Exit */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleExit}
                            className="flex items-center justify-center gap-6 bg-white text-black p-5 border-2 border-black transition-all group"
                        >
                            <LogOut className="h-9 w-9 shrink-0 group-hover:-translate-x-1 transition-transform shrink-0" />
                            <span className="text-sm font-bold uppercase tracking-widest">Terminate Session</span>
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Core Toggle */}
            <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "h-16 w-16 flex items-center justify-center shadow-none transition-all duration-500 border-2 border-black z-10",
                    isOpen ? "bg-white text-black" : "bg-black text-white"
                )}
            >
                {isOpen ? <X className="h-9 w-9 shrink-0" /> : <Settings2 className="h-9 w-9 shrink-0" />}
            </motion.button>
        </div>
    )
}
