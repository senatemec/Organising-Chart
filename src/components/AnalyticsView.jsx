import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Building2, 
  Users, 
  Clock, 
  PieChart, 
  Award,
  Sparkles,
  CheckCircle2,
  Calendar,
  XCircle
} from 'lucide-react';
import { calculateVenueStats } from '../utils/availabilityUtils';

export default function AnalyticsView({ venues, bookings }) {
  const stats = calculateVenueStats(venues, bookings);

  // Calculate booking counts per venue
  const venueUsage = venues.map((v) => {
    const activeCount = bookings.filter(b => b.venueId === v.id && (b.status === 'confirmed' || b.status === 'approved')).length;
    const cancelledCount = bookings.filter(b => b.venueId === v.id && b.status === 'cancelled').length;
    return {
      name: v.name,
      type: v.type,
      capacity: v.capacity,
      activeCount,
      cancelledCount,
      totalCount: activeCount + cancelledCount
    };
  });

  // Calculate event category counts
  const categoryCounts = {};
  bookings.forEach((b) => {
    if (b.status !== 'cancelled') {
      categoryCounts[b.category] = (categoryCounts[b.category] || 0) + 1;
    }
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-cyan-500/20 bg-gradient-to-r from-slate-900 via-cyan-950/20 to-slate-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">Campus Facility Utilization & Analytics</h2>
            <p className="text-xs text-slate-300">
              Real-time analytics across all 14 campus venues, auditoriums, classrooms, and grounds
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-900/90 px-3.5 py-2 rounded-xl border border-white/10 text-xs">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-200 font-semibold">Semester 2026 Live Telemetry</span>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-panel p-5 rounded-2xl border border-white/10 bg-slate-950/80 space-y-2 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>TOTAL VENUES</span>
            <Building2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{stats.totalVenues}</div>
          <div className="text-[11px] text-slate-400">Registered Campus Facilities</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 bg-slate-950/80 space-y-2 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>ACTIVE PASSES</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400">{stats.activeBookings}</div>
          <div className="text-[11px] text-slate-400">Confirmed Society Events</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 bg-slate-950/80 space-y-2 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>UTILIZATION RATE</span>
            <PieChart className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-cyan-400">{stats.utilizationRate}%</div>
          <div className="text-[11px] text-slate-400">Peak Hours Occupancy</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 bg-slate-950/80 space-y-2 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>MOST POPULAR VENUE</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-base font-bold text-amber-300 truncate">{stats.topVenueName}</div>
          <div className="text-[11px] text-slate-400">Highest Demand Location</div>
        </div>

      </div>

      {/* Visual Charts & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Venue Demand Bar Breakdown */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/10 bg-slate-950/80 space-y-5 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Venue Booking Demand Distribution</h3>
              <p className="text-xs text-slate-400">Active confirmed passes across campus venues</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-indigo-500" />
                <span className="text-slate-300 text-[11px]">Active</span>
              </div>
            </div>
          </div>

          <div className="space-y-3.5">
            {venueUsage.slice(0, 8).map((v, idx) => (
              <div key={idx} className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white truncate max-w-[280px]">{v.name}</span>
                  <span className="font-mono text-indigo-300 font-bold text-[11px]">
                    {v.activeCount} active passes
                  </span>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden flex border border-white/5">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full transition-all" 
                    style={{ width: `${Math.min((v.activeCount / 3) * 100, 100)}%` }} 
                    title={`${v.activeCount} Active Passes`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Share */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-slate-950/80 space-y-5 shadow-lg">
          <div>
            <h3 className="text-base font-bold text-white">Event Categories Share</h3>
            <p className="text-xs text-slate-400">Distribution by campus activity type</p>
          </div>

          <div className="space-y-3">
            {Object.entries(categoryCounts).map(([cat, count], idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/5 text-xs">
                <span className="text-slate-200 font-semibold">{cat}</span>
                <span className="font-bold text-cyan-300 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20 font-mono">
                  {count} {count === 1 ? 'Event' : 'Events'}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
