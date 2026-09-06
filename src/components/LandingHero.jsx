import React from 'react';
import { 
  CalendarDays, 
  Sparkles, 
  ArrowRight,
  MapPin,
  Clock,
  CheckCircle2
} from 'lucide-react';

export default function LandingHero({ 
  onExploreClick, 
  onScheduleClick, 
  onBookClick 
}) {
  return (
    <div className="space-y-6">
      
      {/* Hero Showcase Container */}
      <div className="hero-gradient-border p-6 sm:p-10 relative overflow-hidden">
        
        {/* Subtle red ambient blobs */}
        <div 
          className="hero-glow-blob"
          style={{
            background: 'rgba(239,68,68,0.08)',
            top: '-80px',
            right: '-80px'
          }}
        />
        <div 
          className="hero-glow-blob"
          style={{
            background: 'rgba(220,38,38,0.05)',
            bottom: '-80px',
            left: '-80px'
          }}
        />

        <div className="relative z-10 max-w-4xl space-y-6">
          
          {/* Announcement Tag */}
          <div className="inline-flex items-center gap-3 bg-white border border-gray-200 p-1.5 pr-4 rounded-full text-xs shadow-xs"
            style={{boxShadow: '0 1px 6px rgba(0,0,0,0.07)'}}
          >
            <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
              <img src="/mec_college_logo.png" alt="MEC" className="w-5 h-5 object-contain rounded bg-white p-0.5" />
              <img src="/union_mec_logo.png" alt="Union MEC" className="w-5 h-5 object-contain rounded bg-white p-0.5" />
            </div>
            <span className="font-semibold" style={{color:'#000000'}}>Govt. Model Engineering College</span>
            <span style={{color:'#D1D5DB'}}>•</span>
            <span className="font-bold" style={{color:'#B91C1C'}}>Union MEC Organizing Chart</span>
          </div>

          {/* Main Hero Headline */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight" style={{color:'#000000'}}>
              Govt. Model Engineering College <br className="hidden sm:block" />
              <span style={{color:'#B91C1C'}}>
                Campus Venue Operations &amp; Scheduling
              </span>
            </h1>
            <p className="text-sm sm:text-base max-w-2xl leading-relaxed" style={{color:'#333333'}}>
              Official venue booking portal managed by <strong style={{color:'#000000'}}>College Student Union (Union MEC)</strong>.
            </p>
          </div>

          {/* Stats Row */}
          <div className="flex flex-wrap items-center gap-4">
            {[
              { icon: MapPin,       label: 'Campus Venues',    color: '#DC2626' },
              { icon: CheckCircle2, label: 'Instant Booking',  color: '#059669' },
              { icon: Clock,        label: 'Live Availability', color: '#B45309' },
            ].map(({ icon: Icon, label, color }) => (
              <div key={label} className="flex items-center gap-1.5 text-xs font-medium" style={{color:'#6B7280'}}>
                <Icon className="w-4 h-4" style={{color}} />
                <span>{label}</span>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={onBookClick}
              className="btn-primary text-sm py-2.5 px-6"
            >
              <Sparkles className="w-4 h-4" style={{color:'#FCA5A5'}} />
              <span>Book Venue Slot</span>
            </button>

            <button
              onClick={onScheduleClick}
              className="btn-secondary text-sm py-2.5 px-5"
            >
              <CalendarDays className="w-4 h-4" style={{color:'#DC2626'}} />
              <span>Live Schedule Matrix</span>
            </button>

            <button
              onClick={onExploreClick}
              className="btn-secondary text-sm py-2.5 px-4 border-transparent bg-transparent"
              style={{color:'#6B7280'}}
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
