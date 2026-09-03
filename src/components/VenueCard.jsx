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
            <span className="pulse-dot bg-emerald-500" /> Available
          </span>
        );
      case 'Occupied':
        return <span className="badge badge-occupied"><Clock className="w-3 h-3" /> Booked</span>;
      case 'Maintenance':
        return <span className="badge badge-maintenance"><Wrench className="w-3 h-3" /> Maintenance</span>;
      default:
        return <span className="badge badge-available">{status}</span>;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Auditorium':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Activity Division':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Seminar Hall':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'Computer Lab':
        return 'bg-cyan-50 text-cyan-800 border-cyan-200';
      case 'Classrooms':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="glass-panel glass-panel-hover flex flex-col justify-between overflow-hidden group border border-slate-200 rounded-2xl bg-white shadow-sm hover:shadow-md transition-all">
      <div>
        {/* Cover Image & Header Overlay */}
        <div className="relative h-44 w-full overflow-hidden bg-slate-100">
          <img 
            src={venue.image} 
            alt={venue.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
          
          {/* Top Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <span className={`badge border font-bold text-[11px] shadow-xs ${getTypeColor(venue.type)}`}>
              {venue.type}
            </span>
            {getStatusBadge(venue.status)}
          </div>

          {/* Location Chip over image bottom */}
          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-white bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20 font-medium w-full shadow-xs">
              <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="truncate">{venue.location}</span>
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4 space-y-3">
          
          {/* Title */}
          <div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
              {venue.name}
            </h3>
            {venue.requiresRoomNumber && (
              <p className="text-[11px] text-blue-600 font-medium mt-0.5">
                • Specify Room Number during booking
              </p>
            )}
          </div>

          {/* Quick Capacity Info */}
          <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 text-slate-700">
              <Users className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Capacity: <strong className="text-slate-900">{venue.capacity}</strong> Seats</span>
            </div>
            <span className="badge-tag bg-white text-slate-700 border-slate-200 text-[10px]">
              {venue.type}
            </span>
          </div>

          {/* Division Badge */}
          <div className="pt-0.5">
            <span className="text-[11px] text-slate-500 font-medium">
              Division: <strong className="text-slate-700">{venue.type}</strong>
            </span>
          </div>

        </div>
      </div>

      {/* Action Footer */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center gap-2">
        <button
          onClick={() => onViewDetails(venue)}
          className="btn-secondary flex-1 justify-center text-xs py-2 bg-white hover:bg-slate-100 border-slate-300"
        >
          <Info className="w-3.5 h-3.5 text-slate-600" /> Details
        </button>
        
        <button
          onClick={() => onBookClick(venue)}
          disabled={venue.status === 'Maintenance'}
          className="btn-primary flex-1 justify-center text-xs py-2 shadow-xs"
        >
          <Calendar className="w-3.5 h-3.5" /> Book Slot
        </button>
      </div>
    </div>
  );
}
