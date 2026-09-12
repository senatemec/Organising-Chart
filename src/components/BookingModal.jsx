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
  Check,
  Plus,
  Trash2,
  Layers,
  CalendarPlus,
  Info
} from 'lucide-react';
import { checkBookingConflict, formatTime12H, formatDateFriendly } from '../utils/availabilityUtils';
import { studentSocieties } from '../data/mockData';

export default function BookingModal({ 
  venues, 
  existingBookings, 
  onClose, 
  onSubmitBooking,
  currentUser = null,
  allowedUsers = [],
  initialVenue = null,
  initialDate = '2026-09-05',
  initialTime = '10:00',
  initialEmail = '',
  initialOrganizer = '',
  initialMode = 'single'
}) {
  // Booking Mode: 'single' (1 venue) or 'event' (multiple venues/slots for 1 event)
  const [bookingMode, setBookingMode] = useState(initialMode);
  const [step, setStep] = useState(1);

  // Auto-resolve assigned organizing body from authorized Google account
  const assignedSociety = initialOrganizer || 
    currentUser?.society || 
    allowedUsers.find(u => (u.email || '').toLowerCase().trim() === (initialEmail || currentUser?.email || '').toLowerCase().trim())?.society || 
    (currentUser?.isUnionAdmin ? 'College Union Senate' : '');

  // Success State
  const [submittedSingleBooking, setSubmittedSingleBooking] = useState(null);
  const [submittedEventBookings, setSubmittedEventBookings] = useState([]);
  const [submittedEventId, setSubmittedEventId] = useState('');

  // Common Event Info State
  const [eventTitle, setEventTitle] = useState('');
  const [organizer, setOrganizer] = useState(assignedSociety || '');
  const [organizerSearch, setOrganizerSearch] = useState(assignedSociety || '');
  const [isCustomizingOrg, setIsCustomizingOrg] = useState(false);
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);
  const [description, setDescription] = useState('');
  const orgDropdownRef = useRef(null);

  useEffect(() => {
    if (assignedSociety && !organizer) {
      setOrganizer(assignedSociety);
      setOrganizerSearch(assignedSociety);
    }
  }, [assignedSociety]);

  // --- Single Venue Mode Form State ---
  const [singleVenueId, setSingleVenueId] = useState(initialVenue ? initialVenue.id : (venues[0]?.id || ''));
  const [singleRoomNumber, setSingleRoomNumber] = useState('');
  const [singleDate, setSingleDate] = useState(initialDate);
  const [singleStartTime, setSingleStartTime] = useState(initialTime);
  const [singleEndTime, setSingleEndTime] = useState('13:00');

  const selectedSingleVenue = venues.find(v => v.id === singleVenueId);
  const isSingleClassroom = selectedSingleVenue?.requiresRoomNumber || singleVenueId === 'classrooms';

  // Single Venue Conflict Check State
  const [singleConflictInfo, setSingleConflictInfo] = useState({ hasConflict: false, conflictingBooking: null });

  useEffect(() => {
    if (bookingMode === 'single' && singleVenueId && singleDate && singleStartTime && singleEndTime) {
      const conflict = checkBookingConflict(
        { venueId: singleVenueId, roomNumber: singleRoomNumber, date: singleDate, startTime: singleStartTime, endTime: singleEndTime, id: 'temp' },
        existingBookings
      );
      setSingleConflictInfo(conflict);
    }
  }, [bookingMode, singleVenueId, singleRoomNumber, singleDate, singleStartTime, singleEndTime, existingBookings]);

  // --- Multi-Venue Event Mode Form State ---
  const [venueSlots, setVenueSlots] = useState([
    {
      id: 'slot-1',
      venueId: initialVenue ? initialVenue.id : (venues[0]?.id || ''),
      roomNumber: '',
      date: initialDate || '2026-09-05',
      startTime: initialTime || '10:00',
      endTime: '13:00'
    }
  ]);

  // Add a new venue slot card
  const handleAddSlot = () => {
    const nextVenue = venues.find(v => !venueSlots.some(s => s.venueId === v.id) && v.status !== 'Maintenance') || venues[0];
    const lastSlot = venueSlots[venueSlots.length - 1];
    const newSlot = {
      id: `slot-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      venueId: nextVenue ? nextVenue.id : (venues[0]?.id || ''),
      roomNumber: '',
      date: lastSlot ? lastSlot.date : initialDate,
      startTime: '10:00',
      endTime: '13:00'
    };
    setVenueSlots([...venueSlots, newSlot]);
  };

  // Remove a venue slot card
  const handleRemoveSlot = (slotId) => {
    if (venueSlots.length <= 1) return;
    setVenueSlots(venueSlots.filter(s => s.id !== slotId));
  };

  // Update a field in a venue slot card
  const handleUpdateSlot = (slotId, field, value) => {
    setVenueSlots(venueSlots.map(slot => {
      if (slot.id === slotId) {
        return { ...slot, [field]: value };
      }
      return slot;
    }));
  };

  // Check conflicts for each slot in Multi-Venue mode
  const getSlotConflict = (slot) => {
    if (!slot.venueId || !slot.date || !slot.startTime || !slot.endTime) {
      return { hasConflict: false };
    }

    // 1. Check against existing bookings in database
    const dbConflict = checkBookingConflict(
      { venueId: slot.venueId, roomNumber: slot.roomNumber, date: slot.date, startTime: slot.startTime, endTime: slot.endTime, id: slot.id },
      existingBookings
    );
    if (dbConflict.hasConflict) {
      return {
        hasConflict: true,
        reason: `Collides with database booking "${dbConflict.conflictingBooking?.eventTitle}" (${formatTime12H(dbConflict.conflictingBooking?.startTime)} - ${formatTime12H(dbConflict.conflictingBooking?.endTime)})`
      };
    }

    // 2. Check against other slots inside the same event
    const internalOverlap = venueSlots.find(other => {
      if (other.id === slot.id) return false;
      if (other.venueId !== slot.venueId) return false;
      if (other.date !== slot.date) return false;
      
      const isClassroomSlot = venues.find(v => v.id === slot.venueId)?.requiresRoomNumber || slot.venueId === 'classrooms';
      if (isClassroomSlot && (slot.roomNumber || '').trim().toLowerCase() !== (other.roomNumber || '').trim().toLowerCase()) {
        return false;
      }

      // Check time overlap: startA < endB && endA > startB
      return slot.startTime < other.endTime && slot.endTime > other.startTime;
    });

    if (internalOverlap) {
      return {
        hasConflict: true,
        reason: `Overlaps with another venue slot in this same event (${formatTime12H(internalOverlap.startTime)} - ${formatTime12H(internalOverlap.endTime)})`
      };
    }

    return { hasConflict: false };
  };

  // Are any multi-venue slots conflicting or invalid?
  const hasAnyMultiSlotConflict = venueSlots.some(s => getSlotConflict(s).hasConflict);
  const hasAnyMissingClassroomRoom = venueSlots.some(s => {
    const v = venues.find(item => item.id === s.venueId);
    const isClass = v?.requiresRoomNumber || s.venueId === 'classrooms';
    return isClass && !s.roomNumber.trim();
  });
  const hasAnyInvalidTimes = venueSlots.some(s => !s.startTime || !s.endTime || s.startTime >= s.endTime);

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

  // Final Submit Handler for Single Mode
  const handleSingleSubmit = (e) => {
    e.preventDefault();
    if (singleConflictInfo.hasConflict) return;
    if (isSingleClassroom && !singleRoomNumber.trim()) return;

    const userEmailResolved = (initialEmail || currentUser?.email || '').trim().toLowerCase();

    const newBooking = {
      id: `BK-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      eventId: null,
      venueId: singleVenueId,
      venueName: selectedSingleVenue ? selectedSingleVenue.name : singleVenueId,
      roomNumber: isSingleClassroom ? (singleRoomNumber || '').trim() : null,
      eventTitle: (eventTitle || '').trim(),
      organizer: (organizer || organizerSearch || 'College Student Body').trim(),
      date: singleDate,
      startTime: singleStartTime,
      endTime: singleEndTime,
      status: 'confirmed',
      approvedBy: 'Auto-Confirmed',
      description: (description || '').trim(),
      contactEmail: userEmailResolved,
      userEmail: userEmailResolved,
      createdAt: new Date().toISOString()
    };

    onSubmitBooking(newBooking);
    setSubmittedSingleBooking(newBooking);
    setStep(4);
  };

  // Final Submit Handler for Multi-Venue Event Mode
  const handleEventPackageSubmit = (e) => {
    e.preventDefault();
    if (hasAnyMultiSlotConflict || hasAnyMissingClassroomRoom || hasAnyInvalidTimes) return;

    const userEmailResolved = (initialEmail || currentUser?.email || '').trim().toLowerCase();
    const eventId = `EVT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const eventBookings = venueSlots.map((slot, idx) => {
      const v = venues.find(item => item.id === slot.venueId);
      const isClass = v?.requiresRoomNumber || slot.venueId === 'classrooms';
      return {
        id: `BK-2026-${Math.floor(1000 + Math.random() * 9000)}-${idx + 1}`,
        eventId,
        eventTitle: (eventTitle || '').trim(),
        organizer: (organizer || organizerSearch || 'College Student Body').trim(),
        venueId: slot.venueId,
        venueName: v ? v.name : slot.venueId,
        roomNumber: isClass ? (slot.roomNumber || '').trim() : null,
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        status: 'confirmed',
        approvedBy: 'Auto-Confirmed',
        description: (description || '').trim(),
        contactEmail: userEmailResolved,
        userEmail: userEmailResolved,
        createdAt: new Date().toISOString()
      };
    });

    onSubmitBooking(eventBookings);
    setSubmittedEventId(eventId);
    setSubmittedEventBookings(eventBookings);
    setStep(4);
  };

  return (
    <div className="modal-overlay animate-fade-in" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="glass-panel w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl sm:rounded-3xl border border-gray-200 p-4 sm:p-6 md:p-8 relative bg-white shadow-2xl">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gray-100 text-gray-500 hover:text-gray-900 hover:bg-gray-200 flex items-center justify-center transition-colors border border-gray-200 z-10"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Modal Header & Mode Switcher */}
        {step <= 3 && (
          <div className="mb-6 space-y-4">
            
            {/* Top Mode Segmented Selector */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 p-1 rounded-xl border border-gray-200" style={{ background: '#F3F4F6' }}>
                <button
                  type="button"
                  onClick={() => {
                    setBookingMode('single');
                    setStep(1);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all"
                  style={bookingMode === 'single'
                    ? { background: '#B91C1C', color: '#FFFFFF', boxShadow: '0 1px 4px rgba(0,0,0,0.18)' }
                    : { background: 'transparent', color: '#374151' }
                  }
                >
                  <Building2 className="w-3.5 h-3.5" style={{ color: bookingMode === 'single' ? '#FFFFFF' : '#6B7280' }} />
                  <span style={{ color: bookingMode === 'single' ? '#FFFFFF' : '#111827' }}>Single Venue</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setBookingMode('event');
                    setStep(1);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all"
                  style={bookingMode === 'event'
                    ? { background: '#B91C1C', color: '#FFFFFF', boxShadow: '0 1px 4px rgba(0,0,0,0.18)' }
                    : { background: 'transparent', color: '#374151' }
                  }
                >
                  <Layers className="w-3.5 h-3.5" style={{ color: bookingMode === 'event' ? '#FFFFFF' : '#6B7280' }} />
                  <span style={{ color: bookingMode === 'event' ? '#FFFFFF' : '#111827' }}>Event Package (Multi-Venue)</span>
                  <span 
                    className="text-[9px] px-1.5 py-0.2 rounded font-bold ml-0.5"
                    style={bookingMode === 'event'
                      ? { background: 'rgba(255,255,255,0.25)', color: '#FFFFFF' }
                      : { background: '#FEE2E2', color: '#B91C1C', border: '1px solid #FCA5A5' }
                    }
                  >
                    NEW
                  </span>
                </button>
              </div>

              {bookingMode === 'event' && (
                <div className="text-[11px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1"
                  style={{ background: '#FFF5F5', color: '#991B1B', borderColor: '#FECACA' }}
                >
                  <Sparkles className="w-3 h-3 text-red-600" />
                  <span>{venueSlots.length} Venue{venueSlots.length > 1 ? 's' : ''} in Event</span>
                </div>
              )}
            </div>

            {/* Wizard Header Progress Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs font-bold text-gray-500">
                <span style={{ color: step >= 1 ? '#B91C1C' : '#9CA3AF' }}>
                  {bookingMode === 'single' ? '1. Venue & Slot' : '1. Event Details'}
                </span>
                <span style={{ color: step >= 2 ? '#B91C1C' : '#9CA3AF' }}>
                  {bookingMode === 'single' ? '2. Event Details' : '2. Venues & Slots'}
                </span>
                <span style={{ color: step >= 3 ? '#B91C1C' : '#9CA3AF' }}>3. Review & Confirm</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden border border-gray-200">
                <div 
                  className="h-full transition-all duration-300"
                  style={{ width: `${(step / 3) * 100}%`, backgroundColor: '#B91C1C' }}
                />
              </div>
            </div>

          </div>
        )}

        {/* =========================================================================
            MODE 1: SINGLE VENUE BOOKING FLOW
            ========================================================================= */}
        {bookingMode === 'single' && (
          <>
            {/* STEP 1: Venue & Time Selection */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <span className="badge mb-1 font-bold text-[11px]" style={{ background: '#FEE2E2', color: '#B91C1C', borderColor: '#FCA5A5' }}>
                    Single Mode • Step 1 of 3
                  </span>
                  <h2 className="text-xl font-bold" style={{ color: '#000000' }}>Select Campus Venue & Time Slot</h2>
                </div>

                {/* Venue Dropdown */}
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>
                    Target Campus Venue *
                  </label>
                  <div className="relative">
                    <select
                      value={singleVenueId}
                      onChange={(e) => setSingleVenueId(e.target.value)}
                      className="input-field pr-10 text-xs font-semibold appearance-none bg-white cursor-pointer"
                      style={{ color: '#111827' }}
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
                {isSingleClassroom && (
                  <div className="p-4 rounded-xl space-y-2 animate-fade-in border" style={{ background: '#FFF5F5', borderColor: '#FCA5A5' }}>
                    <div className="flex items-center gap-2 text-xs font-bold" style={{ color: '#B91C1C' }}>
                      <DoorClosed className="w-4 h-4" style={{ color: '#DC2626' }} />
                      <span>Specify Classroom Room Number / Code *</span>
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. Room 204 (CS Block), Room 101, LH-302..."
                      value={singleRoomNumber}
                      onChange={(e) => setSingleRoomNumber(e.target.value)}
                      className="input-field text-xs font-medium"
                      style={{ color: '#111827' }}
                      required
                    />
                  </div>
                )}

                {/* Date & Time Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>
                      Event Date
                    </label>
                    <input
                      type="date"
                      value={singleDate}
                      onChange={(e) => setSingleDate(e.target.value)}
                      className="input-field font-mono text-xs"
                      style={{ color: '#111827' }}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={singleStartTime}
                      onChange={(e) => setSingleStartTime(e.target.value)}
                      className="input-field font-mono text-xs"
                      style={{ color: '#111827' }}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>
                      End Time
                    </label>
                    <input
                      type="time"
                      value={singleEndTime}
                      onChange={(e) => setSingleEndTime(e.target.value)}
                      className="input-field font-mono text-xs"
                      style={{ color: '#111827' }}
                    />
                  </div>
                </div>

                {/* Conflict Warning Banner */}
                {singleConflictInfo.hasConflict ? (
                  <div className="border p-4 rounded-xl flex items-start gap-3 text-xs shadow-xs" style={{ background: '#FFF5F5', borderColor: '#FCA5A5', color: '#7F1D1D' }}>
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#DC2626' }} />
                    <div>
                      <div className="font-bold mb-0.5" style={{ color: '#991B1B' }}>Time Slot Conflict Detected!</div>
                      <p className="leading-relaxed">
                        <strong>{selectedSingleVenue?.name} {singleConflictInfo.conflictingBooking?.roomNumber && `(${singleConflictInfo.conflictingBooking.roomNumber})`}</strong> is already booked by{' '}
                        <span className="underline font-semibold">{singleConflictInfo.conflictingBooking?.organizer}</span> for{' '}
                        <em>"{singleConflictInfo.conflictingBooking?.eventTitle}"</em> ({formatTime12H(singleConflictInfo.conflictingBooking?.startTime)} - {formatTime12H(singleConflictInfo.conflictingBooking?.endTime)}).
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="border p-3 rounded-xl flex items-center gap-2 text-xs font-medium" style={{ background: '#F0FDF4', borderColor: '#86EFAC', color: '#166534' }}>
                    <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: '#16A34A' }} />
                    <span>Slot is available for booking!</span>
                  </div>
                )}

                {/* Step 1 Actions */}
                <div className="flex justify-end pt-4 border-t border-gray-100">
                  <button
                    onClick={() => setStep(2)}
                    disabled={singleConflictInfo.hasConflict || !singleStartTime || !singleEndTime || (isSingleClassroom && !singleRoomNumber.trim())}
                    className="btn-primary"
                  >
                    <span>Continue to Event Info</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Event Details */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <span className="badge mb-1 font-bold text-[11px]" style={{ background: '#FEE2E2', color: '#B91C1C', borderColor: '#FCA5A5' }}>
                    Single Mode • Step 2 of 3
                  </span>
                  <h2 className="text-xl font-bold" style={{ color: '#000000' }}>Event & Organizing Body</h2>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>
                    Event Title *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter event name or title..."
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    className="input-field text-xs font-medium"
                    style={{ color: '#111827' }}
                    required
                    autoFocus
                  />
                </div>

                {/* Organizing Body (Auto-Assigned from Authorized Gmail) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold" style={{ color: '#374151' }}>
                      Organizing Body *
                    </label>
                    {assignedSociety && !isCustomizingOrg && currentUser?.isUnionAdmin && (
                      <button
                        type="button"
                        onClick={() => setIsCustomizingOrg(true)}
                        className="text-[11px] font-bold text-red-700 hover:text-red-900 transition-colors"
                      >
                        Change Body (Admin)
                      </button>
                    )}
                    {isCustomizingOrg && assignedSociety && (
                      <button
                        type="button"
                        onClick={() => {
                          setOrganizer(assignedSociety);
                          setOrganizerSearch(assignedSociety);
                          setIsCustomizingOrg(false);
                        }}
                        className="text-[11px] font-bold text-gray-500 hover:text-red-700 transition-colors"
                      >
                        Reset to {assignedSociety}
                      </button>
                    )}
                  </div>

                  {assignedSociety && !isCustomizingOrg ? (
                    <div className="p-3.5 rounded-2xl border border-gray-200 bg-gray-50 flex items-center justify-between gap-3 shadow-xs">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-red-100 border border-red-200 text-red-700 flex items-center justify-center shrink-0">
                          <ShieldCheck className="w-5 h-5 text-red-700" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-gray-900 leading-tight truncate">
                            {organizer || assignedSociety}
                          </div>
                          <div className="text-[11px] text-gray-500 mt-0.5 truncate">
                            Assigned to authorized account <span className="font-mono font-semibold text-gray-700">({initialEmail || currentUser?.email})</span>
                          </div>
                        </div>
                      </div>

                      <span className="badge badge-available text-[10px] py-0.5 whitespace-nowrap shrink-0">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Assigned
                      </span>
                    </div>
                  ) : (
                    <div className="relative" ref={orgDropdownRef}>
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
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>
                    Event Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Briefly state any specific agenda or special requirements..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="input-field text-xs"
                    style={{ color: '#111827' }}
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
                  <span className="badge mb-1 font-bold text-[11px]" style={{ background: '#FEE2E2', color: '#B91C1C', borderColor: '#FCA5A5' }}>
                    Single Mode • Step 3 of 3
                  </span>
                  <h2 className="text-xl font-bold" style={{ color: '#000000' }}>Confirm Single Venue Booking</h2>
                </div>

                <div className="p-5 rounded-2xl border border-gray-200 space-y-3 text-xs shadow-xs" style={{ background: '#F9FAFB' }}>
                  <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                    <span style={{ color: '#6B7280' }}>Target Venue:</span>
                    <span className="font-bold" style={{ color: '#000000' }}>
                      {selectedSingleVenue?.name} {isSingleClassroom && singleRoomNumber && `• ${singleRoomNumber}`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                    <span style={{ color: '#6B7280' }}>Event Title:</span>
                    <span className="font-bold" style={{ color: '#B91C1C' }}>{eventTitle}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                    <span style={{ color: '#6B7280' }}>Organized By:</span>
                    <span className="font-semibold" style={{ color: '#000000' }}>{organizer}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ color: '#6B7280' }}>Schedule:</span>
                    <span className="font-mono font-bold" style={{ color: '#111827' }}>
                      {formatDateFriendly(singleDate)} ({formatTime12H(singleStartTime)} - {formatTime12H(singleEndTime)})
                    </span>
                  </div>
                </div>

                <div className="border p-3.5 rounded-xl flex items-start gap-2.5 text-xs" style={{ background: '#F0FDF4', borderColor: '#86EFAC', color: '#166534' }}>
                  <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#16A34A' }} />
                  <span>
                    Your single venue booking will be confirmed immediately.
                  </span>
                </div>

                {/* Step 3 Actions */}
                <div className="flex justify-between pt-4 border-t border-gray-100">
                  <button onClick={() => setStep(2)} className="btn-secondary">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back
                  </button>
                  <button onClick={handleSingleSubmit} className="btn-primary py-2.5 px-6">
                    <Check className="w-4 h-4 mr-1" /> Confirm Booking
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* =========================================================================
            MODE 2: EVENT PACKAGE (MULTI-VENUE) BOOKING FLOW
            ========================================================================= */}
        {bookingMode === 'event' && (
          <>
            {/* STEP 1: Event Master Details */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <span className="badge mb-1 font-bold text-[11px]" style={{ background: '#FEE2E2', color: '#B91C1C', borderColor: '#FCA5A5' }}>
                    Event Package • Step 1 of 3
                  </span>
                  <h2 className="text-xl font-bold" style={{ color: '#000000' }}>Create Event & Organizing Body</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Define the overarching event once, then add as many venues and time slots as needed in the next step.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>
                    Event Name / Title *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. National Hackathon 2026, Tech Symposium, Placement Orientation..."
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    className="input-field text-xs font-medium"
                    style={{ color: '#111827' }}
                    required
                    autoFocus
                  />
                </div>

                {/* Organizing Body (Auto-Assigned from Authorized Gmail) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold" style={{ color: '#374151' }}>
                      Organizing Body *
                    </label>
                    {assignedSociety && !isCustomizingOrg && currentUser?.isUnionAdmin && (
                      <button
                        type="button"
                        onClick={() => setIsCustomizingOrg(true)}
                        className="text-[11px] font-bold text-red-700 hover:text-red-900 transition-colors"
                      >
                        Change Body (Admin)
                      </button>
                    )}
                    {isCustomizingOrg && assignedSociety && (
                      <button
                        type="button"
                        onClick={() => {
                          setOrganizer(assignedSociety);
                          setOrganizerSearch(assignedSociety);
                          setIsCustomizingOrg(false);
                        }}
                        className="text-[11px] font-bold text-gray-500 hover:text-red-700 transition-colors"
                      >
                        Reset to {assignedSociety}
                      </button>
                    )}
                  </div>

                  {assignedSociety && !isCustomizingOrg ? (
                    <div className="p-3.5 rounded-2xl border border-gray-200 bg-gray-50 flex items-center justify-between gap-3 shadow-xs">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-red-100 border border-red-200 text-red-700 flex items-center justify-center shrink-0">
                          <ShieldCheck className="w-5 h-5 text-red-700" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-gray-900 leading-tight truncate">
                            {organizer || assignedSociety}
                          </div>
                          <div className="text-[11px] text-gray-500 mt-0.5 truncate">
                            Assigned to authorized account <span className="font-mono font-semibold text-gray-700">({initialEmail || currentUser?.email})</span>
                          </div>
                        </div>
                      </div>

                      <span className="badge badge-available text-[10px] py-0.5 whitespace-nowrap shrink-0">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Assigned
                      </span>
                    </div>
                  ) : (
                    <div className="relative" ref={orgDropdownRef}>
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
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>
                    Event Agenda / Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Provide overview, special requirements, expected attendees, or multi-venue logistics..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="input-field text-xs"
                    style={{ color: '#111827' }}
                  />
                </div>

                {/* Step 1 Actions */}
                <div className="flex justify-end pt-4 border-t border-gray-100">
                  <button
                    onClick={() => setStep(2)}
                    disabled={!eventTitle.trim() || !organizer}
                    className="btn-primary"
                  >
                    <span>Configure Venues & Slots ({venueSlots.length})</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Multi-Venue Schedule Builder */}
            {step === 2 && (
              <div className="space-y-5">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <span className="badge mb-1 font-bold text-[11px]" style={{ background: '#FEE2E2', color: '#B91C1C', borderColor: '#FCA5A5' }}>
                      Event Package • Step 2 of 3
                    </span>
                    <h2 className="text-xl font-bold" style={{ color: '#000000' }}>Add Event Venues & Schedules</h2>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddSlot}
                    className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 border-red-200 hover:border-red-400 font-bold"
                    style={{ color: '#991B1B', background: '#FFF5F5' }}
                  >
                    <Plus className="w-3.5 h-3.5 text-red-600" />
                    <span>Add Another Venue</span>
                  </button>
                </div>

                {/* List of Venue Slot Cards */}
                <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
                  {venueSlots.map((slot, index) => {
                    const slotVenue = venues.find(v => v.id === slot.venueId);
                    const isSlotClassroom = slotVenue?.requiresRoomNumber || slot.venueId === 'classrooms';
                    const conflict = getSlotConflict(slot);

                    return (
                      <div 
                        key={slot.id} 
                        className="p-4 rounded-2xl border border-gray-200 bg-gray-50 space-y-3.5 relative transition-all shadow-xs"
                        style={{
                          borderColor: conflict.hasConflict ? '#FCA5A5' : '#E5E7EB',
                          background: conflict.hasConflict ? '#FFF8F8' : '#F9FAFB'
                        }}
                      >
                        {/* Slot Header */}
                        <div className="flex items-center justify-between gap-2 border-b border-gray-200 pb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center shrink-0" style={{ background: '#B91C1C', color: '#FFFFFF' }}>
                              {index + 1}
                            </span>
                            <span className="font-bold text-xs" style={{ color: '#000000' }}>
                              Venue Slot #{index + 1}
                            </span>
                            {conflict.hasConflict ? (
                              <span className="badge badge-occupied text-[10px] py-0">
                                <AlertTriangle className="w-3 h-3 mr-0.5" /> Conflict
                              </span>
                            ) : (
                              <span className="badge badge-available text-[10px] py-0">
                                <CheckCircle2 className="w-3 h-3 mr-0.5" /> Available
                              </span>
                            )}
                          </div>

                          {venueSlots.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveSlot(slot.id)}
                              className="text-gray-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors"
                              title="Remove this venue slot"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        {/* Venue Selection & Classroom Room Number */}
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                          <div className={isSlotClassroom ? 'sm:col-span-7' : 'sm:col-span-12'}>
                            <label className="block text-[11px] font-semibold mb-1" style={{ color: '#374151' }}>
                              Campus Venue *
                            </label>
                            <div className="relative">
                              <select
                                value={slot.venueId}
                                onChange={(e) => handleUpdateSlot(slot.id, 'venueId', e.target.value)}
                                className="input-field pr-8 text-xs font-semibold appearance-none bg-white cursor-pointer"
                                style={{ color: '#111827' }}
                              >
                                {venues.map((v) => (
                                  <option key={v.id} value={v.id} disabled={v.status === 'Maintenance'}>
                                    {v.name} ({v.type}{v.capacity && v.capacity !== 'NA' ? ` - ${v.capacity} seats` : ''}) {v.status === 'Maintenance' ? '[MAINTENANCE]' : ''}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="w-3.5 h-3.5 text-gray-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                          </div>

                          {isSlotClassroom && (
                            <div className="sm:col-span-5">
                              <label className="block text-[11px] font-semibold mb-1" style={{ color: '#B91C1C' }}>
                                Room Number / Code *
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. Room 204, LH-302..."
                                value={slot.roomNumber}
                                onChange={(e) => handleUpdateSlot(slot.id, 'roomNumber', e.target.value)}
                                className="input-field text-xs font-medium bg-white"
                                style={{ color: '#111827', borderColor: !slot.roomNumber.trim() ? '#F87171' : undefined }}
                                required
                              />
                            </div>
                          )}
                        </div>

                        {/* Date, Start Time, End Time Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold mb-1" style={{ color: '#374151' }}>
                              Date
                            </label>
                            <input
                              type="date"
                              value={slot.date}
                              onChange={(e) => handleUpdateSlot(slot.id, 'date', e.target.value)}
                              className="input-field font-mono text-xs bg-white"
                              style={{ color: '#111827' }}
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold mb-1" style={{ color: '#374151' }}>
                              Start Time
                            </label>
                            <input
                              type="time"
                              value={slot.startTime}
                              onChange={(e) => handleUpdateSlot(slot.id, 'startTime', e.target.value)}
                              className="input-field font-mono text-xs bg-white"
                              style={{ color: '#111827' }}
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold mb-1" style={{ color: '#374151' }}>
                              End Time
                            </label>
                            <input
                              type="time"
                              value={slot.endTime}
                              onChange={(e) => handleUpdateSlot(slot.id, 'endTime', e.target.value)}
                              className="input-field font-mono text-xs bg-white"
                              style={{ color: '#111827' }}
                            />
                          </div>
                        </div>

                        {/* Slot Conflict Banner if detected */}
                        {conflict.hasConflict && (
                          <div className="border p-2.5 rounded-xl flex items-start gap-2 text-[11px] animate-fade-in" style={{ background: '#FFF5F5', borderColor: '#FCA5A5', color: '#7F1D1D' }}>
                            <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                            <span className="leading-snug font-medium">{conflict.reason}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Add More Slots CTA */}
                <button
                  type="button"
                  onClick={handleAddSlot}
                  className="w-full py-2.5 px-4 border-2 border-dashed border-gray-300 hover:border-red-400 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 text-gray-700 hover:text-red-700 hover:bg-red-50/50 transition-all"
                >
                  <Plus className="w-4 h-4 text-red-600" />
                  <span>Add Another Venue or Parallel Time Slot</span>
                </button>

                {/* Bottom Status Banner */}
                {hasAnyMultiSlotConflict ? (
                  <div className="border p-3 rounded-xl flex items-center gap-2 text-xs font-semibold" style={{ background: '#FFF5F5', borderColor: '#FCA5A5', color: '#991B1B' }}>
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>Please resolve the highlighted conflicting slots above before proceeding.</span>
                  </div>
                ) : hasAnyMissingClassroomRoom ? (
                  <div className="border p-3 rounded-xl flex items-center gap-2 text-xs font-semibold" style={{ background: '#FFFBEB', borderColor: '#FCD34D', color: '#92400E' }}>
                    <Info className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Please enter the classroom room number/code for all classroom slots.</span>
                  </div>
                ) : (
                  <div className="border p-3 rounded-xl flex items-center justify-between text-xs font-medium" style={{ background: '#F0FDF4', borderColor: '#86EFAC', color: '#166534' }}>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>All {venueSlots.length} venue slots are available with zero conflicts!</span>
                    </div>
                  </div>
                )}

                {/* Step 2 Actions */}
                <div className="flex justify-between pt-4 border-t border-gray-100">
                  <button onClick={() => setStep(1)} className="btn-secondary">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={hasAnyMultiSlotConflict || hasAnyMissingClassroomRoom || hasAnyInvalidTimes}
                    className="btn-primary"
                  >
                    <span>Review Event Package ({venueSlots.length} Venues)</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Review & Final Confirmation of Event Package */}
            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <span className="badge mb-1 font-bold text-[11px]" style={{ background: '#FEE2E2', color: '#B91C1C', borderColor: '#FCA5A5' }}>
                    Event Package • Step 3 of 3
                  </span>
                  <h2 className="text-xl font-bold" style={{ color: '#000000' }}>Confirm Multi-Venue Event Booking</h2>
                </div>

                {/* Event Summary Overview Card */}
                <div className="p-4 sm:p-5 rounded-2xl border border-gray-200 bg-gray-50 space-y-3 text-xs shadow-xs">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                    <span style={{ color: '#6B7280' }}>Event Name:</span>
                    <span className="font-bold text-sm" style={{ color: '#B91C1C' }}>{eventTitle}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                    <span style={{ color: '#6B7280' }}>Organizing Body:</span>
                    <span className="font-bold" style={{ color: '#000000' }}>{organizer}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ color: '#6B7280' }}>Total Venues Booked:</span>
                    <span className="font-bold px-2.5 py-0.5 rounded-full text-xs" style={{ background: '#B91C1C', color: '#FFFFFF' }}>
                      {venueSlots.length} Venues
                    </span>
                  </div>
                </div>

                {/* Venues Schedule Breakdown Table */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold" style={{ color: '#374151' }}>
                    Venue & Slot Breakdown:
                  </label>
                  <div className="border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-100 max-h-48 overflow-y-auto bg-white">
                    {venueSlots.map((slot, idx) => {
                      const v = venues.find(item => item.id === slot.venueId);
                      return (
                        <div key={slot.id} className="p-3 flex items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-2.5">
                            <span className="w-5 h-5 rounded-full bg-red-100 text-red-800 font-bold text-[11px] flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <div>
                              <div className="font-bold" style={{ color: '#111827' }}>
                                {v?.name} {slot.roomNumber && <span className="text-red-700">({slot.roomNumber})</span>}
                              </div>
                              <div className="text-[10px] text-gray-500">{v?.location}</div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="font-semibold" style={{ color: '#111827' }}>
                              {formatDateFriendly(slot.date)}
                            </div>
                            <div className="font-mono text-[11px] text-gray-600">
                              {formatTime12H(slot.startTime)} - {formatTime12H(slot.endTime)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="border p-3.5 rounded-xl flex items-start gap-2.5 text-xs" style={{ background: '#F0FDF4', borderColor: '#86EFAC', color: '#166534' }}>
                  <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#16A34A' }} />
                  <span>
                    All {venueSlots.length} venue reservations will be submitted and auto-confirmed simultaneously under a unified event ID.
                  </span>
                </div>

                {/* Step 3 Actions */}
                <div className="flex justify-between pt-4 border-t border-gray-100">
                  <button onClick={() => setStep(2)} className="btn-secondary">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back
                  </button>
                  <button onClick={handleEventPackageSubmit} className="btn-primary py-2.5 px-6">
                    <Check className="w-4 h-4 mr-1" /> Confirm & Book All {venueSlots.length} Venues
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* =========================================================================
            STEP 4: SUCCESS RECEIPT SCREEN (BOTH MODES)
            ========================================================================= */}
        {step === 4 && (
          <div className="text-center py-6 space-y-5 animate-fade-in">
            <div className="w-16 h-16 rounded-full border-2 text-emerald-600 mx-auto flex items-center justify-center shadow-md"
              style={{ background: '#D1FAE5', borderColor: '#10B981' }}>
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-2xl font-extrabold" style={{ color: '#000000' }}>
                {bookingMode === 'single' ? 'Venue Booking Confirmed!' : 'Event Package Confirmed!'}
              </h2>
              <p className="text-xs mt-1" style={{ color: '#6B7280' }}>
                {bookingMode === 'single' ? (
                  <>Booking ID: <span className="font-mono font-bold" style={{ color: '#B91C1C' }}>{submittedSingleBooking?.id}</span></>
                ) : (
                  <>Event ID: <span className="font-mono font-bold" style={{ color: '#B91C1C' }}>{submittedEventId}</span> • {submittedEventBookings.length} Venues Reserved</>
                )}
              </p>
            </div>

            {/* Single Mode Receipt */}
            {bookingMode === 'single' && submittedSingleBooking && (
              <div className="p-4 rounded-2xl border border-gray-200 text-xs max-w-md mx-auto text-left space-y-2 bg-gray-50 shadow-xs">
                <div className="font-bold text-sm" style={{ color: '#000000' }}>{submittedSingleBooking.eventTitle}</div>
                <div className="font-semibold" style={{ color: '#B91C1C' }}>{submittedSingleBooking.organizer}</div>
                <div style={{ color: '#374151' }}>
                  {submittedSingleBooking.venueName} {submittedSingleBooking.roomNumber && `• ${submittedSingleBooking.roomNumber}`}
                </div>
                <div className="font-mono font-medium" style={{ color: '#4B5563' }}>
                  {formatDateFriendly(submittedSingleBooking.date)} • {formatTime12H(submittedSingleBooking.startTime)} - {formatTime12H(submittedSingleBooking.endTime)}
                </div>
                <div className="pt-1">
                  <span className="badge badge-available">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Confirmed
                  </span>
                </div>
              </div>
            )}

            {/* Multi-Venue Event Mode Receipt */}
            {bookingMode === 'event' && submittedEventBookings.length > 0 && (
              <div className="max-w-lg mx-auto text-left space-y-3">
                <div className="p-3.5 rounded-2xl border border-gray-200 bg-gray-50 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-sm text-gray-900">{eventTitle}</div>
                    <div className="text-xs font-semibold text-red-700">{organizer}</div>
                  </div>
                  <span className="badge badge-available">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> All {submittedEventBookings.length} Confirmed
                  </span>
                </div>

                <div className="border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-100 max-h-48 overflow-y-auto bg-white text-xs">
                  {submittedEventBookings.map((b) => (
                    <div key={b.id} className="p-3 flex items-center justify-between gap-2">
                      <div>
                        <div className="font-bold text-gray-900">
                          {b.venueName} {b.roomNumber && <span className="text-red-700 font-mono">({b.roomNumber})</span>}
                        </div>
                        <div className="text-[10px] font-mono text-gray-500">ID: {b.id}</div>
                      </div>
                      <div className="text-right font-mono text-[11px] text-gray-700 font-medium">
                        <div>{formatDateFriendly(b.date)}</div>
                        <div className="text-gray-500">{formatTime12H(b.startTime)} - {formatTime12H(b.endTime)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
