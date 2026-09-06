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
      <div className="glass-panel w-full max-w-lg rounded-3xl border border-gray-200 p-6 sm:p-8 relative bg-white shadow-2xl space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-gray-100 text-gray-500 hover:text-gray-900 hover:bg-gray-200 flex items-center justify-center transition-colors border border-gray-200 z-20 shadow-xs"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Printable Ticket Pass Container */}
        <div className="bg-white p-6 rounded-2xl border-2 border-red-600 shadow-lg space-y-5 text-center relative overflow-hidden">
          
          {/* Pass Header */}
          <div className="border-b border-red-200 pb-4 relative z-10">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 border border-red-200 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-lg text-gray-900 tracking-tight">
                OFFICIAL CAMPUS GATEWAY PERMIT
              </span>
            </div>
            <p className="text-[11px] text-red-700 font-bold uppercase tracking-wider">
              College Student Union Verified Venue Gatepass
            </p>
          </div>

          {/* QR Code Visual Box */}
          <div className="bg-gray-50 p-4 rounded-2xl w-44 h-44 mx-auto flex flex-col items-center justify-center shadow-inner border border-gray-200 relative z-10">
            <svg viewBox="0 0 100 100" className="w-full h-full text-gray-900">
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
            <div className="font-mono text-[10px] text-gray-900 font-extrabold mt-1">
              {booking.id}
            </div>
          </div>

          {/* Details Ticket Summary */}
          <div className="text-xs space-y-2 text-left bg-gray-50 p-4 rounded-xl border border-gray-200 relative z-10">
            <div className="flex justify-between border-b border-gray-200 pb-1.5">
              <span className="text-gray-500 font-medium">Permit Holder:</span>
              <span className="font-bold text-gray-900">{booking.organizer}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-1.5">
              <span className="text-gray-500 font-medium">Event Title:</span>
              <span className="font-bold text-red-700">{booking.eventTitle}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-1.5">
              <span className="text-gray-500 font-medium">Venue & Room:</span>
              <span className="font-bold text-gray-900">
                {booking.venueName} {booking.roomNumber && <span className="text-red-700 font-mono">({booking.roomNumber})</span>}
              </span>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-1.5">
              <span className="text-gray-500 font-medium">Schedule:</span>
              <span className="font-mono text-gray-900 font-bold">
                {formatDateFriendly(booking.date)} ({formatTime12H(booking.startTime)} - {formatTime12H(booking.endTime)})
              </span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-gray-500 font-medium">Security Clearance:</span>
              <span className="font-bold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Instant Verified Pass
              </span>
            </div>
          </div>

          <div className="text-[10px] text-gray-500 italic">
            * Present this digital pass to Campus Security & Sound System Technician upon arrival.
          </div>

        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button onClick={handlePrint} className="btn-primary flex-1 justify-center py-2.5 text-xs">
            <Printer className="w-4 h-4" /> Print / Save Security Pass
          </button>
        </div>

      </div>
    </div>
  );
}
