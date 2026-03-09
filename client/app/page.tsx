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
            <h1 className="text-8xl md:text-[10rem] lg:text-[15rem] font-black text-white tracking-tighter uppercase leading-[0.8] drop-shadow-2xl">
              INSTITUTIONAL <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-blue-500 to-indigo-600">INTELLIGENCE</span>
            </h1>
            <p className="text-indigo-200/40 text-2xl md:text-3xl font-black uppercase tracking-[1.5em] lg:tracking-[2em]">NEURAL ROLE ACCESS GATEWAY</p>
          </div>
        </motion.div>

        {/* Enhanced Role Grid - Large Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 lg:gap-24 w-full px-8 lg:px-24">
          <RoleItem
            href="/login?role=admin"
            title="ADMIN"
            subtitle="Central Command & Intelligence"
            icon={ShieldCheck}
            gradient="from-indigo-600 via-indigo-900 to-black"
            delay={0.1}
          />

          <RoleItem
            href="/login?role=faculty"
            title="FACULTY"
            subtitle="Academic Node Oversight"
            icon={Users}
            gradient="from-slate-800 via-slate-900 to-black"
            delay={0.2}
          />

          <RoleItem
            href="/login?role=student"
            title="STUDENT"
            subtitle="Knowledge Engine Base"
            icon={BookOpen}
            gradient="from-blue-700 via-indigo-950 to-black"
            delay={0.3}
          />
        </div>

        {/* Footer Integrity */}
        <div className="mt-24 lg:mt-40 flex flex-col items-center gap-8">
          <div className="h-px w-64 bg-indigo-500/20" />
          <p className="text-sm md:text-lg font-black text-indigo-300/10 uppercase tracking-[2em]">CORE ARCHITECTURE v7.0.0_CINEMATIC</p>
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
        <div className="glass-card relative overflow-hidden group-hover:border-indigo-500/50 transition-all duration-1000 h-full min-h-[600px] lg:min-h-[850px] flex flex-col justify-end p-12 lg:p-20 z-10 border-8 border-white/5">

          {/* Card Visual Background Gradient */}
          <div className={cn("absolute inset-0 bg-gradient-to-br opacity-80 group-hover:opacity-100 transition-opacity duration-700 z-0", gradient)}>
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors duration-700" />
          </div>

          {/* Large Background Icon */}
          <div className="absolute top-20 right-20 z-0 opacity-10 group-hover:opacity-40 group-hover:scale-125 group-hover:rotate-[15deg] transition-all duration-[2000ms] text-white pointer-events-none">
            <Icon size={500} strokeWidth={0.5} />
          </div>

          {/* Card Content */}
          <div className="relative z-10 space-y-8">
            <div className="h-32 w-32 bg-white/10 backdrop-blur-xl rounded-[2rem] flex items-center justify-center border-4 border-white/20 mb-12 group-hover:bg-indigo-600 transition-all duration-1000 shadow-2xl">
              <Icon className="text-white h-16 w-16" strokeWidth={2.5} />
            </div>

            <h2 className="text-6xl lg:text-8xl font-black text-white tracking-tighter uppercase group-hover:text-indigo-200 transition-colors leading-[0.8] group-hover:scale-105 origin-left transition-transform duration-1000">{title}</h2>
            <p className="text-xl lg:text-2xl font-black text-indigo-100/40 uppercase tracking-[0.6em] group-hover:opacity-100 transition-all">{subtitle}</p>

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
