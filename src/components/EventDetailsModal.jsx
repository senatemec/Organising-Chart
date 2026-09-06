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
import { formatDateFriendly, formatTime12H } from '../utils/availabilityUtils';

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
      <div className="glass-panel w-full max-w-lg rounded-3xl border border-white/20 p-6 sm:p-8 relative bg-slate-950 shadow-2xl space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-900/90 text-slate-400 hover:text-white flex items-center justify-center transition-colors border border-white/10 z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-indigo-300 bg-indigo-500/15 px-2.5 py-1 rounded-lg border border-indigo-500/20">
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

          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug">
            {event.eventTitle}
          </h2>
          <div className="text-xs text-indigo-300 font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            <span>{event.organizer}</span>
          </div>
        </div>

        {/* Details Grid */}
        <div className="space-y-3 bg-slate-900/80 p-4 sm:p-5 rounded-2xl border border-white/10 text-xs">
          
          {/* Venue & Room */}
          <div className="flex items-start justify-between gap-2 border-b border-white/5 pb-2.5">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Campus Venue:</span>
            </span>
            <span className="font-bold text-white text-right">
              {event.venueName || venue?.name}
              {event.roomNumber && (
                <span className="text-cyan-300 font-mono block sm:inline sm:ml-1 font-bold">
                  ({event.roomNumber})
                </span>
              )}
            </span>
          </div>

          {/* Date */}
          <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>Event Date:</span>
            </span>
            <span className="font-semibold text-white">
              {formatDateFriendly(event.date)}
            </span>
          </div>

          {/* Scheduled Time */}
          <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Time Slot:</span>
            </span>
            <span className="font-mono text-cyan-300 font-bold">
              {formatTime12H(event.startTime)} – {formatTime12H(event.endTime)}
            </span>
          </div>

          {/* Booking Submission Timestamp */}
          <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Booking Date & Time:</span>
            </span>
            <span className="text-emerald-300 font-medium font-mono text-[11px]">
              {formatDateTime(event.createdAt || event.bookedAt)}
            </span>
          </div>

          {/* Division */}
          {venue && (
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Division:</span>
              </span>
              <span className="text-slate-200 font-medium">
                {venue.type} • Capacity {venue.capacity === 'NA' ? 'NA' : venue.capacity}
              </span>
            </div>
          )}

          {/* Approved Authority */}
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Authority:</span>
            </span>
            <span className="text-emerald-300 font-semibold text-[11px]">
              Govt. Model Engineering College • Union MEC
            </span>
          </div>

        </div>

        {/* Event Notes / Agenda (if available) */}
        {event.description && (
          <div className="space-y-1.5 bg-slate-900/50 p-4 rounded-2xl border border-white/5 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-300">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Event Agenda & Notes:</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              {event.description}
            </p>
          </div>
        )}

        {/* Admin Cancellation Banner (if cancelled) */}
        {!isConfirmed && (
          <div className="bg-rose-500/15 border border-rose-500/40 p-4 rounded-2xl text-xs text-rose-300 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-rose-200">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Revoked by Union Senate Admin:</span>
            </div>
            <p className="text-[11px] text-rose-200 italic pl-5">
              "{event.cancellationReason || 'Cancelled due to administrative priority or schedule adjustment.'}"
            </p>
          </div>
        )}

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          {/* If Union Admin is viewing an active booking, allow instant revocation */}
          {currentUser?.isUnionAdmin && isConfirmed && onAdminRevokeClick ? (
            <button
              onClick={() => {
                onClose();
                onAdminRevokeClick(event);
              }}
              className="btn-danger text-xs py-2 px-4"
            >
              <AlertTriangle className="w-3.5 h-3.5" /> Revoke Slot Permit
            </button>
          ) : (
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/70" />
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
