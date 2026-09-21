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
  AlertTriangle, 
  Lock, 
  ShieldCheck, 
  FileText,
  X,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { formatDateFriendly, formatTime12H, formatDateTime } from '../utils/availabilityUtils';

const QUICK_REASONS = [
  'Event Postponed to later date',
  'Guest Speaker / Dignitary Unavailable',
  'Schedule Conflict with Academic Exams',
  'Internal Club Decision / Low Turnout',
  'Moved to Alternate External Venue',
  'Technical or Lab Requirement Conflict'
];

export default function MyBookings({ 
  bookings, 
  venues, 
  currentUser,
  onOpenLoginModal,
  onNewBookingClick,
  onCancelBooking
}) {
  const [filterStatus, setFilterStatus] = useState('all');

  // Cancel Modal State
  const [cancelModalBooking, setCancelModalBooking] = useState(null);
  const [cancelReasonText, setCancelReasonText] = useState('');
  const [selectedQuickReason, setSelectedQuickReason] = useState('');
  const [cancelWholePackage, setCancelWholePackage] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);

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
            Please sign in with your college Google account or authorized club account to access your personal venue bookings and cancellation permits.
          </p>
        </div>
        <button
          onClick={() => onOpenLoginModal('Sign in with Google or your Club account to view venue bookings')}
          className="btn-secondary py-2.5 px-6 text-xs mx-auto flex items-center justify-center gap-2 font-bold shadow-sm"
          style={{ color: '#000000', backgroundColor: '#FFFFFF', borderColor: '#D1D5DB' }}
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"/>
            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
          </svg>
          <span style={{ color: '#000000', fontWeight: 'bold' }}>Sign In / Choose Club</span>
        </button>
      </div>
    );
  }

  // Filter bookings strictly created by this logged-in account (or matching society)
  const myUserBookings = bookings.filter((b) => {
    if (!currentUser?.email) return false;
    const userEmail = currentUser.email.toLowerCase().trim();
    const contact = (b.contactEmail || '').toLowerCase().trim();
    const user = (b.userEmail || '').toLowerCase().trim();
    const userSociety = (currentUser.society || '').toLowerCase().trim();
    const organizer = (b.organizer || '').toLowerCase().trim();

    return contact === userEmail || user === userEmail || (userSociety && organizer === userSociety);
  });

  const filteredBookings = myUserBookings.filter((b) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'active') return b.status === 'confirmed' || b.status === 'approved';
    if (filterStatus === 'cancelled') return b.status === 'cancelled' || b.status === 'rejected';
    return true;
  });

  const activeCount = myUserBookings.filter(b => b.status === 'confirmed' || b.status === 'approved').length;
  const cancelledCount = myUserBookings.filter(b => b.status === 'cancelled' || b.status === 'rejected').length;

  const handleOpenCancelModal = (booking) => {
    setCancelModalBooking(booking);
    setCancelReasonText('');
    setSelectedQuickReason('');
    setCancelError('');
    setCancelWholePackage(false);
  };

  const handleConfirmCancel = async () => {
    const finalReason = cancelReasonText.trim() || selectedQuickReason.trim();
    if (!finalReason) {
      setCancelError('Please specify a cancellation reason so the slot release can be documented.');
      return;
    }

    if (!onCancelBooking || !cancelModalBooking) return;

    setIsSubmittingCancel(true);
    try {
      await onCancelBooking(cancelModalBooking.id, finalReason, cancelWholePackage);
      setCancelModalBooking(null);
    } catch (e) {
      setCancelError('Failed to cancel booking. Please try again.');
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-gray-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center shadow-sm shrink-0">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
                {currentUser.society ? `${currentUser.society} Bookings` : 'My Bookings & Permits'}
              </h2>
              <span className="badge font-bold text-[10px]" style={{ background: '#FEE2E2', color: '#B91C1C', borderColor: '#FCA5A5' }}>
                {currentUser.email}
              </span>
              {currentUser.role && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-gray-100 text-gray-700 border-gray-200">
                  {currentUser.role}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-600 mt-0.5">
              Manage, review permits, and cancel reservations with documented reasons to release campus slots.
            </p>
          </div>
        </div>

        <button onClick={onNewBookingClick} className="btn-primary text-xs py-2.5 px-4 font-bold shrink-0">
          <Plus className="w-4 h-4" /> Book New Venue
        </button>
      </div>

      {/* Filter Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'All My Bookings', count: myUserBookings.length },
          { id: 'active', label: 'Active Permits', count: activeCount },
          { id: 'cancelled', label: 'Cancelled / Released', count: cancelledCount },
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
                  isConfirmed ? 'border-gray-200 hover:border-red-400' : 'border-red-200 bg-gray-50/40'
                }`}
              >
                <div className="space-y-3">
                  
                  {/* Top Header */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono text-xs font-bold text-red-900 bg-red-50 px-2.5 py-1 rounded-lg border border-red-200">
                        {b.id}
                      </span>
                      {b.eventId && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-red-50 text-red-800 border-red-200">
                          Package: {b.eventId}
                        </span>
                      )}
                    </div>
                    {isConfirmed ? (
                      <span className="badge badge-available">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed Permit
                      </span>
                    ) : (
                      <span className="badge badge-occupied">
                        <XCircle className="w-3.5 h-3.5" /> {b.cancelledByClub ? 'Cancelled by Club' : 'Revoked by Union'}
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

                  {/* Cancellation Reason Display (If Cancelled) */}
                  {!isConfirmed && (
                    <div className="bg-red-50 border border-red-200 p-3.5 rounded-xl text-xs space-y-1.5 animate-fade-in">
                      <div className="flex items-center gap-1.5 font-bold text-red-900">
                        <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                        <span>
                          {b.cancelledByClub 
                            ? `Cancelled by Club (${b.cancelledByClub}):` 
                            : 'Revoked by Union Senate Admin:'}
                        </span>
                      </div>
                      <p className="text-[11px] text-red-800 pl-5 italic font-medium">
                        "{b.cancellationReason || 'Cancelled by organizing club.'}"
                      </p>
                      {b.cancelledAt && (
                        <div className="text-[10px] text-red-700 pl-5 font-mono pt-0.5">
                          Cancelled on: {formatDateTime(b.cancelledAt)} • Slot Released
                        </div>
                      )}
                    </div>
                  )}

                </div>

                {/* Card Action Footer */}
                <div className="pt-3 border-t border-gray-100 text-xs">
                  {isConfirmed ? (
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Permit Valid & Active
                      </span>

                      {/* CANCEL BOOKING BUTTON FOR CLUB USER */}
                      {onCancelBooking && (
                        <button
                          type="button"
                          onClick={() => handleOpenCancelModal(b)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold text-red-700 bg-red-50 hover:bg-red-600 hover:text-white border border-red-200 transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer ml-auto"
                          title="Cancel this booking and release the slot"
                        >
                          <XCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>Cancel Booking</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="text-[11px] text-gray-500 text-center w-full italic">
                      This permit has been cancelled and the slot has been released back to the campus pool.
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
            No venue bookings found for <span className="font-mono text-red-700 font-bold">{currentUser.society || currentUser.email}</span>. Browse campus venues to reserve a slot!
          </p>
          <button onClick={onNewBookingClick} className="btn-primary text-xs mt-2 font-bold">
            Book Venue Slot
          </button>
        </div>
      )}

      {/* INDIVIDUAL CLUB CANCEL BOOKING MODAL */}
      {cancelModalBooking && (() => {
        const siblingBookings = cancelModalBooking.eventId
          ? bookings.filter(b => b.eventId === cancelModalBooking.eventId && (b.status === 'confirmed' || b.status === 'approved'))
          : [];
        const isPackage = cancelModalBooking.eventId && siblingBookings.length > 1;

        return (
          <div className="modal-overlay animate-fade-in" onClick={(e) => { if (e.target === e.currentTarget) setCancelModalBooking(null); }}>
            <div className="glass-panel w-full max-w-lg rounded-3xl border border-gray-200 p-6 relative bg-white shadow-2xl space-y-5">
              
              {/* Close Button */}
              <button
                onClick={() => setCancelModalBooking(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:text-gray-900 hover:bg-gray-200 flex items-center justify-center transition-colors border border-gray-200"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Modal Header */}
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center shrink-0">
                  <XCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-gray-900">Cancel Booking Permit</h3>
                  <p className="text-xs text-gray-600">
                    Release venue slot for <span className="font-bold text-red-700">{cancelModalBooking.venueName}</span>
                  </p>
                </div>
              </div>

              {/* Booking Summary Box */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-2 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-200">
                    {cancelModalBooking.id}
                  </span>
                  <span className="text-[11px] font-semibold text-gray-500">
                    {cancelModalBooking.organizer}
                  </span>
                </div>

                <div className="font-bold text-gray-900 text-sm">{cancelModalBooking.eventTitle}</div>
                
                <div className="flex items-center gap-2 font-mono text-red-700 text-xs font-bold pt-0.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatDateFriendly(cancelModalBooking.date)} ({formatTime12H(cancelModalBooking.startTime)} - {formatTime12H(cancelModalBooking.endTime)})</span>
                </div>

                {/* Multi-Venue Event Package Option */}
                {isPackage && (
                  <div className="mt-3 pt-3 border-t border-gray-200 bg-amber-50 p-3 rounded-xl border border-amber-200 space-y-2 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-amber-900">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>Part of Multi-Venue Event Package ({cancelModalBooking.eventId})</span>
                    </div>
                    <p className="text-[11px] text-amber-800">
                      This event package includes {siblingBookings.length} venues ({siblingBookings.map(s => s.venueName).join(', ')}).
                    </p>
                    <label className="flex items-center gap-2 text-gray-900 font-bold cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={cancelWholePackage}
                        onChange={(e) => setCancelWholePackage(e.target.checked)}
                        className="rounded text-red-600 focus:ring-red-500 w-4 h-4"
                      />
                      <span>Cancel entire event package across all {siblingBookings.length} venues</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Cancellation Reason Input Section */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-800 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-red-600" />
                    <span>Reason for Cancellation (Required):</span>
                  </span>
                  <span className="text-[10px] text-gray-500">Documented for institutional records</span>
                </label>

                {/* Quick select chips */}
                <div className="flex flex-wrap gap-1.5 pb-1">
                  {QUICK_REASONS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setSelectedQuickReason(preset);
                        setCancelReasonText(preset);
                        setCancelError('');
                      }}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-all ${
                        cancelReasonText === preset || selectedQuickReason === preset
                          ? 'bg-red-600 text-white border-red-600 shadow-2xs'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                <textarea
                  rows="3"
                  value={cancelReasonText}
                  onChange={(e) => {
                    setCancelReasonText(e.target.value);
                    setCancelError('');
                  }}
                  placeholder="Explain why your club is cancelling this reservation (e.g. exams postponed, guest speaker travel delayed, rescheduling for next month)..."
                  className="input-field text-xs w-full resize-none rounded-xl"
                />

                {cancelError && (
                  <div className="text-xs text-red-600 flex items-center gap-1.5 font-semibold animate-fade-in">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{cancelError}</span>
                  </div>
                )}

                <p className="text-[11px] text-gray-500 leading-relaxed">
                  Upon cancellation, the venue slot will be immediately unlocked in the Live Matrix so other student bodies can book it.
                </p>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setCancelModalBooking(null)}
                  disabled={isSubmittingCancel}
                  className="btn-secondary text-xs py-2 px-4"
                >
                  Nevermind, Keep Booking
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancel}
                  disabled={isSubmittingCancel}
                  className="btn-danger text-xs py-2 px-5 font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>{isSubmittingCancel ? 'Cancelling...' : 'Confirm Cancellation'}</span>
                </button>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
}
