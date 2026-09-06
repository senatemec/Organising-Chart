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
      <div className="glass-panel p-6 rounded-3xl border border-gray-200 bg-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center shadow-sm shrink-0">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Campus Facility Utilization & Analytics</h2>
            <p className="text-xs text-gray-600">
              Real-time analytics across all campus venues, auditoriums, classrooms, and grounds
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-gray-50 px-3.5 py-2 rounded-xl border border-gray-200 text-xs">
          <Sparkles className="w-4 h-4 text-red-600" />
          <span className="text-gray-800 font-bold">Live Campus Telemetry</span>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-panel p-5 rounded-2xl border border-gray-200 bg-white space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs text-gray-500 font-bold">
            <span>TOTAL VENUES</span>
            <Building2 className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-3xl font-extrabold text-gray-900">{stats.totalVenues}</div>
          <div className="text-[11px] text-gray-500 font-medium">Registered Campus Facilities</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-gray-200 bg-white space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs text-gray-500 font-bold">
            <span>ACTIVE PASSES</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-700">{stats.activeBookings}</div>
          <div className="text-[11px] text-gray-500 font-medium">Confirmed Society Events</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-gray-200 bg-white space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs text-gray-500 font-bold">
            <span>UTILIZATION RATE</span>
            <PieChart className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-3xl font-extrabold text-red-700">{stats.utilizationRate}%</div>
          <div className="text-[11px] text-gray-500 font-medium">Peak Hours Occupancy</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-gray-200 bg-white space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs text-gray-500 font-bold">
            <span>MOST POPULAR VENUE</span>
            <Award className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-base font-bold text-gray-900 truncate">{stats.topVenueName}</div>
          <div className="text-[11px] text-gray-500 font-medium">Highest Demand Location</div>
        </div>

      </div>

      {/* Visual Charts & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Venue Demand Bar Breakdown */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-gray-200 bg-white space-y-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900">Venue Booking Demand Distribution</h3>
              <p className="text-xs text-gray-500">Active confirmed passes across campus venues</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-red-600" />
                <span className="text-gray-700 font-bold text-[11px]">Active</span>
              </div>
            </div>
          </div>

          <div className="space-y-3.5">
            {venueUsage.slice(0, 8).map((v, idx) => (
              <div key={idx} className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900 truncate max-w-[280px]">{v.name}</span>
                  <span className="font-mono text-red-700 font-bold text-[11px]">
                    {v.activeCount} active passes
                  </span>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden flex border border-gray-200">
                  <div 
                    className="bg-gradient-to-r from-red-600 to-rose-500 h-full transition-all rounded-full" 
                    style={{ width: `${Math.min((v.activeCount / 3) * 100, 100)}%` }} 
                    title={`${v.activeCount} Active Passes`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Share */}
        <div className="glass-panel p-6 rounded-2xl border border-gray-200 bg-white space-y-5 shadow-sm">
          <div>
            <h3 className="text-base font-bold text-gray-900">Event Categories Share</h3>
            <p className="text-xs text-gray-500">Distribution by campus activity type</p>
          </div>

          <div className="space-y-3">
            {Object.entries(categoryCounts).map(([cat, count], idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs">
                <span className="text-gray-800 font-bold">{cat}</span>
                <span className="font-bold text-red-900 bg-red-50 px-2.5 py-1 rounded-lg border border-red-200 font-mono">
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
