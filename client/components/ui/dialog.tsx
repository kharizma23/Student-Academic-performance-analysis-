"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

interface DialogProps {
    isOpen: boolean
    onClose: () => void
    children: React.ReactNode
    title?: string
    description?: string
    className?: string
}

export function Dialog({ isOpen, onClose, children, title, description, className }: DialogProps) {
    React.useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose()
        }
        if (isOpen) document.body.style.overflow = "hidden"
        else document.body.style.overflow = "unset"
        window.addEventListener("keydown", handleEsc)
        return () => window.removeEventListener("keydown", handleEsc)
    }, [isOpen, onClose])

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className={cn(
                            "relative w-full max-w-2xl bg-[#1C1F26] border border-white/10 rounded-3xl shadow-2xl shadow-indigo-500/10 overflow-hidden",
                            className
                        )}
                    >
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                                <div>
                                    {title && <h2 className="text-2xl font-bold text-white tracking-tight leading-tight">{title}</h2>}
                                    {description && <p className="text-sm font-medium text-slate-400 mt-2">{description}</p>}
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-xl hover:bg-white/10 text-slate-500 hover:text-white transition-colors"
                                >
                                    <X className="h-8 w-8 shrink-0" />
                                </button>
                            </div>
                            <div className="max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                                {children}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
