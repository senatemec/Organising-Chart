import React from 'react';
import { 
  X, 
  Printer, 
  Download, 
  QrCode, 
  ShieldCheck, 
  Building2, 
  Calendar, 
  Clock, 
  CheckCircle2,
  Users,
  Award,
  Sparkles,
  DoorClosed
} from 'lucide-react';
import { formatDateFriendly, formatTime12H } from '../utils/availabilityUtils';

export default function QRPassModal({ booking, venue, onClose }) {
  if (!booking) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay animate-fade-in no-print" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="glass-panel w-full max-w-lg rounded-3xl border border-white/20 p-6 sm:p-8 relative bg-slate-950 shadow-2xl space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-900/90 text-slate-400 hover:text-white flex items-center justify-center transition-colors border border-white/10 z-20 shadow-md"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Printable Ticket Pass Container */}
        <div className="bg-gradient-to-b from-slate-900 to-indigo-950/50 p-6 rounded-2xl border-2 border-indigo-500/40 shadow-xl space-y-5 text-center relative overflow-hidden">
          
          {/* Background Ambient Glow */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-36 h-36 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Pass Header */}
          <div className="border-b border-indigo-500/30 pb-4 relative z-10">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-lg text-white tracking-tight">
                OFFICIAL CAMPUS GATEWAY PERMIT
              </span>
            </div>
            <p className="text-[11px] text-indigo-300 font-bold uppercase tracking-wider">
              College Student Union Verified Venue Gatepass
            </p>
          </div>

          {/* QR Code Visual Box */}
          <div className="bg-white p-4 rounded-2xl w-44 h-44 mx-auto flex flex-col items-center justify-center shadow-lg border border-slate-200 relative z-10">
            <svg viewBox="0 0 100 100" className="w-full h-full text-slate-950">
              <path fill="currentColor" d="M10,10 h30 v30 h-30 z M15,15 h20 v20 h-20 z M20,20 h10 v10 h-10 z" />
              <path fill="currentColor" d="M60,10 h30 v30 h-30 z M65,15 h20 v20 h-20 z M70,20 h10 v10 h-10 z" />
              <path fill="currentColor" d="M10,60 h30 v30 h-30 z M15,65 h20 v20 h-20 z M20,70 h10 v10 h-10 z" />
              <rect x="45" y="10" width="10" height="20" fill="currentColor" />
              <rect x="10" y="45" width="20" height="10" fill="currentColor" />
              <rect x="45" y="45" width="15" height="15" fill="currentColor" />
              <rect x="70" y="45" width="20" height="10" fill="currentColor" />
              <rect x="45" y="70" width="20" height="20" fill="currentColor" />
              <rect x="70" y="70" width="15" height="15" fill="currentColor" />
            </svg>
            <div className="font-mono text-[10px] text-slate-900 font-extrabold mt-1">
              {booking.id}
            </div>
          </div>

          {/* Details Ticket Summary */}
          <div className="text-xs space-y-2 text-left bg-slate-950/90 p-4 rounded-xl border border-white/10 relative z-10">
            <div className="flex justify-between border-b border-white/5 pb-1.5">
              <span className="text-slate-400">Permit Holder:</span>
              <span className="font-bold text-white">{booking.organizer}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-1.5">
              <span className="text-slate-400">Event Title:</span>
              <span className="font-bold text-indigo-300">{booking.eventTitle}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-1.5">
              <span className="text-slate-400">Venue & Room:</span>
              <span className="font-bold text-white">
                {booking.venueName} {booking.roomNumber && <span className="text-cyan-300 font-mono">({booking.roomNumber})</span>}
              </span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-1.5">
              <span className="text-slate-400">Schedule:</span>
              <span className="font-mono text-cyan-300 font-semibold">
                {formatDateFriendly(booking.date)} ({formatTime12H(booking.startTime)} - {formatTime12H(booking.endTime)})
              </span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-slate-400">Security Clearance:</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Instant Verified Pass
              </span>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 italic">
            * Present this digital pass to Campus Security & Sound System Technician upon arrival.
          </div>

        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button onClick={handlePrint} className="btn-primary flex-1 justify-center py-2.5 text-xs shadow-indigo-500/30">
            <Printer className="w-4 h-4" /> Print / Save Security Pass
          </button>
        </div>

      </div>
    </div>
  );
}
