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
      createdAt: new Date().toISOString()
    };

    onSubmitBooking(newBooking);
    setSubmittedBooking(newBooking);
    setStep(4); // Success step
  };

  return (
    <div className="modal-overlay animate-fade-in" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="glass-panel w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl border border-slate-200 p-6 sm:p-8 relative bg-white shadow-2xl text-slate-900">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors border border-slate-200 z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Wizard Header Progress Bar */}
        {step <= 3 && (
          <div className="mb-6 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span className={step >= 1 ? 'text-slate-900' : ''}>1. Venue & Slot</span>
              <span className={step >= 2 ? 'text-slate-900' : ''}>2. Event Info</span>
              <span className={step >= 3 ? 'text-slate-900' : ''}>3. Confirm</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
              <div 
                className="bg-slate-900 h-full transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* STEP 1: Venue & Time Selection */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <span className="badge bg-blue-50 text-blue-700 border border-blue-200 mb-1">
                Step 1 of 3 • Selection
              </span>
              <h2 className="text-xl font-bold text-slate-900">Select Venue & Time Slot</h2>
            </div>

            {/* Venue Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Target Campus Venue *
              </label>
              <select
                value={venueId}
                onChange={(e) => setVenueId(e.target.value)}
                className="input-field bg-white border-slate-300"
              >
                {venues.map((v) => (
                  <option key={v.id} value={v.id} disabled={v.status === 'Maintenance'}>
                    {v.name} ({v.type} - Max {v.capacity} seats) {v.status === 'Maintenance' ? '[MAINTENANCE]' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Extra Room Number Field for Classrooms */}
            {isClassroom && (
              <div className="bg-blue-50/60 border border-blue-200 p-4 rounded-xl space-y-2 animate-fade-in">
                <div className="flex items-center gap-2 text-blue-800 text-xs font-bold">
                  <DoorClosed className="w-4 h-4 text-blue-600" />
                  <span>Specify Classroom Room Number / Code *</span>
                </div>
                <input
                  type="text"
                  placeholder="e.g. Room 204 (CS Block), Room 101, LH-302..."
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  className="input-field bg-white border-blue-300 text-xs font-medium"
                  required
                />
              </div>
            )}

            {/* Date & Time Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Event Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="input-field font-mono bg-white border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Start Time
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="input-field font-mono bg-white border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  End Time
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="input-field font-mono bg-white border-slate-300"
                />
              </div>
            </div>

            {/* Conflict Warning Banner */}
            {conflictInfo.hasConflict ? (
              <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex items-start gap-3 text-xs text-rose-800 shadow-xs">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-rose-900 mb-0.5">Time Slot Conflict Detected!</div>
                  <p>
                    <strong>{selectedVenue?.name} {conflictInfo.conflictingBooking?.roomNumber && `(${conflictInfo.conflictingBooking.roomNumber})`}</strong> is already booked by{' '}
                    <span className="underline font-semibold">{conflictInfo.conflictingBooking?.organizer}</span> for{' '}
                    <em>"{conflictInfo.conflictingBooking?.eventTitle}"</em> ({formatTime12H(conflictInfo.conflictingBooking?.startTime)} - {formatTime12H(conflictInfo.conflictingBooking?.endTime)}).
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center gap-2 text-xs text-emerald-800 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Slot is available for booking!</span>
              </div>
            )}

            {/* Step 1 Actions */}
            <div className="flex justify-end pt-4 border-t border-slate-200">
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
              <span className="badge bg-blue-50 text-blue-700 border border-blue-200 mb-1">
                Step 2 of 3 • Event Details
              </span>
              <h2 className="text-xl font-bold text-slate-900">Event & Organizing Body</h2>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Event Title *
              </label>
              <input
                type="text"
                placeholder="e.g. Annual Technical Quiz & Coding Sprint"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                className="input-field bg-white border-slate-300"
                required
                autoFocus
              />
            </div>

            {/* Searchable Organizing Body Dropdown Combobox */}
            <div className="space-y-1.5 relative" ref={orgDropdownRef}>
              <label className="block text-xs font-semibold text-slate-700">
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
                  className="input-field pl-9 pr-16 text-xs font-semibold text-slate-900 bg-white border-slate-300 cursor-pointer"
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
                      className="p-1 text-slate-400 hover:text-slate-700 rounded"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsOrgDropdownOpen(!isOrgDropdownOpen)}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded"
                  >
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOrgDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Floating Dropdown Options Menu */}
              {isOrgDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-300 rounded-2xl shadow-xl z-50 max-h-52 overflow-y-auto divide-y divide-slate-100 animate-fade-in">
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
                              ? 'bg-slate-900 text-white font-bold' 
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span>{soc}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                        </button>
                      );
                    })
                  ) : (
                    <div className="p-3 text-center text-xs text-slate-500 italic">
                      No matching organizing body found.
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Event Notes (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Briefly state any specific agenda or special requirements..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-field text-xs bg-white border-slate-300"
              />
            </div>

            {/* Step 2 Actions */}
            <div className="flex justify-between pt-4 border-t border-slate-200">
              <button onClick={() => setStep(1)} className="btn-secondary border-slate-300">
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
              <span className="badge bg-blue-50 text-blue-700 border border-blue-200 mb-1">
                Step 3 of 3 • Review
              </span>
              <h2 className="text-xl font-bold text-slate-900">Confirm Venue Booking</h2>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-slate-200 space-y-3 bg-slate-50 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Target Venue:</span>
                <span className="font-bold text-slate-900">
                  {selectedVenue?.name} {isClassroom && roomNumber && `• ${roomNumber}`}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Event Title:</span>
                <span className="font-bold text-blue-700">{eventTitle}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Organized By:</span>
                <span className="font-semibold text-slate-900">{organizer}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Schedule:</span>
                <span className="font-mono text-slate-900 font-semibold">
                  {formatDateFriendly(date)} ({formatTime12H(startTime)} - {formatTime12H(endTime)})
                </span>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl flex items-start gap-2.5 text-xs text-emerald-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                Your booking will be confirmed immediately. Union Senate admin has the authority to cancel if needed with a reason note.
              </span>
            </div>

            {/* Step 3 Actions */}
            <div className="flex justify-between pt-4 border-t border-slate-200">
              <button onClick={() => setStep(2)} className="btn-secondary border-slate-300">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button onClick={handleFinalSubmit} className="btn-primary py-2.5 px-6 shadow-xs">
                <Check className="w-4 h-4 text-emerald-300" /> Confirm Booking
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Success Screen */}
        {step === 4 && submittedBooking && (
          <div className="text-center py-6 space-y-5 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-500 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">Booking Confirmed!</h2>
              <p className="text-xs text-slate-500 mt-1">
                Booking ID: <span className="font-mono text-blue-700 font-bold">{submittedBooking.id}</span>
              </p>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-slate-200 text-xs max-w-md mx-auto text-left space-y-2 bg-slate-50">
              <div className="font-bold text-slate-900 text-sm">{submittedBooking.eventTitle}</div>
              <div className="text-blue-700 font-semibold">{submittedBooking.organizer}</div>
              <div className="text-slate-700">
                {submittedBooking.venueName} {submittedBooking.roomNumber && `• ${submittedBooking.roomNumber}`}
              </div>
              <div className="text-slate-900 font-mono">
                {formatDateFriendly(submittedBooking.date)} • {formatTime12H(submittedBooking.startTime)} - {formatTime12H(submittedBooking.endTime)}
              </div>
              <div className="pt-1">
                <span className="badge badge-available">
                  <CheckCircle2 className="w-3 h-3" /> Confirmed
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button onClick={onClose} className="btn-primary py-2 px-6 shadow-xs">
                Done & Return to Venues
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
