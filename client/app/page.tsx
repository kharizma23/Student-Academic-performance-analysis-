"use client"

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ShieldCheck, Users, BookOpen, ChevronRight } from "lucide-react";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-[#030712] overflow-hidden flex flex-col items-center justify-center p-4 md:p-8 selection:bg-indigo-500/30">
      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-900/20 rounded-full blur-[160px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 w-full max-w-[1600px] mx-auto flex flex-col items-center gap-10 md:gap-16 py-8 md:py-16">
        {/* Institutional Branding */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center text-center space-y-6"
        >
          <div className="space-y-4">
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black text-white tracking-tighter uppercase leading-[0.85] drop-shadow-2xl">
              INSTITUTIONAL <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-blue-500 to-indigo-600">INTELLIGENCE</span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl font-black text-indigo-200/40 uppercase tracking-[0.5em] md:tracking-[1em] lg:tracking-[1.5em]">NEURAL ROLE ACCESS GATEWAY</p>
          </div>
        </motion.div>

        {/* Enhanced Role Grid - Large Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 lg:gap-12 w-full px-4 md:px-8 lg:px-16">
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
        <div className="mt-12 md:mt-20 flex flex-col items-center gap-6">
          <div className="h-px w-48 bg-indigo-500/20" />
          <p className="text-xs md:text-sm font-black text-indigo-300/10 uppercase tracking-[1em] md:tracking-[1.5em]">CORE ARCHITECTURE v7.0.0_CINEMATIC</p>
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
        <div className="glass-card relative overflow-hidden group-hover:border-indigo-500/50 transition-all duration-1000 h-full min-h-[380px] md:min-h-[420px] lg:min-h-[520px] xl:min-h-[600px] flex flex-col justify-end p-8 md:p-10 lg:p-14 z-10 border-4 md:border-6 border-white/5 rounded-2xl">

          {/* Card Visual Background Gradient */}
          <div className={cn("absolute inset-0 bg-gradient-to-br opacity-80 group-hover:opacity-100 transition-opacity duration-700 z-0 rounded-2xl", gradient)}>
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors duration-700" />
          </div>

          {/* Large Background Icon */}
          <div className="absolute top-10 md:top-14 right-6 md:right-10 z-0 opacity-10 group-hover:opacity-30 group-hover:scale-110 group-hover:rotate-[12deg] transition-all duration-[2000ms] text-white pointer-events-none">
            <Icon className="w-40 h-40 md:w-52 md:h-52 lg:w-64 lg:h-64" strokeWidth={0.5} />
          </div>

          {/* Card Content */}
          <div className="relative z-10 space-y-5">
            <div className="h-16 w-16 md:h-20 md:w-20 lg:h-24 lg:w-24 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border-2 md:border-3 border-white/20 mb-6 md:mb-8 group-hover:bg-indigo-600 transition-all duration-1000 shadow-2xl">
              <Icon className="text-white h-8 w-8 md:h-10 md:w-10 lg:h-12 lg:w-12" strokeWidth={2.5} />
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-white tracking-tighter uppercase group-hover:text-indigo-200 transition-colors leading-[0.85] group-hover:scale-105 origin-left duration-1000">{title}</h2>
            <p className="text-sm md:text-base lg:text-lg font-bold text-indigo-100/40 uppercase tracking-[0.3em] md:tracking-[0.4em] group-hover:opacity-100 transition-all">{subtitle}</p>

            <div className="pt-4 flex items-center justify-between">
              <div className="h-1 w-10 bg-indigo-500 group-hover:w-24 transition-all duration-700" />
              <ChevronRight className="text-white opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-500 h-6 w-6" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
