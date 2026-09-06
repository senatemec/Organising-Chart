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
  
  // Organizing Body Combobox State (starts completely blank)
  const [organizer, setOrganizer] = useState('');
  const [organizerSearch, setOrganizerSearch] = useState('');
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
      organizer: organizer.trim() || organizerSearch.trim() || 'College Student Body',
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
      <div className="glass-panel w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl border border-gray-200 p-6 sm:p-8 relative bg-white shadow-2xl">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-gray-100 text-gray-500 hover:text-gray-900 hover:bg-gray-200 flex items-center justify-center transition-colors border border-gray-200 z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Wizard Header Progress Bar */}
        {step <= 3 && (
          <div className="mb-6 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-gray-500">
              <span className={step >= 1 ? 'font-bold' : ''} style={{color: step >= 1 ? '#B91C1C' : '#9CA3AF'}}>1. Venue & Slot</span>
              <span className={step >= 2 ? 'font-bold' : ''} style={{color: step >= 2 ? '#B91C1C' : '#9CA3AF'}}>2. Event Info</span>
              <span className={step >= 3 ? 'font-bold' : ''} style={{color: step >= 3 ? '#B91C1C' : '#9CA3AF'}}>3. Confirm</span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden border border-gray-200">
              <div 
                className="h-full transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%`, backgroundColor: '#B91C1C' }}
              />
            </div>
          </div>
        )}

        {/* STEP 1: Venue & Time Selection */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <span className="badge mb-1 font-bold text-[11px]" style={{background:'#FEE2E2', color:'#B91C1C', borderColor:'#FCA5A5'}}>
                Step 1 of 3 • Selection
              </span>
              <h2 className="text-xl font-bold" style={{color:'#000000'}}>Select Venue & Time Slot</h2>
            </div>

            {/* Venue Dropdown */}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{color:'#374151'}}>
                Target Campus Venue *
              </label>
              <div className="relative">
                <select
                  value={venueId}
                  onChange={(e) => setVenueId(e.target.value)}
                  className="input-field pr-10 text-xs font-semibold appearance-none bg-white cursor-pointer"
                  style={{color:'#111827'}}
                >
                  {venues.map((v) => (
                    <option key={v.id} value={v.id} disabled={v.status === 'Maintenance'}>
                      {v.name} ({v.type}{v.capacity && v.capacity !== 'NA' ? ` - Max ${v.capacity} seats` : ''}) {v.status === 'Maintenance' ? '[MAINTENANCE]' : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Extra Room Number Field for Classrooms */}
            {isClassroom && (
              <div className="p-4 rounded-xl space-y-2 animate-fade-in border" style={{background:'#FFF5F5', borderColor:'#FCA5A5'}}>
                <div className="flex items-center gap-2 text-xs font-bold" style={{color:'#B91C1C'}}>
                  <DoorClosed className="w-4 h-4" style={{color:'#DC2626'}} />
                  <span>Specify Classroom Room Number / Code *</span>
                </div>
                <input
                  type="text"
                  placeholder="e.g. Room 204 (CS Block), Room 101, LH-302..."
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  className="input-field text-xs font-medium"
                  style={{color:'#111827'}}
                  required
                />
              </div>
            )}

            {/* Date & Time Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{color:'#374151'}}>
                  Event Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="input-field font-mono text-xs"
                  style={{color:'#111827'}}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{color:'#374151'}}>
                  Start Time
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="input-field font-mono text-xs"
                  style={{color:'#111827'}}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{color:'#374151'}}>
                  End Time
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="input-field font-mono text-xs"
                  style={{color:'#111827'}}
                />
              </div>
            </div>

            {/* Conflict Warning Banner */}
            {conflictInfo.hasConflict ? (
              <div className="border p-4 rounded-xl flex items-start gap-3 text-xs shadow-xs" style={{background:'#FFF5F5', borderColor:'#FCA5A5', color:'#7F1D1D'}}>
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" style={{color:'#DC2626'}} />
                <div>
                  <div className="font-bold mb-0.5" style={{color:'#991B1B'}}>Time Slot Conflict Detected!</div>
                  <p className="leading-relaxed">
                    <strong>{selectedVenue?.name} {conflictInfo.conflictingBooking?.roomNumber && `(${conflictInfo.conflictingBooking.roomNumber})`}</strong> is already booked by{' '}
                    <span className="underline font-semibold">{conflictInfo.conflictingBooking?.organizer}</span> for{' '}
                    <em>"{conflictInfo.conflictingBooking?.eventTitle}"</em> ({formatTime12H(conflictInfo.conflictingBooking?.startTime)} - {formatTime12H(conflictInfo.conflictingBooking?.endTime)}).
                  </p>
                </div>
              </div>
            ) : (
              <div className="border p-3 rounded-xl flex items-center gap-2 text-xs font-medium" style={{background:'#F0FDF4', borderColor:'#86EFAC', color:'#166534'}}>
                <CheckCircle2 className="w-4 h-4 shrink-0" style={{color:'#16A34A'}} />
                <span>Slot is available for booking!</span>
              </div>
            )}

            {/* Step 1 Actions */}
            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button
                onClick={() => setStep(2)}
                disabled={conflictInfo.hasConflict || !startTime || !endTime || (isClassroom && !roomNumber.trim())}
                className="btn-primary"
              >
                <span>Continue to Event Info</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Event Details (Streamlined: Title, Organizing Body & Notes) */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <span className="badge mb-1 font-bold text-[11px]" style={{background:'#FEE2E2', color:'#B91C1C', borderColor:'#FCA5A5'}}>
                Step 2 of 3 • Event Details
              </span>
              <h2 className="text-xl font-bold" style={{color:'#000000'}}>Event & Organizing Body</h2>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{color:'#374151'}}>
                Event Title *
              </label>
              <input
                type="text"
                placeholder="Enter event name or title..."
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                className="input-field text-xs font-medium"
                style={{color:'#111827'}}
                required
                autoFocus
              />
            </div>

            {/* Searchable Organizing Body Dropdown Combobox */}
            <div className="space-y-1.5 relative" ref={orgDropdownRef}>
              <label className="block text-xs font-semibold" style={{color:'#374151'}}>
                Organizing Body *
              </label>
              
              {/* Typeahead Search Input */}
              <div className="relative w-full" style={{ position: 'relative' }}>
                <Search 
                  className="w-3.5 h-3.5 pointer-events-none" 
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', zIndex: 1 }} 
                />
                <input
                  type="text"
                  placeholder="Search or select organizing body (e.g. Union, Principal, IEDC, EMF)..."
                  value={organizerSearch}
                  onFocus={() => setIsOrgDropdownOpen(true)}
                  onChange={(e) => {
                    setOrganizerSearch(e.target.value);
                    setOrganizer(e.target.value);
                    setIsOrgDropdownOpen(true);
                  }}
                  className="input-field text-xs font-semibold cursor-pointer"
                  style={{ 
                    width: '100%',
                    paddingLeft: '2.5rem', 
                    paddingRight: '4.5rem', 
                    color: '#111827' 
                  }}
                  required
                />

                {/* Right Action: Clear / Chevron Toggle */}
                <div 
                  className="flex items-center gap-1 bg-white"
                  style={{ 
                    position: 'absolute', 
                    right: '10px', 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    zIndex: 2
                  }}
                >
                  {organizerSearch && (
                    <button
                      type="button"
                      onClick={() => {
                        setOrganizerSearch('');
                        setOrganizer('');
                        setIsOrgDropdownOpen(true);
                      }}
                      className="p-1 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
                      title="Clear text"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsOrgDropdownOpen(!isOrgDropdownOpen)}
                    className="p-1 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
                    title="Toggle dropdown options"
                  >
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOrgDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Floating Dropdown Options Menu */}
              {isOrgDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 max-h-52 overflow-y-auto divide-y divide-gray-100 animate-fade-in">
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
                              ? 'bg-red-700 text-white font-bold'
                              : 'text-gray-800 hover:bg-red-50 hover:text-red-700 font-medium'
                          }`}
                        >
                          <span>{soc}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                        </button>
                      );
                    })
                  ) : (
                    <div className="p-3 text-center text-xs italic text-gray-500">
                      No matching organizing body found.
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{color:'#374151'}}>
                Event Notes (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Briefly state any specific agenda or special requirements..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-field text-xs"
                style={{color:'#111827'}}
              />
            </div>

            {/* Step 2 Actions */}
            <div className="flex justify-between pt-4 border-t border-gray-100">
              <button onClick={() => setStep(1)} className="btn-secondary">
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!eventTitle.trim() || !organizer}
                className="btn-primary"
              >
                <span>Review & Confirm</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Review & Final Confirmation */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <span className="badge mb-1 font-bold text-[11px]" style={{background:'#FEE2E2', color:'#B91C1C', borderColor:'#FCA5A5'}}>
                Step 3 of 3 • Review
              </span>
              <h2 className="text-xl font-bold" style={{color:'#000000'}}>Confirm Venue Booking</h2>
            </div>

            <div className="p-5 rounded-2xl border border-gray-200 space-y-3 text-xs shadow-xs" style={{background:'#F9FAFB'}}>
              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <span style={{color:'#6B7280'}}>Target Venue:</span>
                <span className="font-bold" style={{color:'#000000'}}>
                  {selectedVenue?.name} {isClassroom && roomNumber && `• ${roomNumber}`}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <span style={{color:'#6B7280'}}>Event Title:</span>
                <span className="font-bold" style={{color:'#B91C1C'}}>{eventTitle}</span>
              </div>
              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <span style={{color:'#6B7280'}}>Organized By:</span>
                <span className="font-semibold" style={{color:'#000000'}}>{organizer}</span>
              </div>
              <div className="flex items-center justify-between">
                <span style={{color:'#6B7280'}}>Schedule:</span>
                <span className="font-mono font-bold" style={{color:'#111827'}}>
                  {formatDateFriendly(date)} ({formatTime12H(startTime)} - {formatTime12H(endTime)})
                </span>
              </div>
            </div>

            <div className="border p-3.5 rounded-xl flex items-start gap-2.5 text-xs" style={{background:'#F0FDF4', borderColor:'#86EFAC', color:'#166534'}}>
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" style={{color:'#16A34A'}} />
              <span>
                Your booking will be confirmed immediately. Union Senate admin has the authority to cancel if needed with a reason note.
              </span>
            </div>

            {/* Step 3 Actions */}
            <div className="flex justify-between pt-4 border-t border-gray-100">
              <button onClick={() => setStep(2)} className="btn-secondary">
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </button>
              <button onClick={handleFinalSubmit} className="btn-primary py-2.5 px-6">
                <Check className="w-4 h-4 mr-1" /> Confirm Booking
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Success Screen */}
        {step === 4 && submittedBooking && (
          <div className="text-center py-6 space-y-5 animate-fade-in">
            <div className="w-16 h-16 rounded-full border-2 text-emerald-600 mx-auto flex items-center justify-center shadow-md"
              style={{background:'#D1FAE5', borderColor:'#10B981'}}>
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold" style={{color:'#000000'}}>Booking Confirmed!</h2>
              <p className="text-xs mt-1" style={{color:'#6B7280'}}>
                Booking ID: <span className="font-mono font-bold" style={{color:'#B91C1C'}}>{submittedBooking.id}</span>
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-gray-200 text-xs max-w-md mx-auto text-left space-y-2 bg-gray-50 shadow-xs">
              <div className="font-bold text-sm" style={{color:'#000000'}}>{submittedBooking.eventTitle}</div>
              <div className="font-semibold" style={{color:'#B91C1C'}}>{submittedBooking.organizer}</div>
              <div style={{color:'#374151'}}>
                {submittedBooking.venueName} {submittedBooking.roomNumber && `• ${submittedBooking.roomNumber}`}
              </div>
              <div className="font-mono font-medium" style={{color:'#4B5563'}}>
                {formatDateFriendly(submittedBooking.date)} • {formatTime12H(submittedBooking.startTime)} - {formatTime12H(submittedBooking.endTime)}
              </div>
              <div className="pt-1">
                <span className="badge badge-available">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Confirmed
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
