import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  Building2, 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  FileText, 
  User, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  DoorClosed,
  Info,
  Check
} from 'lucide-react';
import { 
  checkBookingConflict, 
  formatTime12H, 
  formatDateFriendly, 
  timeSlots,
  getSystemCurrentDate 
} from '../utils/availabilityUtils';

const COMMON_TIME_PRESETS = [
  { label: 'Morning (09:00 - 12:00)', start: '09:00', end: '12:00' },
  { label: 'Afternoon (13:00 - 16:00)', start: '13:00', end: '16:00' },
  { label: 'Full Day (09:00 - 17:00)', start: '09:00', end: '17:00' },
  { label: 'Evening (16:30 - 19:30)', start: '16:30', end: '19:30' }
];

export default function EditBookingModal({ 
  isOpen, 
  booking, 
  venues = [], 
  existingBookings = [], 
  currentUser = null,
  onClose, 
  onSaveBooking,
  onSave
}) {
  if (!isOpen || !booking) return null;

  // Initial Form State from current booking
  const [venueId, setVenueId] = useState(booking.venueId || venues[0]?.id || '');
  const [roomNumber, setRoomNumber] = useState(booking.roomNumber || '');
  const [date, setDate] = useState(booking.date || '2026-09-05');
  const [startTime, setStartTime] = useState(booking.startTime || '10:00');
  const [endTime, setEndTime] = useState(booking.endTime || '13:00');
  const [eventTitle, setEventTitle] = useState(booking.eventTitle || '');
  const [description, setDescription] = useState(booking.description || '');
  const [contactEmail, setContactEmail] = useState(booking.contactEmail || currentUser?.email || '');
  const [updateWholePackage, setUpdateWholePackage] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Selected Venue Object
  const selectedVenue = useMemo(() => {
    return venues.find(v => v.id === venueId) || null;
  }, [venues, venueId]);

  const isClassroomOrLab = selectedVenue?.requiresRoomNumber || venueId === 'classrooms' || selectedVenue?.type === 'Classrooms';

  // Sibling bookings in same event package
  const sisterBookings = useMemo(() => {
    if (!booking.eventId) return [];
    return (existingBookings || []).filter(
      b => b.eventId === booking.eventId && 
           b.id !== booking.id && 
           b.status !== 'cancelled' && 
           b.status !== 'rejected'
    );
  }, [booking.eventId, booking.id, existingBookings]);

  // Conflict Checking
  const conflictResult = useMemo(() => {
    // Basic time validation
    if (startTime >= endTime) {
      return {
        hasConflict: true,
        invalidTime: true,
        reason: 'Start time must be earlier than end time.'
      };
    }

    // Check if venue is under maintenance
    if (selectedVenue?.status === 'Maintenance') {
      return {
        hasConflict: true,
        isMaintenance: true,
        reason: `Venue "${selectedVenue.name}" is currently marked under Maintenance by Administration.`
      };
    }

    // Check for overlap against other bookings (excluding current booking)
    const conflict = checkBookingConflict(
      {
        venueId,
        roomNumber: isClassroomOrLab ? roomNumber : null,
        date,
        startTime,
        endTime,
        id: booking.id
      },
      existingBookings
    );

    if (conflict.hasConflict) {
      if (conflict.isDayBlock) {
        return {
          hasConflict: true,
          conflictingBooking: conflict.conflictingBooking,
          reason: `Campus lockdown / Day block in effect on ${formatDateFriendly(date)}: "${conflict.conflictingBooking.eventTitle}".`
        };
      }
      return {
        hasConflict: true,
        conflictingBooking: conflict.conflictingBooking,
        reason: `Time slot conflict with "${conflict.conflictingBooking.eventTitle}" (${conflict.conflictingBooking.organizer}) on ${formatDateFriendly(date)} from ${formatTime12H(conflict.conflictingBooking.startTime)} to ${formatTime12H(conflict.conflictingBooking.endTime)}.`
      };
    }

    return { hasConflict: false, reason: null };
  }, [venueId, roomNumber, date, startTime, endTime, booking.id, existingBookings, selectedVenue, isClassroomOrLab]);

  // Detected Changes
  const changesList = useMemo(() => {
    const changes = [];
    if (venueId !== booking.venueId) {
      const oldVenue = venues.find(v => v.id === booking.venueId)?.name || booking.venueName || booking.venueId;
      const newVenueName = selectedVenue?.name || venueId;
      changes.push({
        field: 'venue',
        label: 'Campus Venue',
        oldValue: oldVenue,
        newValue: newVenueName
      });
    }

    if (isClassroomOrLab && (roomNumber || '') !== (booking.roomNumber || '')) {
      changes.push({
        field: 'roomNumber',
        label: 'Room Number',
        oldValue: booking.roomNumber || 'None',
        newValue: roomNumber || 'None'
      });
    }

    if (date !== booking.date) {
      changes.push({
        field: 'date',
        label: 'Event Date',
        oldValue: formatDateFriendly(booking.date),
        newValue: formatDateFriendly(date)
      });
    }

    if (startTime !== booking.startTime || endTime !== booking.endTime) {
      changes.push({
        field: 'timings',
        label: 'Time Slot',
        oldValue: `${formatTime12H(booking.startTime)} – ${formatTime12H(booking.endTime)}`,
        newValue: `${formatTime12H(startTime)} – ${formatTime12H(endTime)}`
      });
    }

    if (eventTitle.trim() !== (booking.eventTitle || '').trim()) {
      changes.push({
        field: 'eventTitle',
        label: 'Event Title',
        oldValue: booking.eventTitle,
        newValue: eventTitle.trim()
      });
    }

    if (description.trim() !== (booking.description || '').trim()) {
      changes.push({
        field: 'description',
        label: 'Description / Agenda',
        oldValue: booking.description ? `${booking.description.slice(0, 40)}...` : 'None',
        newValue: description ? `${description.slice(0, 40)}...` : 'None'
      });
    }

    return changes;
  }, [venueId, roomNumber, date, startTime, endTime, eventTitle, description, booking, venues, selectedVenue, isClassroomOrLab]);

  const hasModifications = changesList.length > 0;

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!eventTitle.trim()) {
      setErrorMessage('Please provide an event title.');
      return;
    }

    if (conflictResult.hasConflict) {
      setErrorMessage(conflictResult.reason || 'Please resolve booking conflicts before saving.');
      return;
    }

    if (!hasModifications) {
      setErrorMessage('No changes detected to save.');
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedFields = {
        venueId,
        venueName: selectedVenue?.name || booking.venueName,
        roomNumber: isClassroomOrLab ? roomNumber.trim() : null,
        date,
        startTime,
        endTime,
        eventTitle: eventTitle.trim(),
        description: description.trim(),
        contactEmail: contactEmail.trim(),
        updatedAt: new Date().toISOString()
      };

      const saveHandler = onSaveBooking || onSave;
      if (typeof saveHandler === 'function') {
        await saveHandler(booking.id, updatedFields, updateWholePackage, changesList);
      }
      onClose();
    } catch (err) {
      console.error('Error saving booking changes:', err);
      setErrorMessage(err?.message || 'Failed to save booking changes. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div 
      className="modal-overlay animate-fade-in" 
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div 
        className="glass-panel w-full max-w-2xl rounded-3xl border border-gray-200 bg-white shadow-2xl flex flex-col max-h-[92vh] overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Sticky Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-extrabold text-gray-900 tracking-tight">
                  Edit Booking Permit
                </h3>
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-50 text-red-900 border border-red-200">
                  {booking.id}
                </span>
                {booking.eventId && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                    Package: {booking.eventId}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-600 mt-0.5">
                Organizing Club: <span className="font-bold text-red-700">{booking.organizer}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:text-gray-900 hover:bg-gray-200 flex items-center justify-center transition-colors border border-gray-200"
            title="Close Editor"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          
          {/* Conflict Status Banner (Real-time feedback) */}
          {conflictResult.hasConflict ? (
            <div className="p-3.5 rounded-2xl border border-red-300 bg-red-50 flex items-start gap-3 text-xs animate-fade-in shadow-xs">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold text-red-900">
                  Scheduling Conflict Detected
                </div>
                <div className="text-red-700 leading-relaxed font-medium">
                  {conflictResult.reason}
                </div>
                <div className="text-[10px] text-red-600 font-semibold pt-0.5">
                  Please choose an alternate venue, different date, or non-overlapping time window.
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 flex items-center gap-2.5 text-xs text-emerald-800 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Slot Clear & Available:</strong> {selectedVenue?.name || 'Venue'} on {formatDateFriendly(date)} ({formatTime12H(startTime)} – {formatTime12H(endTime)}).
              </span>
            </div>
          )}

          {/* SECTION 1: VENUE SELECTION & ROOM */}
          <div className="space-y-3 p-4 rounded-2xl border border-gray-200 bg-gray-50/50">
            <label className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-red-600" />
              <span>Campus Facility & Venue</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <select
                  value={venueId}
                  onChange={(e) => setVenueId(e.target.value)}
                  className="input-field text-xs w-full bg-white font-medium"
                >
                  {venues.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.type}) {v.capacity !== 'NA' && `[Cap: ${v.capacity}]`} {v.status === 'Maintenance' ? '⚠️ Maintenance' : ''}
                    </option>
                  ))}
                </select>
                {selectedVenue && (
                  <p className="text-[11px] text-gray-500 mt-1 pl-1">
                    {selectedVenue.location} • Division: <strong>{selectedVenue.type}</strong>
                  </p>
                )}
              </div>

              {/* Room number for classrooms / labs */}
              {isClassroomOrLab && (
                <div>
                  <div className="relative">
                    <DoorClosed className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Room number (e.g. Room 204, ME Lab)..."
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value)}
                      className="input-field text-xs pl-8 w-full bg-white font-medium"
                    />
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1 pl-1">
                    Specify specific room number within this academic division.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 2: DATE & TIMINGS */}
          <div className="space-y-3 p-4 rounded-2xl border border-gray-200 bg-gray-50/50">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-red-600" />
                <span>Date & Time Window</span>
              </label>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-1.5">
                {COMMON_TIME_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setStartTime(preset.start);
                      setEndTime(preset.end);
                    }}
                    className={`text-[10px] px-2 py-0.5 rounded-lg border font-medium transition-all ${
                      startTime === preset.start && endTime === preset.end
                        ? 'bg-red-600 text-white border-red-600 shadow-2xs'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {preset.label.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Event Date */}
              <div>
                <label className="text-[11px] font-semibold text-gray-700 block mb-1">
                  Event Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="input-field text-xs w-full bg-white font-medium font-mono"
                />
              </div>

              {/* Start Time */}
              <div>
                <label className="text-[11px] font-semibold text-gray-700 block mb-1">
                  Start Time
                </label>
                <select
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="input-field text-xs w-full bg-white font-medium font-mono"
                >
                  {timeSlots.map((time) => (
                    <option key={`start-${time}`} value={time}>
                      {time} ({formatTime12H(time)})
                    </option>
                  ))}
                </select>
              </div>

              {/* End Time */}
              <div>
                <label className="text-[11px] font-semibold text-gray-700 block mb-1">
                  End Time
                </label>
                <select
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="input-field text-xs w-full bg-white font-medium font-mono"
                >
                  {timeSlots.map((time) => (
                    <option key={`end-${time}`} value={time}>
                      {time} ({formatTime12H(time)})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 3: EVENT DETAILS */}
          <div className="space-y-3 p-4 rounded-2xl border border-gray-200 bg-gray-50/50">
            <label className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-red-600" />
              <span>Event Information & Agenda</span>
            </label>

            <div>
              <label className="text-[11px] font-semibold text-gray-700 block mb-1">
                Event Title *
              </label>
              <input
                type="text"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder="e.g. IEEE TechSprint Workshop 2026..."
                className="input-field text-xs w-full bg-white font-semibold"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-gray-700 block mb-1">
                Event Description & Syllabus
              </label>
              <textarea
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide event overview, guest speakers, audience requirements..."
                className="input-field text-xs w-full bg-white resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[11px] font-semibold text-gray-700 block mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="input-field text-xs w-full bg-white font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-700 block mb-1">
                  Organizing Body (Locked)
                </label>
                <input
                  type="text"
                  value={booking.organizer}
                  disabled
                  className="input-field text-xs w-full bg-gray-100 text-gray-500 cursor-not-allowed font-medium"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: MULTI-VENUE PACKAGE SYNCHRONIZATION (If applicable) */}
          {sisterBookings.length > 0 && (
            <div className="p-3.5 rounded-2xl border border-purple-200 bg-purple-50/60 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-purple-900">
                <Layers className="w-4 h-4 text-purple-700 shrink-0" />
                <span>Multi-Venue Event Package ({sisterBookings.length + 1} Venues)</span>
              </div>
              <p className="text-purple-800 text-[11px]">
                This booking is linked with <strong>{sisterBookings.length}</strong> other venue permits under package ID <strong className="font-mono">{booking.eventId}</strong>.
              </p>
              <label className="flex items-center gap-2 text-purple-950 font-semibold cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={updateWholePackage}
                  onChange={(e) => setUpdateWholePackage(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <span>Also sync updated Title &amp; Description across all venues in this package</span>
              </label>
            </div>
          )}

          {/* SECTION 5: CHANGES DIFF PREVIEW */}
          {hasModifications && (
            <div className="p-3.5 rounded-2xl border border-gray-200 bg-white space-y-2 text-xs shadow-xs animate-fade-in">
              <div className="flex items-center gap-1.5 font-bold text-gray-900">
                <Sparkles className="w-3.5 h-3.5 text-red-600" />
                <span>Preview of Changes to be Logged ({changesList.length}):</span>
              </div>
              <div className="space-y-1.5 pt-1">
                {changesList.map((ch, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[11px] bg-gray-50 px-2.5 py-1.5 rounded-xl border border-gray-200">
                    <span className="font-bold text-gray-700">{ch.label}:</span>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-red-700 line-through opacity-75">{ch.oldValue}</span>
                      <ArrowRight className="w-3 h-3 text-gray-400" />
                      <span className="text-emerald-700 font-bold">{ch.newValue}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Form Error Message */}
          {errorMessage && (
            <div className="text-xs font-bold text-red-600 bg-red-50 p-3 rounded-xl border border-red-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

        </form>

        {/* Sticky Footer Actions */}
        <div className="p-4 border-t border-gray-200 bg-white flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary text-xs py-2 px-4 font-semibold"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            {!hasModifications && (
              <span className="text-[11px] text-gray-500 italic hidden sm:inline">
                No changes made yet
              </span>
            )}
            <button
              type="button"
              disabled={isSubmitting || conflictResult.hasConflict || !hasModifications}
              onClick={handleSubmit}
              className={`btn-primary text-xs py-2.5 px-6 font-bold flex items-center gap-2 ${
                conflictResult.hasConflict || !hasModifications ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving Updates...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
