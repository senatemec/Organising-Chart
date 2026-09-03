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
  onAdminRevokeClick 
}) {
  if (!event) return null;

  const isConfirmed = event.status === 'confirmed' || event.status === 'approved';

  return (
    <div 
      className="modal-overlay animate-fade-in" 
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="glass-panel w-full max-w-lg rounded-3xl border border-slate-200 p-6 sm:p-8 relative bg-white shadow-2xl space-y-6 text-slate-900">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors border border-slate-200 z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
              {event.id}
            </span>
            {isConfirmed ? (
              <span className="badge badge-available text-[11px] py-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed Reservation
              </span>
            ) : (
              <span className="badge badge-occupied text-[11px] py-0.5">
                <XCircle className="w-3.5 h-3.5" /> Revoked by Union
              </span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
            {event.eventTitle}
          </h2>
          <div className="text-xs text-blue-800 font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span>{event.organizer}</span>
          </div>
        </div>

        {/* Details Grid */}
        <div className="space-y-3 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 text-xs">
          
          {/* Venue & Room */}
          <div className="flex items-start justify-between gap-2 border-b border-slate-200 pb-2.5">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              <span>Campus Venue:</span>
            </span>
            <span className="font-bold text-slate-900 text-right">
              {event.venueName || venue?.name}
              {event.roomNumber && (
                <span className="text-blue-700 font-mono block sm:inline sm:ml-1 font-bold">
                  ({event.roomNumber})
                </span>
              )}
            </span>
          </div>

          {/* Date */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-700 shrink-0" />
              <span>Event Date:</span>
            </span>
            <span className="font-semibold text-slate-900">
              {formatDateFriendly(event.date)}
            </span>
          </div>

          {/* Scheduled Time */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              <span>Time Slot:</span>
            </span>
            <span className="font-mono text-blue-800 font-bold">
              {formatTime12H(event.startTime)} – {formatTime12H(event.endTime)}
            </span>
          </div>

          {/* Booking Submission Timestamp */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Booking Date & Time:</span>
            </span>
            <span className="text-emerald-800 font-medium font-mono text-[11px]">
              {formatDateTime(event.createdAt || event.bookedAt)}
            </span>
          </div>

          {/* Division */}
          {venue && (
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Division:</span>
              </span>
              <span className="text-slate-800 font-medium">
                {venue.type} • Capacity {venue.capacity}
              </span>
            </div>
          )}

          {/* Approved Authority */}
          <div className="flex items-center justify-between">
            <span className="text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Authority:</span>
            </span>
            <span className="text-emerald-800 font-semibold text-[11px]">
              Govt. Model Engineering College • Union MEC
            </span>
          </div>

        </div>

        {/* Event Notes / Agenda (if available) */}
        {event.description && (
          <div className="space-y-1.5 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-700">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Event Agenda & Notes:</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              {event.description}
            </p>
          </div>
        )}

        {/* Rejection / Cancellation Notice if revoked */}
        {!isConfirmed && (
          <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl text-xs text-rose-800 space-y-1">
            <div className="flex items-center gap-2 font-bold text-rose-900">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Permit Revoked by Union Admin</span>
            </div>
            <p className="text-[11px] text-rose-800 italic">
              "{event.cancellationReason || 'This booking has been revoked by Union Senate Administration.'}"
            </p>
          </div>
        )}

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200">
          <div className="text-[11px] text-slate-500">
            {isConfirmed ? (
              <span className="text-emerald-700 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Slot Officially Reserved
              </span>
            ) : (
              <span className="text-rose-700 font-medium">Slot Released</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Union Admin Revoke Button */}
            {currentUser?.isUnionAdmin && isConfirmed && onAdminRevokeClick && (
              <button
                onClick={() => {
                  onAdminRevokeClick(event);
                  onClose();
                }}
                className="btn-danger text-xs py-2 px-3.5"
              >
                <XCircle className="w-3.5 h-3.5" /> Revoke Permit
              </button>
            )}

            <button
              onClick={onClose}
              className="btn-secondary text-xs py-2 px-4 border-slate-300"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
