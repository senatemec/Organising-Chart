import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Sparkles, 
  Calendar, 
  Clock, 
  Building2, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  ChevronDown,
  Search,
  Users, 
  ShieldCheck, 
  DoorClosed, 
  Check 
} from 'lucide-react';
import { checkBookingConflict, formatTime12H, formatDateFriendly } from '../utils/availabilityUtils';
import { studentSocieties } from '../data/mockData';

export default function BookingModal({ 
  venues, 
  existingBookings, 
  onClose, 
  onSubmitBooking,
  initialVenue = null,
  initialDate = '2026-09-05',
  initialTime = '10:00',
  initialEmail = '',
  initialOrganizer = ''
}) {
  const [step, setStep] = useState(1);
  const [submittedBooking, setSubmittedBooking] = useState(null);

  // Form State
  const [venueId, setVenueId] = useState(initialVenue ? initialVenue.id : (venues[0]?.id || ''));
  const [roomNumber, setRoomNumber] = useState('');
  const [date, setDate] = useState(initialDate);
  const [startTime, setStartTime] = useState(initialTime);
  const [endTime, setEndTime] = useState('13:00');
  const [eventTitle, setEventTitle] = useState('');
  
  // Organizing Body Combobox State
  const defaultOrg = studentSocieties.includes(initialOrganizer) ? initialOrganizer : studentSocieties[0];
  const [organizer, setOrganizer] = useState(defaultOrg);
  const [organizerSearch, setOrganizerSearch] = useState(defaultOrg);
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);
  const orgDropdownRef = useRef(null);

  const [description, setDescription] = useState('');

  const selectedVenue = venues.find(v => v.id === venueId);
  const isClassroom = selectedVenue?.requiresRoomNumber || venueId === 'classrooms';

  // Conflict Check State
  const [conflictInfo, setConflictInfo] = useState({ hasConflict: false, conflictingBooking: null });

  useEffect(() => {
    if (venueId && date && startTime && endTime) {
      const conflict = checkBookingConflict(
        { venueId, roomNumber, date, startTime, endTime, id: 'temp' },
        existingBookings
      );
      setConflictInfo(conflict);
    }
  }, [venueId, roomNumber, date, startTime, endTime, existingBookings]);

  // Click outside to close the organizing body dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (orgDropdownRef.current && !orgDropdownRef.current.contains(e.target)) {
        setIsOrgDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered list of organizing bodies based on user typing
  const filteredSocieties = studentSocieties.filter((soc) =>
    soc.toLowerCase().includes(organizerSearch.toLowerCase())
  );

  const handleSelectSociety = (soc) => {
    setOrganizer(soc);
    setOrganizerSearch(soc);
    setIsOrgDropdownOpen(false);
  };

  const handleFinalSubmit = (e) => {
    e.preventDefault();
    if (conflictInfo.hasConflict) return;
    if (isClassroom && !roomNumber.trim()) return;

    const newBooking = {
      id: `BK-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      venueId,
      venueName: selectedVenue ? selectedVenue.name : '',
      roomNumber: isClassroom ? roomNumber.trim() : null,
      eventTitle: eventTitle.trim(),
      organizer: organizer || studentSocieties[0],
      date,
      startTime,
      endTime,
      status: 'confirmed',
      approvedBy: 'Auto-Confirmed',
      description: description.trim(),
      contactEmail: initialEmail || '',
      createdAt: new Date().toISOString().split('T')[0]
    };

    onSubmitBooking(newBooking);
    setSubmittedBooking(newBooking);
    setStep(4); // Success step
  };

  return (
    <div className="modal-overlay animate-fade-in" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="glass-panel w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl border border-white/20 p-6 sm:p-8 relative bg-slate-950 shadow-2xl">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-900/90 text-slate-400 hover:text-white flex items-center justify-center transition-colors border border-white/10 z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Wizard Header Progress Bar */}
        {step <= 3 && (
          <div className="mb-6 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span className={step >= 1 ? 'text-indigo-400' : ''}>1. Venue & Slot</span>
              <span className={step >= 2 ? 'text-indigo-400' : ''}>2. Event Info</span>
              <span className={step >= 3 ? 'text-indigo-400' : ''}>3. Confirm</span>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-white/5">
              <div 
                className="bg-gradient-to-r from-indigo-500 via-cyan-400 to-indigo-400 h-full transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* STEP 1: Venue & Time Selection */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <span className="badge bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-1">
                Step 1 of 3 • Selection
              </span>
              <h2 className="text-xl font-bold text-white">Select Venue & Time Slot</h2>
            </div>

            {/* Venue Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Target Campus Venue *
              </label>
              <select
                value={venueId}
                onChange={(e) => setVenueId(e.target.value)}
                className="input-field"
              >
                {venues.map((v) => (
                  <option key={v.id} value={v.id} disabled={v.status === 'Maintenance'} className="bg-slate-900 text-white">
                    {v.name} ({v.type} - Max {v.capacity} seats) {v.status === 'Maintenance' ? '[MAINTENANCE]' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Extra Room Number Field for Classrooms */}
            {isClassroom && (
              <div className="bg-indigo-500/10 border border-indigo-500/30 p-4 rounded-xl space-y-2 animate-fade-in">
                <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold">
                  <DoorClosed className="w-4 h-4 text-cyan-400" />
                  <span>Specify Classroom Room Number / Code *</span>
                </div>
                <input
                  type="text"
                  placeholder="e.g. Room 204 (CS Block), Room 101, LH-302..."
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  className="input-field bg-slate-900 border-indigo-500/40 text-xs font-medium"
                  required
                />
              </div>
            )}

            {/* Date & Time Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Event Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="input-field font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Start Time
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="input-field font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  End Time
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="input-field font-mono"
                />
              </div>
            </div>

            {/* Conflict Warning Banner */}
            {conflictInfo.hasConflict ? (
              <div className="bg-rose-500/15 border border-rose-500/40 p-4 rounded-xl flex items-start gap-3 text-xs text-rose-200 shadow-md">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-rose-300 mb-0.5">Time Slot Conflict Detected!</div>
                  <p>
                    <strong>{selectedVenue?.name} {conflictInfo.conflictingBooking?.roomNumber && `(${conflictInfo.conflictingBooking.roomNumber})`}</strong> is already booked by{' '}
                    <span className="underline font-semibold">{conflictInfo.conflictingBooking?.organizer}</span> for{' '}
                    <em>"{conflictInfo.conflictingBooking?.eventTitle}"</em> ({formatTime12H(conflictInfo.conflictingBooking?.startTime)} - {formatTime12H(conflictInfo.conflictingBooking?.endTime)}).
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-500/15 border border-emerald-500/40 p-3 rounded-xl flex items-center gap-2 text-xs text-emerald-300 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Slot is available for booking!</span>
              </div>
            )}

            {/* Step 1 Actions */}
            <div className="flex justify-end pt-4 border-t border-white/10">
              <button
                onClick={() => setStep(2)}
                disabled={conflictInfo.hasConflict || !startTime || !endTime || (isClassroom && !roomNumber.trim())}
                className="btn-primary"
              >
                Continue to Event Info <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Event Details (Streamlined: Title, Organizing Body & Notes) */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <span className="badge bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-1">
                Step 2 of 3 • Event Details
              </span>
              <h2 className="text-xl font-bold text-white">Event & Organizing Body</h2>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Event Title *
              </label>
              <input
                type="text"
                placeholder="e.g. Annual Technical Quiz & Coding Sprint"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                className="input-field"
                required
                autoFocus
              />
            </div>

            {/* Searchable Organizing Body Dropdown Combobox */}
            <div className="space-y-1.5 relative" ref={orgDropdownRef}>
              <label className="block text-xs font-semibold text-slate-300">
                Organizing Body / Society *
              </label>
              
              {/* Typeahead Search Input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Start typing to search organizing body (e.g. EMF, FOSS, IEDC, NSS)..."
                  value={organizerSearch}
                  onFocus={() => setIsOrgDropdownOpen(true)}
                  onChange={(e) => {
                    setOrganizerSearch(e.target.value);
                    setIsOrgDropdownOpen(true);
                  }}
                  className="input-field pl-9 pr-16 text-xs font-semibold text-white cursor-pointer"
                  required
                />

                {/* Right Action: Clear / Chevron Toggle */}
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {organizerSearch && (
                    <button
                      type="button"
                      onClick={() => {
                        setOrganizerSearch('');
                        setOrganizer('');
                        setIsOrgDropdownOpen(true);
                      }}
                      className="p-1 text-slate-400 hover:text-white rounded"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsOrgDropdownOpen(!isOrgDropdownOpen)}
                    className="p-1 text-slate-400 hover:text-white rounded"
                  >
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOrgDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Floating Dropdown Options Menu */}
              {isOrgDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-slate-900 border border-indigo-500/40 rounded-2xl shadow-2xl z-50 max-h-52 overflow-y-auto divide-y divide-white/5 animate-fade-in backdrop-blur-xl">
                  {filteredSocieties.length > 0 ? (
                    filteredSocieties.map((soc) => {
                      const isSelected = organizer === soc;
                      return (
                        <button
                          key={soc}
                          type="button"
                          onClick={() => handleSelectSociety(soc)}
                          className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between transition-colors ${
                            isSelected 
                              ? 'bg-indigo-600 text-white font-bold' 
                              : 'text-slate-300 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <span>{soc}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-cyan-300 shrink-0" />}
                        </button>
                      );
                    })
                  ) : (
                    <div className="p-3 text-center text-xs text-slate-400 italic">
                      No matching organizing body found.
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Event Notes (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Briefly state any specific agenda or special requirements..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-field text-xs"
              />
            </div>

            {/* Step 2 Actions */}
            <div className="flex justify-between pt-4 border-t border-white/10">
              <button onClick={() => setStep(1)} className="btn-secondary">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!eventTitle.trim() || !organizer}
                className="btn-primary"
              >
                Review & Confirm <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Review & Final Confirmation */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <span className="badge bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-1">
                Step 3 of 3 • Review
              </span>
              <h2 className="text-xl font-bold text-white">Confirm Venue Booking</h2>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3 bg-slate-900/90 text-xs">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">Target Venue:</span>
                <span className="font-bold text-white">
                  {selectedVenue?.name} {isClassroom && roomNumber && `• ${roomNumber}`}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">Event Title:</span>
                <span className="font-bold text-indigo-300">{eventTitle}</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">Organized By:</span>
                <span className="font-semibold text-white">{organizer}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Schedule:</span>
                <span className="font-mono text-cyan-300 font-semibold">
                  {formatDateFriendly(date)} ({formatTime12H(startTime)} - {formatTime12H(endTime)})
                </span>
              </div>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/30 p-3.5 rounded-xl flex items-start gap-2.5 text-xs text-emerald-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                Your booking will be confirmed immediately. Union Senate admin has the authority to cancel if needed with a reason note.
              </span>
            </div>

            {/* Step 3 Actions */}
            <div className="flex justify-between pt-4 border-t border-white/10">
              <button onClick={() => setStep(2)} className="btn-secondary">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button onClick={handleFinalSubmit} className="btn-primary py-2.5 px-6 shadow-lg shadow-indigo-500/40">
                <Check className="w-4 h-4 text-emerald-300" /> Confirm Booking
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Success Screen */}
        {step === 4 && submittedBooking && (
          <div className="text-center py-6 space-y-5 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-white">Booking Confirmed!</h2>
              <p className="text-xs text-slate-400 mt-1">
                Booking ID: <span className="font-mono text-cyan-300 font-bold">{submittedBooking.id}</span>
              </p>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-white/10 text-xs max-w-md mx-auto text-left space-y-2 bg-slate-900">
              <div className="font-bold text-white text-sm">{submittedBooking.eventTitle}</div>
              <div className="text-indigo-300 font-semibold">{submittedBooking.organizer}</div>
              <div className="text-slate-300">
                {submittedBooking.venueName} {submittedBooking.roomNumber && `• ${submittedBooking.roomNumber}`}
              </div>
              <div className="text-cyan-300 font-mono">
                {formatDateFriendly(submittedBooking.date)} • {formatTime12H(submittedBooking.startTime)} - {formatTime12H(submittedBooking.endTime)}
              </div>
              <div className="pt-1">
                <span className="badge badge-available">
                  <CheckCircle2 className="w-3 h-3" /> Confirmed
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button onClick={onClose} className="btn-primary py-2 px-6">
                Done & Return to Venues
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
