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
            <span className="pulse-dot" style={{backgroundColor:'#10B981'}} /> Available
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

  const getTypeStyle = (type) => {
    switch (type) {
      case 'Auditorium':
        return { bg: '#FEE2E2', color: '#B91C1C', border: '#FCA5A5' };
      case 'Activity Division':
        return { bg: '#D1FAE5', color: '#065F46', border: '#6EE7B7' };
      case 'Seminar Hall':
        return { bg: '#DBEAFE', color: '#1E40AF', border: '#93C5FD' };
      case 'Computer Lab':
        return { bg: '#EDE9FE', color: '#5B21B6', border: '#C4B5FD' };
      case 'Classrooms':
        return { bg: '#FEF3C7', color: '#92400E', border: '#FCD34D' };
      default:
        return { bg: '#F3F4F6', color: '#374151', border: '#D1D5DB' };
    }
  };

  const typeStyle = getTypeStyle(venue.type);

  return (
    <div 
      className="glass-panel glass-panel-hover flex flex-col justify-between overflow-hidden group rounded-2xl"
      style={{boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}
    >
      <div>
        {/* Cover Image */}
        <div className="relative h-44 w-full overflow-hidden" style={{background:'#F3F4F6'}}>
          <img 
            src={venue.image} 
            alt={venue.name}
            className="w-full h-full object-cover"
            style={{opacity: 0.92}}
          />
          {/* Subtle gradient overlay for text readability */}
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.1) 40%, transparent 100%)'
          }} />
          
          {/* Top Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <span className="badge border font-bold text-[11px]"
              style={{
                background: typeStyle.bg,
                color: typeStyle.color,
                borderColor: typeStyle.border,
                backdropFilter: 'blur(8px)'
              }}
            >
              {venue.type}
            </span>
            {getStatusBadge(venue.status)}
          </div>

          {/* Location chip */}
          <div className="absolute bottom-2.5 left-3 right-3">
            <div className="flex items-center gap-1.5 text-xs text-white px-2.5 py-1 rounded-lg font-medium w-full"
              style={{background:'rgba(0,0,0,0.55)', backdropFilter:'blur(8px)'}}
            >
              <MapPin className="w-3.5 h-3.5 shrink-0" style={{color:'#FCA5A5'}} />
              <span className="truncate">{venue.location}</span>
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4 space-y-3">
          
          {/* Title */}
          <div>
            <h3 className="text-base font-bold line-clamp-1" style={{color:'#000000'}}>
              {venue.name}
            </h3>
            {venue.requiresRoomNumber && (
              <p className="text-[11px] font-medium mt-0.5" style={{color:'#DC2626'}}>
                • Specify Room Number during booking
              </p>
            )}
          </div>

          {/* Capacity Info */}
          <div className="flex items-center justify-between text-xs p-2.5 rounded-xl border"
            style={{background:'#F9FAFB', borderColor:'#E5E7EB'}}
          >
            <div className="flex items-center gap-2" style={{color:'#000000'}}>
              <Users className="w-4 h-4 shrink-0" style={{color:'#B91C1C'}} />
              <span>Capacity: <strong style={{color:'#000000'}}>{venue.capacity}</strong>{String(venue.capacity || '').toUpperCase() === 'NA' ? '' : ' Seats'}</span>
            </div>
            <span className="badge-tag" style={{background:'#F3F4F6', color:'#555555', borderColor:'#E5E7EB'}}>
              {venue.type}
            </span>
          </div>

          {/* Division label */}
          <div className="pt-0.5">
            <span className="text-[11px] font-medium" style={{color:'#777777'}}>
              Division: <strong style={{color:'#000000'}}>{venue.type}</strong>
            </span>
          </div>

        </div>
      </div>

      {/* Action Footer */}
      <div className="p-3 border-t flex items-center gap-2" style={{background:'#FAFAFA', borderColor:'#F3F4F6'}}>
        <button
          onClick={() => onViewDetails(venue)}
          className="btn-secondary flex-1 justify-center text-xs py-2"
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
