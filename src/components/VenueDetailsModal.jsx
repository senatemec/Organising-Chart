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
      <div className="glass-panel w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-gray-200 p-6 md:p-8 relative bg-white shadow-2xl space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-gray-100 text-gray-500 hover:text-gray-900 hover:bg-gray-200 flex items-center justify-center transition-colors border border-gray-200 z-20 shadow-xs"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Banner with Image */}
        <div className="relative h-56 sm:h-64 w-full rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shadow-md">
          <img
            src={venue.image}
            alt={venue.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          
          {/* Top Pill Badge */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="badge font-bold border text-xs backdrop-blur-md"
              style={{background:'#FEE2E2', color:'#B91C1C', borderColor:'#FCA5A5'}}>
              {venue.type}
            </span>
          </div>

          {/* Bottom Title & Location */}
          <div className="absolute bottom-4 left-4 right-4">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              {venue.name}
            </h2>
            <div className="flex items-center gap-2 text-xs text-red-100 mt-1">
              <MapPin className="w-4 h-4 text-red-300 shrink-0" />
              <span>{venue.location}</span>
            </div>
          </div>
        </div>

        {/* Details Content */}
        <div className="space-y-5">
          
          {/* Quick Specs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center justify-between p-3.5 rounded-xl border text-xs"
              style={{background:'#F9FAFB', borderColor:'#E5E7EB'}}>
              <span className="flex items-center gap-1.5 font-medium" style={{color:'#6B7280'}}>
                <Users className="w-4 h-4" style={{color:'#DC2626'}} /> Seating Capacity
              </span>
              <span className="font-bold font-mono" style={{color:'#111827'}}>{venue.capacity === 'NA' ? 'NA' : `${venue.capacity} Persons`}</span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl border text-xs"
              style={{background:'#F9FAFB', borderColor:'#E5E7EB'}}>
              <span className="flex items-center gap-1.5 font-medium" style={{color:'#6B7280'}}>
                <ShieldCheck className="w-4 h-4" style={{color:'#059669'}} /> Division / Wing
              </span>
              <span className="font-bold" style={{color:'#059669'}}>{venue.type}</span>
            </div>
          </div>

          {/* Faculty In-Charge (Only if provided) */}
          {venue.contactPerson && (
            <div className="p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs"
              style={{background:'#F9FAFB', borderColor:'#E5E7EB'}}>
              <div>
                <span className="text-[11px] block font-medium" style={{color:'#6B7280'}}>Staff Coordinator in Charge:</span>
                <div className="font-bold flex items-center gap-1.5 mt-0.5" style={{color:'#111827'}}>
                  <User className="w-3.5 h-3.5" style={{color:'#DC2626'}} />
                  <span>{venue.contactPerson}</span>
                </div>
              </div>
              {venue.contactPhone && (
                <div className="font-mono flex items-center gap-1.5" style={{color:'#4B5563'}}>
                  <Phone className="w-3.5 h-3.5" style={{color:'#9CA3AF'}} />
                  <span>{venue.contactPhone}</span>
                </div>
              )}
            </div>
          )}

          {/* Equipment & Amenities (Only if provided) */}
          {venue.amenities && venue.amenities.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider mb-2.5" style={{color:'#6B7280'}}>
                Equipment &amp; Amenities
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {venue.amenities.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs p-2.5 rounded-xl border"
                    style={{background:'#F9FAFB', borderColor:'#E5E7EB', color:'#374151'}}>
                    <CheckCircle className="w-4 h-4 shrink-0" style={{color:'#059669'}} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Schedule */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider mb-2.5 flex items-center gap-2" style={{color:'#6B7280'}}>
              <Calendar className="w-4 h-4" style={{color:'#DC2626'}} />
              Upcoming Reserved Events ({venueBookings.length})
            </h4>
            {venueBookings.length > 0 ? (
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {venueBookings.map((b) => (
                  <div key={b.id} className="p-3 rounded-xl border flex items-center justify-between text-xs"
                    style={{background:'#F9FAFB', borderColor:'#E5E7EB'}}>
                    <div>
                      <div className="font-bold" style={{color:'#111827'}}>
                        {b.eventTitle} {b.roomNumber && <span className="font-mono text-[11px] font-bold" style={{color:'#B91C1C'}}>({b.roomNumber})</span>}
                      </div>
                      <div className="text-[11px]" style={{color:'#6B7280'}}>{b.organizer}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold" style={{color:'#B91C1C'}}>{formatDateFriendly(b.date)}</div>
                      <div className="text-[11px] font-mono" style={{color:'#4B5563'}}>{formatTime12H(b.startTime)} - {formatTime12H(b.endTime)}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs italic p-3.5 rounded-xl border flex items-center gap-2"
                style={{background:'#F9FAFB', borderColor:'#E5E7EB', color:'#6B7280'}}>
                <CheckCircle className="w-4 h-4 shrink-0" style={{color:'#059669'}} />
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
              className="btn-primary w-full justify-center py-3 text-sm"
            >
              <Sparkles className="w-4 h-4" style={{color:'#FCA5A5'}} />
              <span>Book This Venue Slot</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
