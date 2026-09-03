import React from 'react';
import { 
  CalendarDays, 
  Sparkles, 
  ArrowRight
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

    </div>
  );
}
