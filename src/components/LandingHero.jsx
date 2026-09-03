import React from 'react';
import { 
  Building2, 
  CalendarDays, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Zap, 
  Users, 
  Clock,
  Check
} from 'lucide-react';

export default function LandingHero({ 
  totalVenues, 
  onExploreClick, 
  onScheduleClick, 
  onBookClick 
}) {
  return (
    <div className="space-y-6">
      
      {/* Hero Showcase Container */}
      <div className="glass-panel p-6 sm:p-10 relative bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div className="relative z-10 max-w-4xl space-y-6">
          
          {/* Announcement Tag with Logos */}
          <div className="inline-flex items-center gap-3 bg-slate-50 border border-slate-200 p-1.5 pr-4 rounded-full text-xs shadow-xs">
            <div className="flex items-center gap-1.5 bg-white px-2 py-0.5 rounded-full border border-slate-200">
              <img src="/mec_college_logo.png" alt="MEC" className="w-4 h-4 object-contain rounded" />
              <img src="/union_mec_logo.png" alt="Union MEC" className="w-4 h-4 object-contain rounded" />
            </div>
            <span className="font-semibold text-slate-700">Govt. Model Engineering College</span>
            <span className="text-slate-300">•</span>
            <span className="text-red-700 font-bold">Union MEC Organizing Chart</span>
          </div>

          {/* Main Hero Headline */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Govt. Model Engineering College <br className="hidden sm:block" />
              <span className="text-slate-900">
                Campus Venue Operations & Scheduling
              </span>
            </h1>
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
              Official venue booking portal managed by <strong className="text-slate-900">College Student Union (Union MEC)</strong>. Reserve Auditoriums, Activity spaces (Casa, Elga, Ground, Amphitheatre), Computing Labs (CL1, CL2, CCF, CCC), and Classrooms with instant confirmation and zero clashes.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onBookClick}
              className="btn-primary text-sm py-2.5 px-5 shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>Book Venue Slot</span>
            </button>

            <button
              onClick={onScheduleClick}
              className="btn-secondary text-sm py-2.5 px-5 bg-white border-slate-300 hover:bg-slate-50"
            >
              <CalendarDays className="w-4 h-4 text-slate-600" />
              <span>Live Schedule Matrix</span>
            </button>

            <button
              onClick={onExploreClick}
              className="btn-secondary text-sm py-2.5 px-4 bg-transparent border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              <span>Explore Facilities</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </button>
          </div>

          {/* Stats Bar */}
          <div className="pt-6 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-lg sm:text-xl font-extrabold text-slate-900">{totalVenues || 14}</div>
                <div className="text-[11px] text-slate-500 font-medium">MEC Facilities</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <div className="text-lg sm:text-xl font-extrabold text-emerald-700">0 Clashes</div>
                <div className="text-[11px] text-slate-500 font-medium">Conflict Engine</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
                <Check className="w-5 h-5" />
              </div>
              <div>
                <div className="text-lg sm:text-xl font-extrabold text-slate-900">Instant</div>
                <div className="text-[11px] text-slate-500 font-medium">Direct Confirmation</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-700 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-lg sm:text-xl font-extrabold text-red-700">Union MEC</div>
                <div className="text-[11px] text-slate-500 font-medium">Executive Control</div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 3 Core Value Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="glass-panel p-4 rounded-xl border border-slate-200 bg-white flex items-start gap-3.5 hover:border-slate-300 transition-all shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900">Live Slot Validation</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Real-time conflict detection prevents double booking across hours and classrooms.
            </p>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-200 bg-white flex items-start gap-3.5 hover:border-slate-300 transition-all shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
            <Check className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900">Instant Confirmation</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Societies reserve slots directly with zero approval delay or administrative bottlenecks.
            </p>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-200 bg-white flex items-start gap-3.5 hover:border-slate-300 transition-all shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-red-50 text-red-700 border border-red-200 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900">Union MEC Oversight</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Union admin maintains institutional oversight and can cancel bookings with a reason note.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
