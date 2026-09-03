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
      <div className="glass-panel w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 p-6 md:p-8 relative bg-white shadow-2xl space-y-6 text-slate-900">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors border border-slate-200 z-20 shadow-xs"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Banner with Image */}
        <div className="relative h-56 sm:h-64 w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-xs">
          <img
            src={venue.image}
            alt={venue.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
          
          {/* Top Pill Badge */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="badge bg-slate-900 text-white font-bold border border-slate-700 shadow-xs text-xs">
              {venue.type}
            </span>
          </div>

          {/* Bottom Title & Location */}
          <div className="absolute bottom-4 left-4 right-4">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              {venue.name}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-200 mt-1">
              <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
              <span>{venue.location}</span>
            </div>
          </div>
        </div>

        {/* Details Content */}
        <div className="space-y-5">
          
          {/* Quick Specs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <span className="text-slate-600 flex items-center gap-1.5 font-medium">
                <Users className="w-4 h-4 text-blue-600" /> Seating Capacity
              </span>
              <span className="font-bold text-slate-900 font-mono">{venue.capacity} Persons</span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <span className="text-slate-600 flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Division / Wing
              </span>
              <span className="font-bold text-slate-900">{venue.type}</span>
            </div>
          </div>

          {/* Faculty In-Charge (Only if provided) */}
          {venue.contactPerson && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
              <div>
                <span className="text-[11px] text-slate-500 block font-medium">Staff Coordinator in Charge:</span>
                <div className="text-slate-900 font-bold flex items-center gap-1.5 mt-0.5">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  <span>{venue.contactPerson}</span>
                </div>
              </div>
              {venue.contactPhone && (
                <div className="text-slate-600 font-mono flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{venue.contactPhone}</span>
                </div>
              )}
            </div>
          )}

          {/* Equipment & Amenities (Only if provided) */}
          {venue.amenities && venue.amenities.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2.5">
                Equipment & Amenities
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {venue.amenities.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Schedule */}
          <div>
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2.5 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              Upcoming Reserved Events ({venueBookings.length})
            </h4>
            {venueBookings.length > 0 ? (
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {venueBookings.map((b) => (
                  <div key={b.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900">
                        {b.eventTitle} {b.roomNumber && <span className="text-blue-700 font-mono text-[11px]">({b.roomNumber})</span>}
                      </div>
                      <div className="text-slate-500 text-[11px]">{b.organizer}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-blue-700 font-semibold">{formatDateFriendly(b.date)}</div>
                      <div className="text-slate-500 text-[11px] font-mono">{formatTime12H(b.startTime)} - {formatTime12H(b.endTime)}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-500 italic bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
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
              className="btn-primary w-full justify-center py-3 text-sm shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-blue-400" /> Book This Venue Slot
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
