import React from 'react';
import { 
  X, 
  MapPin, 
  Users, 
  CheckCircle, 
  Phone, 
  User, 
  Sparkles, 
  Calendar, 
  ShieldCheck, 
  Info 
} from 'lucide-react';
import { formatDateFriendly, formatTime12H } from '../utils/availabilityUtils';

export default function VenueDetailsModal({ venue, onClose, onBookClick, bookings = [] }) {
  if (!venue) return null;

  // Upcoming bookings for this venue
  const venueBookings = bookings.filter(b => b.venueId === venue.id && (b.status === 'confirmed' || b.status === 'approved'));

  return (
    <div className="modal-overlay animate-fade-in" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="glass-panel w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/20 p-6 md:p-8 relative bg-slate-950 shadow-2xl space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-900/90 text-slate-400 hover:text-white flex items-center justify-center transition-colors border border-white/10 z-20 shadow-md"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Banner with Image */}
        <div className="relative h-56 sm:h-64 w-full rounded-2xl overflow-hidden bg-slate-900 border border-white/10 shadow-lg">
          <img
            src={venue.image}
            alt={venue.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          
          {/* Top Pill Badge */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="badge bg-indigo-600/90 text-white font-bold border border-indigo-400/50 shadow-md text-xs backdrop-blur-md">
              {venue.type}
            </span>
          </div>

          {/* Bottom Title & Location */}
          <div className="absolute bottom-4 left-4 right-4">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              {venue.name}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-300 mt-1">
              <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>{venue.location}</span>
            </div>
          </div>
        </div>

        {/* Details Content */}
        <div className="space-y-5">
          
          {/* Quick Specs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <Users className="w-4 h-4 text-indigo-400" /> Seating Capacity
              </span>
              <span className="font-bold text-white font-mono">{venue.capacity} Persons</span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Division / Wing
              </span>
              <span className="font-bold text-emerald-400">{venue.type}</span>
            </div>
          </div>

          {/* Faculty In-Charge (Only if provided) */}
          {venue.contactPerson && (
            <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Staff Coordinator in Charge:</span>
                <div className="text-white font-bold flex items-center gap-1.5 mt-0.5">
                  <User className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{venue.contactPerson}</span>
                </div>
              </div>
              {venue.contactPhone && (
                <div className="text-slate-300 font-mono flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>{venue.contactPhone}</span>
                </div>
              )}
            </div>
          )}

          {/* Equipment & Amenities (Only if provided) */}
          {venue.amenities && venue.amenities.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                Equipment & Amenities
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {venue.amenities.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-200 bg-slate-900/70 p-2.5 rounded-xl border border-white/5">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Schedule */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              Upcoming Reserved Events ({venueBookings.length})
            </h4>
            {venueBookings.length > 0 ? (
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {venueBookings.map((b) => (
                  <div key={b.id} className="bg-slate-900/90 p-3 rounded-xl border border-white/5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-white">
                        {b.eventTitle} {b.roomNumber && <span className="text-cyan-300 font-mono text-[11px]">({b.roomNumber})</span>}
                      </div>
                      <div className="text-slate-400 text-[11px]">{b.organizer}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-indigo-300 font-semibold">{formatDateFriendly(b.date)}</div>
                      <div className="text-slate-400 text-[11px] font-mono">{formatTime12H(b.startTime)} - {formatTime12H(b.endTime)}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic bg-slate-900/40 p-3.5 rounded-xl border border-white/5 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>No upcoming bookings reserved yet. This venue is fully available!</span>
              </div>
            )}
          </div>

          {/* Action CTA */}
          <div className="pt-2">
            <button
              onClick={() => {
                onClose();
                onBookClick(venue);
              }}
              disabled={venue.status === 'Maintenance'}
              className="btn-primary w-full justify-center py-3 text-sm shadow-lg shadow-indigo-500/30"
            >
              <Sparkles className="w-4 h-4 text-cyan-300" /> Book This Venue Slot
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
