import React from 'react';
import { 
  CalendarDays, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  Clock,
  Check
} from 'lucide-react';

export default function LandingHero({ 
  onExploreClick, 
  onScheduleClick, 
  onBookClick 
}) {
  return (
    <div className="space-y-6">
      
      {/* Hero Showcase Container */}
      <div className="hero-gradient-border p-6 sm:p-10 relative">
        {/* Ambient Glows */}
        <div 
          className="hero-glow-blob bg-indigo-500/20 top-0 right-10" 
          style={{ transform: 'translate(20%, -20%)' }}
        />
        <div 
          className="hero-glow-blob bg-cyan-500/15 bottom-0 left-10"
          style={{ transform: 'translate(-20%, 20%)' }}
        />

        <div className="relative z-10 max-w-4xl space-y-6">
          
          {/* Announcement Tag with Logos */}
          <div className="inline-flex items-center gap-3 bg-slate-900/90 border border-white/10 p-1.5 pr-4 rounded-full text-xs shadow-sm">
            <div className="flex items-center gap-1.5 bg-white/10 px-2 py-0.5 rounded-full">
              <img src="/mec_college_logo.png" alt="MEC" className="w-5 h-5 object-contain rounded bg-white p-0.5" />
              <img src="/union_mec_logo.png" alt="Union MEC" className="w-5 h-5 object-contain rounded bg-white p-0.5" />
            </div>
            <span className="font-semibold text-slate-200">Govt. Model Engineering College</span>
            <span className="text-slate-500">•</span>
            <span className="text-red-400 font-bold">Union MEC Organizing Chart</span>
          </div>

          {/* Main Hero Headline */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Govt. Model Engineering College <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-red-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">
                Campus Venue Operations & Scheduling
              </span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              Official venue booking portal managed by <strong>College Student Union (Union MEC)</strong>.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onBookClick}
              className="btn-primary text-sm py-2.5 px-5 shadow-lg shadow-indigo-500/30"
            >
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>Book Venue Slot</span>
            </button>

            <button
              onClick={onScheduleClick}
              className="btn-secondary text-sm py-2.5 px-5 bg-slate-900/80 border-white/15"
            >
              <CalendarDays className="w-4 h-4 text-indigo-400" />
              <span>Live Schedule Matrix</span>
            </button>

            <button
              onClick={onExploreClick}
              className="btn-secondary text-sm py-2.5 px-4 bg-transparent border-transparent text-slate-300 hover:text-white"
            >
              <span>Explore Facilities</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </button>
          </div>

        </div>
      </div>

      {/* 3 Core Value Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="glass-panel p-4 rounded-xl border border-white/10 flex items-start gap-3.5 hover:border-indigo-500/30 transition-all">
          <div className="w-9 h-9 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white">Live Slot Validation</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time conflict detection prevents double booking across hours and classrooms.
            </p>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-white/10 flex items-start gap-3.5 hover:border-cyan-500/30 transition-all">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0">
            <Check className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white">Instant Confirmation</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Societies reserve slots directly with zero approval delay or administrative bottlenecks.
            </p>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-white/10 flex items-start gap-3.5 hover:border-red-500/30 transition-all">
          <div className="w-9 h-9 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white">Union MEC Oversight</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Union admin maintains institutional oversight and can cancel bookings with a reason note.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
