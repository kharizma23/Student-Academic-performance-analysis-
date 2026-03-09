"use client"

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ShieldCheck, Users, BookOpen, ChevronRight } from "lucide-react";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-[#030712] overflow-hidden flex flex-col items-center justify-center p-6 selection:bg-indigo-500/30">
      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-900/20 rounded-full blur-[160px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 w-full max-w-screen-2xl mx-auto flex flex-col items-center gap-12 lg:gap-20 py-10 lg:py-20">
        {/* Institutional Branding */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center text-center space-y-8"
        >
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl lg:text-8xl font-black text-white tracking-tighter uppercase leading-tight">
              Institutional <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-500">Intelligence</span>
            </h1>
            <p className="text-indigo-200/50 text-sm md:text-base font-bold uppercase tracking-[0.5em] lg:tracking-[0.8em]">Role Based Access Environment</p>
          </div>
        </motion.div>

        {/* Enhanced Role Grid - Large Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 w-full px-4 lg:px-12">
          <RoleItem
            href="/login?role=admin"
            title="ADMINISTRATIVE"
            subtitle="Central Command & Control"
            icon={ShieldCheck}
            gradient="from-indigo-600 via-indigo-800 to-slate-900"
            delay={0.1}
          />

          <RoleItem
            href="/login?role=faculty"
            title="INSTITUTIONAL"
            subtitle="Academic Node Oversight"
            icon={Users}
            gradient="from-slate-700 via-slate-800 to-slate-950"
            delay={0.2}
          />

          <RoleItem
            href="/login?role=student"
            title="LEARNING"
            subtitle="Knowledge Engine Access"
            icon={BookOpen}
            gradient="from-blue-600 via-indigo-900 to-slate-900"
            delay={0.3}
          />
        </div>

        {/* Footer Integrity */}
        <div className="mt-12 lg:mt-20 flex flex-col items-center gap-4">
          <div className="h-px w-32 bg-indigo-500/20" />
          <p className="text-[10px] md:text-xs font-black text-indigo-300/20 uppercase tracking-[1em]">Integrated Ecosystem v4.0</p>
        </div>
      </div>
    </main>
  );
}

function RoleItem({ href, title, subtitle, icon: Icon, gradient, delay }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="h-full"
    >
      <Link href={href} className="group relative block h-full w-full">
        <div className="glass-card relative overflow-hidden group-hover:border-indigo-500/50 transition-all duration-500 h-full min-h-[400px] lg:min-h-[500px] flex flex-col justify-end p-6 lg:p-10 z-10">

          {/* Card Visual Background Gradient */}
          <div className={cn("absolute inset-0 bg-gradient-to-br opacity-80 group-hover:opacity-100 transition-opacity duration-700 z-0", gradient)}>
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors duration-700" />
          </div>

          {/* Large Background Icon */}
          <div className="absolute top-10 right-10 z-0 opacity-10 group-hover:opacity-30 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700 text-white pointer-events-none">
            <Icon size={250} strokeWidth={1} />
          </div>

          {/* Card Content */}
          <div className="relative z-10 space-y-4">
            <div className="h-16 w-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 mb-8 group-hover:bg-indigo-500/80 transition-colors duration-500">
              <Icon className="text-white h-8 w-8" />
            </div>

            <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tight uppercase group-hover:text-indigo-200 transition-colors leading-none">{title}</h2>
            <p className="text-sm lg:text-base font-bold text-indigo-100/60 uppercase tracking-widest">{subtitle}</p>

            <div className="pt-8 flex items-center justify-between">
              <div className="h-1 w-12 bg-indigo-500 group-hover:w-32 transition-all duration-700" />
              <ChevronRight className="text-white opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-500 h-8 w-8" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
