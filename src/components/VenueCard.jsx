import React from 'react';
import { 
  Users, 
  MapPin, 
  CheckCircle2, 
  Wrench, 
  Clock,
  Info,
  Calendar
} from 'lucide-react';

export default function VenueCard({ venue, onBookClick, onViewDetails }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Available':
        return (
          <span className="badge badge-available">
            <span className="pulse-dot bg-emerald-400" /> Available
          </span>
        );
      case 'Occupied':
        return <span className="badge badge-occupied"><Clock className="w-3 h-3" /> Booked</span>;
      case 'Maintenance':
        return <span className="badge badge-maintenance"><Wrench className="w-3 h-3" /> Under Maint</span>;
      default:
        return <span className="badge badge-available">{status}</span>;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Auditorium':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      case 'Activity Division':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'Seminar Hall':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      case 'Computer Lab':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      case 'Classrooms':
        return 'bg-violet-500/20 text-violet-300 border-violet-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-white/10';
    }
  };

  return (
    <div className="glass-panel glass-panel-hover flex flex-col justify-between overflow-hidden group border border-white/10 rounded-2xl bg-slate-950/70 shadow-md">
      <div>
        {/* Cover Image & Header Overlay */}
        <div className="relative h-44 w-full overflow-hidden bg-slate-900">
          <img 
            src={venue.image} 
            alt={venue.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-black/50" />
          
          {/* Top Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <span className={`badge border font-bold text-[11px] backdrop-blur-md ${getTypeColor(venue.type)}`}>
              {venue.type}
            </span>
            {getStatusBadge(venue.status)}
          </div>

          {/* Location Chip over image bottom */}
          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-200 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 font-medium w-full">
              <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="truncate">{venue.location}</span>
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4 space-y-3">
          
          {/* Title */}
          <div>
            <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
              {venue.name}
            </h3>
            {venue.requiresRoomNumber && (
              <p className="text-[11px] text-cyan-300 font-medium mt-0.5">
                • Specify Room Number during booking
              </p>
            )}
          </div>

          {/* Quick Capacity Info */}
          <div className="flex items-center justify-between text-xs bg-slate-900/80 p-2.5 rounded-xl border border-white/5">
            <div className="flex items-center gap-2 text-slate-300">
              <Users className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Capacity: <strong className="text-white">{venue.capacity}</strong>{venue.capacity === 'NA' ? '' : ' Seats'}</span>
            </div>
            <span className="badge-tag bg-slate-800 text-slate-300 text-[10px]">
              {venue.type}
            </span>
          </div>

          {/* Division Badge */}
          <div className="pt-0.5">
            <span className="text-[11px] text-slate-400 font-medium">
              Division: <strong className="text-slate-200">{venue.type}</strong>
            </span>
          </div>

        </div>
      </div>

      {/* Action Footer */}
      <div className="p-3 bg-slate-900/90 border-t border-white/10 flex items-center gap-2">
        <button
          onClick={() => onViewDetails(venue)}
          className="btn-secondary flex-1 justify-center text-xs py-2 bg-slate-800/80 hover:bg-slate-700/80"
        >
          <Info className="w-3.5 h-3.5" /> Details
        </button>
        
        <button
          onClick={() => onBookClick(venue)}
          disabled={venue.status === 'Maintenance'}
          className="btn-primary flex-1 justify-center text-xs py-2"
        >
          <Calendar className="w-3.5 h-3.5" /> Book Slot
        </button>
      </div>
    </div>
  );
}
