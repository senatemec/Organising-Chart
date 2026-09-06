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
import { formatDateFriendly, formatTime12H, formatDateTime } from '../utils/availabilityUtils';

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
      <div className="glass-panel p-12 text-center rounded-3xl border border-gray-200 space-y-5 bg-white max-w-xl mx-auto shadow-xl">
        <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 text-red-600 mx-auto flex items-center justify-center shadow-md">
          <Lock className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">Sign In to View Your Bookings</h2>
          <p className="text-xs text-gray-600 mt-1 max-w-sm mx-auto">
            Please sign in with your college Google account to access your personal venue bookings and permits.
          </p>
        </div>
        <button
          onClick={() => onOpenLoginModal('Sign in with Google to view your venue bookings')}
          className="btn-primary py-2.5 px-6 text-xs mx-auto"
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
      <div className="glass-panel p-6 rounded-3xl border border-gray-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center shadow-sm shrink-0">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">My Bookings & Permits</h2>
              <span className="badge font-bold text-[10px]" style={{ background: '#FEE2E2', color: '#B91C1C', borderColor: '#FCA5A5' }}>
                {currentUser.email}
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-0.5">
              Your confirmed campus venue and classroom booking permits
            </p>
          </div>
        </div>

        <button onClick={onNewBookingClick} className="btn-primary text-xs py-2.5 px-4">
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
                ? 'bg-red-600 text-white border-red-600 shadow-sm'
                : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200 hover:text-gray-900'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              filterStatus === tab.id ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
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
                className={`glass-panel p-5 rounded-2xl border flex flex-col justify-between space-y-4 bg-white transition-all shadow-sm ${
                  isConfirmed ? 'border-gray-200 hover:border-red-400' : 'border-red-300'
                }`}
              >
                <div className="space-y-3">
                  
                  {/* Top Header */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-red-900 bg-red-50 px-2.5 py-1 rounded-lg border border-red-200">
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
                    <h3 className="text-base font-bold text-gray-900 leading-snug">{b.eventTitle}</h3>
                    <p className="text-xs text-red-700 font-semibold mt-0.5">{b.organizer}</p>
                  </div>

                  {/* Details Grid */}
                  <div className="space-y-2 text-xs text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-red-600 shrink-0" />
                      <span className="font-bold text-gray-900">
                        {b.venueName} {b.roomNumber && <strong className="text-red-700 font-mono">({b.roomNumber})</strong>}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-gray-900 font-bold">
                      <Calendar className="w-3.5 h-3.5 text-red-600 shrink-0" />
                      <span><strong>Event:</strong> {formatDateFriendly(b.date)} ({formatTime12H(b.startTime)} - {formatTime12H(b.endTime)})</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span><strong>Booked On:</strong> {formatDateTime(b.createdAt || b.bookedAt)}</span>
                    </div>
                  </div>

                  {/* Rejection / Cancellation Notice from Admin */}
                  {!isConfirmed && (
                    <div className="bg-red-50 border border-red-200 p-3 rounded-xl text-xs text-red-800 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-red-900">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        <span>Revoked by Union Senate Admin:</span>
                      </div>
                      <p className="text-[11px] text-red-800 pl-5 italic">
                        "{b.cancellationReason || 'Cancelled due to administrative or institutional conflict.'}"
                      </p>
                    </div>
                  )}

                </div>

                {/* Card Status Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs">
                  {isConfirmed ? (
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Permit Valid & Active
                      </span>
                      <span className="text-[10px] text-gray-500 italic">
                        Authorized by Union MEC
                      </span>
                    </div>
                  ) : (
                    <div className="text-[11px] text-red-700 text-center w-full italic">
                      This permit was revoked by Union Admin and the slot has been released.
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-panel p-12 text-center rounded-2xl border border-gray-200 space-y-3 bg-white shadow-sm">
          <Ticket className="w-12 h-12 text-gray-400 mx-auto" />
          <h3 className="text-base font-bold text-gray-900">No Bookings Found</h3>
          <p className="text-xs text-gray-600 max-w-sm mx-auto">
            You haven't reserved any venues with <span className="font-mono text-red-700 font-bold">{currentUser.email}</span> yet. Browse campus venues to book a slot!
          </p>
          <button onClick={onNewBookingClick} className="btn-primary text-xs mt-2">
            Book Venue Slot
          </button>
        </div>
      )}

    </div>
  );
}
