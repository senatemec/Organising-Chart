import React from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  Building2, 
  DoorClosed, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  FileText, 
  Tag, 
  User, 
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { formatDateFriendly, formatTime12H, formatDateTime } from '../utils/availabilityUtils';

export default function EventDetailsModal({ 
  event, 
  venue, 
  onClose, 
  currentUser,
  onAdminRevokeClick,
  allBookings = []
}) {
  if (!event) return null;

  const isConfirmed = event.status === 'confirmed' || event.status === 'approved';

  // Find sister venue bookings that belong to the same event
  const sisterBookings = allBookings.filter(b => {
    if (b.id === event.id) return false;
    if (event.eventId && b.eventId) {
      return b.eventId === event.eventId;
    }
    return Boolean(
      b.eventTitle && event.eventTitle &&
      b.eventTitle.toLowerCase().trim() === event.eventTitle.toLowerCase().trim() &&
      b.organizer === event.organizer &&
      b.date === event.date
    );
  });

  return (
    <div 
      className="modal-overlay animate-fade-in" 
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="glass-panel w-full max-w-lg rounded-2xl sm:rounded-3xl border border-gray-200 p-4 sm:p-6 md:p-8 relative bg-white shadow-2xl space-y-4 sm:space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gray-100 text-gray-500 hover:text-gray-900 hover:bg-gray-200 flex items-center justify-center transition-colors border border-gray-200 z-10"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg border"
              style={{background:'#FEE2E2', color:'#7F1D1D', borderColor:'#FCA5A5'}}>
              {event.id}
            </span>
            {event.eventId && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-gray-100 text-gray-700">
                Event: {event.eventId}
              </span>
            )}
            {sisterBookings.length > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-red-100 text-red-800 border-red-200">
                Multi-Venue ({sisterBookings.length + 1} Venues)
              </span>
            )}
            {isConfirmed ? (
              <span className="badge badge-available text-[11px] py-0.5">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Confirmed Reservation
              </span>
            ) : (
              <span className="badge badge-occupied text-[11px] py-0.5">
                <XCircle className="w-3.5 h-3.5 mr-1" /> Revoked by Union
              </span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight leading-snug" style={{color:'#000000'}}>
            {event.eventTitle}
          </h2>
          <div className="text-xs font-bold flex items-center gap-1.5" style={{color:'#B91C1C'}}>
            <span className="w-2 h-2 rounded-full" style={{backgroundColor:'#DC2626'}} />
            <span>{event.organizer}</span>
          </div>
        </div>

        {/* Details Grid */}
        <div className="space-y-3 p-4 sm:p-5 rounded-2xl border text-xs shadow-xs" style={{background:'#F9FAFB', borderColor:'#E5E7EB'}}>
          
          {/* Venue & Room */}
          <div className="flex items-start justify-between gap-2 border-b border-gray-200 pb-2.5">
            <span className="flex items-center gap-1.5" style={{color:'#6B7280'}}>
              <Building2 className="w-3.5 h-3.5 shrink-0" style={{color:'#DC2626'}} />
              <span>Campus Venue:</span>
            </span>
            <span className="font-bold text-right" style={{color:'#000000'}}>
              {event.venueName || venue?.name}
              {event.roomNumber && (
                <span className="font-mono block sm:inline sm:ml-1 font-bold" style={{color:'#B91C1C'}}>
                  ({event.roomNumber})
                </span>
              )}
            </span>
          </div>

          {/* Date */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-2.5">
            <span className="flex items-center gap-1.5" style={{color:'#6B7280'}}>
              <Calendar className="w-3.5 h-3.5 shrink-0" style={{color:'#DC2626'}} />
              <span>Event Date:</span>
            </span>
            <span className="font-semibold" style={{color:'#111827'}}>
              {formatDateFriendly(event.date)}
            </span>
          </div>

          {/* Scheduled Time */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-2.5">
            <span className="flex items-center gap-1.5" style={{color:'#6B7280'}}>
              <Clock className="w-3.5 h-3.5 shrink-0" style={{color:'#DC2626'}} />
              <span>Time Slot:</span>
            </span>
            <span className="font-mono font-bold" style={{color:'#111827'}}>
              {formatTime12H(event.startTime)} – {formatTime12H(event.endTime)}
            </span>
          </div>

          {/* Booking Submission Timestamp */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-2.5">
            <span className="flex items-center gap-1.5" style={{color:'#6B7280'}}>
              <Clock className="w-3.5 h-3.5 shrink-0" style={{color:'#059669'}} />
              <span>Booking Date &amp; Time:</span>
            </span>
            <span className="font-medium font-mono text-[11px]" style={{color:'#059669'}}>
              {formatDateTime(event.createdAt || event.bookedAt)}
            </span>
          </div>

          {/* Division */}
          {venue && (
            <div className="flex items-center justify-between border-b border-gray-200 pb-2.5">
              <span className="flex items-center gap-1.5" style={{color:'#6B7280'}}>
                <Tag className="w-3.5 h-3.5 shrink-0" style={{color:'#9CA3AF'}} />
                <span>Division:</span>
              </span>
              <span className="font-medium" style={{color:'#374151'}}>
                {venue.type} • Capacity {venue.capacity === 'NA' ? 'NA' : venue.capacity}
              </span>
            </div>
          )}

          {/* Approved Authority */}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5" style={{color:'#6B7280'}}>
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" style={{color:'#16A34A'}} />
              <span>Authority:</span>
            </span>
            <span className="font-semibold text-[11px]" style={{color:'#166534'}}>
              Govt. Model Engineering College • Union MEC
            </span>
          </div>

        </div>

        {/* Multi-Venue Sister Bookings */}
        {sisterBookings.length > 0 && (
          <div className="space-y-2 p-4 rounded-2xl border text-xs" style={{background:'#FEF2F2', borderColor:'#FECACA'}}>
            <div className="flex items-center gap-1.5 font-bold" style={{color:'#991B1B'}}>
              <Sparkles className="w-3.5 h-3.5" style={{color:'#DC2626'}} />
              <span>Other Venues Booked for this Event ({sisterBookings.length}):</span>
            </div>
            <div className="space-y-1.5 pt-1">
              {sisterBookings.map((b) => (
                <div key={b.id} className="p-2.5 rounded-xl border bg-white flex items-center justify-between gap-2 shadow-xs" style={{borderColor:'#FCA5A5'}}>
                  <div>
                    <div className="font-bold text-[11px]" style={{color:'#111827'}}>
                      {b.venueName} {b.roomNumber && <span className="font-mono text-red-700">({b.roomNumber})</span>}
                    </div>
                    <div className="text-[10px] text-gray-500 font-mono">
                      {formatDateFriendly(b.date)} • {formatTime12H(b.startTime)} - {formatTime12H(b.endTime)}
                    </div>
                  </div>
                  <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200">
                    {b.id}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Event Notes / Agenda (if available) */}
        {event.description && (
          <div className="space-y-1.5 p-4 rounded-2xl border text-xs" style={{background:'#F9FAFB', borderColor:'#E5E7EB'}}>
            <div className="flex items-center gap-1.5 font-bold" style={{color:'#374151'}}>
              <FileText className="w-3.5 h-3.5" style={{color:'#9CA3AF'}} />
              <span>Event Agenda &amp; Notes:</span>
            </div>
            <p className="leading-relaxed text-[11px]" style={{color:'#4B5563'}}>
              {event.description}
            </p>
          </div>
        )}

        {/* Admin Cancellation Banner (if cancelled) */}
        {!isConfirmed && (
          <div className="border p-4 rounded-2xl text-xs space-y-1.5" style={{background:'#FFF5F5', borderColor:'#FCA5A5', color:'#7F1D1D'}}>
            <div className="flex items-center gap-1.5 font-bold" style={{color:'#991B1B'}}>
              <AlertTriangle className="w-4 h-4" style={{color:'#DC2626'}} />
              <span>Revoked by Union Senate Admin:</span>
            </div>
            <p className="text-[11px] italic pl-5" style={{color:'#7F1D1D'}}>
              "{event.cancellationReason || 'Cancelled due to administrative priority or schedule adjustment.'}"
            </p>
          </div>
        )}

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          {/* If Union Admin is viewing an active booking, allow instant revocation */}
          {currentUser?.isUnionAdmin && isConfirmed && onAdminRevokeClick ? (
            <button
              onClick={() => {
                onClose();
                onAdminRevokeClick(event);
              }}
              className="btn-danger text-xs py-2 px-4"
            >
              <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Revoke Slot Permit
            </button>
          ) : (
            <div className="text-[11px] flex items-center gap-1.5" style={{color:'#6B7280'}}>
              <ShieldCheck className="w-3.5 h-3.5" style={{color:'#059669'}} />
              <span>Official MEC Scheduling System</span>
            </div>
          )}

          <button
            onClick={onClose}
            className="btn-primary text-xs py-2 px-6 ml-auto"
          >
            Close Details
          </button>
        </div>

      </div>
    </div>
  );
}
