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

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center shrink-0">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Campus Facility Utilization & Analytics</h2>
            <p className="text-xs text-slate-500">
              Real-time analytics across all 14 campus venues, auditoriums, classrooms, and grounds
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 text-xs">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span className="text-slate-700 font-semibold">Semester 2026 Live Telemetry</span>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-panel p-5 rounded-2xl border border-slate-200 bg-white space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>TOTAL VENUES</span>
            <Building2 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{stats.totalVenues}</div>
          <div className="text-[11px] text-slate-500">Registered Campus Facilities</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-200 bg-white space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>ACTIVE PASSES</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-700">{stats.activeBookings}</div>
          <div className="text-[11px] text-slate-500">Confirmed Society Events</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-200 bg-white space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>UTILIZATION RATE</span>
            <PieChart className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-extrabold text-blue-700">{stats.utilizationRate}%</div>
          <div className="text-[11px] text-slate-500">Peak Hours Occupancy</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-200 bg-white space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>MOST POPULAR VENUE</span>
            <Award className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-base font-bold text-slate-900 truncate">{stats.topVenueName}</div>
          <div className="text-[11px] text-slate-500">Highest Demand Location</div>
        </div>

      </div>

      {/* Visual Charts & Breakdown */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white space-y-5 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Venue Booking Demand Distribution</h3>
            <p className="text-xs text-slate-500">Active confirmed passes across campus venues</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-blue-600" />
              <span className="text-slate-600 text-[11px] font-medium">Active Passes</span>
            </div>
          </div>
        </div>

        <div className="space-y-3.5">
          {venueUsage.map((v, idx) => (
            <div key={idx} className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900 truncate max-w-[280px]">{v.name}</span>
                <span className="font-mono text-blue-700 font-bold text-[11px]">
                  {v.activeCount} active passes
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex border border-slate-200">
                <div 
                  className="bg-blue-600 h-full transition-all" 
                  style={{ width: `${Math.min((v.activeCount / Math.max(1, stats.activeBookings || 1)) * 100, 100)}%` }} 
                  title={`${v.activeCount} Active Passes`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
