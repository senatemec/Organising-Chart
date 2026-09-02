import React, { useState } from 'react';
import { 
  Ticket, 
  Calendar, 
  Clock, 
  Building2, 
  CheckCircle2, 
  AlertCircle,
  XCircle,
  Plus,
  Users,
  DoorClosed,
  AlertTriangle,
  Lock,
  ShieldCheck,
  LogIn
} from 'lucide-react';
import { formatDateFriendly, formatTime12H } from '../utils/availabilityUtils';

export default function MyBookings({ 
  bookings, 
  venues, 
  currentUser,
  onOpenLoginModal,
  onNewBookingClick 
}) {
  const [filterStatus, setFilterStatus] = useState('all');

  // If user is not logged in, prompt to sign in
  if (!currentUser) {
    return (
      <div className="glass-panel p-12 text-center rounded-3xl border border-white/10 space-y-5 bg-slate-950 max-w-xl mx-auto shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Lock className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-white">Sign In to View Your Bookings</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Please sign in with your college Google account to access your personal venue bookings and permits.
          </p>
        </div>
        <button
          onClick={() => onOpenLoginModal('Sign in with Google to view your venue bookings')}
          className="btn-primary py-2.5 px-6 text-xs mx-auto shadow-indigo-500/30"
        >
          <LogIn className="w-4 h-4" /> Sign In with Google
        </button>
      </div>
    );
  }

  // Filter bookings strictly created by this logged-in Google account
  const myUserBookings = bookings.filter((b) => {
    if (!b.contactEmail) return false;
    return b.contactEmail.toLowerCase().trim() === currentUser.email.toLowerCase().trim();
  });

  const filteredBookings = myUserBookings.filter((b) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'active') return b.status === 'confirmed' || b.status === 'approved';
    if (filterStatus === 'cancelled') return b.status === 'cancelled' || b.status === 'rejected';
    return true;
  });

  const activeCount = myUserBookings.filter(b => b.status === 'confirmed' || b.status === 'approved').length;
  const cancelledCount = myUserBookings.filter(b => b.status === 'cancelled' || b.status === 'rejected').length;

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-white tracking-tight">My Bookings & Permits</h2>
              <span className="badge bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px]">
                {currentUser.email}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Your confirmed campus venue and classroom booking permits
            </p>
          </div>
        </div>

        <button onClick={onNewBookingClick} className="btn-primary text-xs py-2.5 px-4 shadow-indigo-500/30">
          <Plus className="w-4 h-4" /> Book New Venue
        </button>
      </div>

      {/* Filter Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'All My Bookings', count: myUserBookings.length },
          { id: 'active', label: 'Active Permits', count: activeCount },
          { id: 'cancelled', label: 'Cancelled / Revoked', count: cancelledCount },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              filterStatus === tab.id
                ? 'bg-indigo-600 text-white border-indigo-400 shadow-sm'
                : 'bg-slate-900/80 text-slate-400 border-white/10 hover:text-white'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              filterStatus === tab.id ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Bookings Cards Grid */}
      {filteredBookings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredBookings.map((b) => {
            const isConfirmed = b.status === 'confirmed' || b.status === 'approved';

            return (
              <div
                key={b.id}
                className={`glass-panel p-5 rounded-2xl border flex flex-col justify-between space-y-4 bg-slate-950/80 transition-all shadow-md ${
                  isConfirmed ? 'border-white/10 hover:border-indigo-500/40' : 'border-rose-500/30'
                }`}
              >
                <div className="space-y-3">
                  
                  {/* Top Header */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                      {b.id}
                    </span>
                    {isConfirmed ? (
                      <span className="badge badge-available">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed Permit
                      </span>
                    ) : (
                      <span className="badge badge-occupied">
                        <XCircle className="w-3.5 h-3.5" /> Revoked by Union
                      </span>
                    )}
                  </div>

                  {/* Title & Society */}
                  <div>
                    <h3 className="text-base font-bold text-white leading-snug">{b.eventTitle}</h3>
                    <p className="text-xs text-indigo-300 font-semibold mt-0.5">{b.organizer}</p>
                  </div>

                  {/* Details Grid */}
                  <div className="space-y-2 text-xs text-slate-300 bg-slate-900/70 p-3 rounded-xl border border-white/5">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="font-medium text-white">
                        {b.venueName} {b.roomNumber && <strong className="text-cyan-300 font-mono">({b.roomNumber})</strong>}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-cyan-300">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span>{formatDateFriendly(b.date)} ({formatTime12H(b.startTime)} - {formatTime12H(b.endTime)})</span>
                    </div>
                  </div>

                  {/* Rejection / Cancellation Notice from Admin */}
                  {!isConfirmed && (
                    <div className="bg-rose-500/15 border border-rose-500/40 p-3 rounded-xl text-xs text-rose-300 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-rose-200">
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                        <span>Revoked by Union Senate Admin:</span>
                      </div>
                      <p className="text-[11px] text-rose-200 pl-5 italic">
                        "{b.cancellationReason || 'Cancelled due to administrative or institutional conflict.'}"
                      </p>
                    </div>
                  )}

                </div>

                {/* Card Status Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs">
                  {isConfirmed ? (
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Permit Valid & Active
                      </span>
                      <span className="text-[10px] text-slate-500 italic">
                        Authorized by Union MEC
                      </span>
                    </div>
                  ) : (
                    <div className="text-[11px] text-rose-400/80 text-center w-full italic">
                      This permit was revoked by Union Admin and the slot has been released.
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-panel p-12 text-center rounded-2xl border border-white/10 space-y-3 bg-slate-950">
          <Ticket className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Bookings Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You haven't reserved any venues with <span className="font-mono text-cyan-300">{currentUser.email}</span> yet. Browse campus venues to book a slot!
          </p>
          <button onClick={onNewBookingClick} className="btn-primary text-xs mt-2">
            Book Venue Slot
          </button>
        </div>
      )}

    </div>
  );
}
