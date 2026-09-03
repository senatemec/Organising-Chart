import React, { useState } from 'react';
import { 
  Calendar, 
  CalendarDays, 
  Clock, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  Info, 
  CheckCircle2, 
  Building2, 
  DoorClosed, 
  Filter, 
  Plus, 
  Layers, 
  Eye 
} from 'lucide-react';
import { timeSlots, formatDateFriendly, formatTime12H } from '../utils/availabilityUtils';
import EventDetailsModal from './EventDetailsModal';

export default function AvailabilityGrid({ 
  venues, 
  bookings, 
  onSlotClick, 
  currentUser, 
  onAdminCancelBooking 
}) {
  const [viewMode, setViewMode] = useState('monthly'); // 'daily' | 'monthly'
  const [selectedDate, setSelectedDate] = useState('2026-09-05');
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date('2026-09-01T00:00:00'));
  const [selectedDivision, setSelectedDivision] = useState('All');
  const [selectedMonthDay, setSelectedMonthDay] = useState('2026-09-05');
  
  // Selected Event to view full details modal
  const [selectedEventForDetails, setSelectedEventForDetails] = useState(null);

  // Change date by offset in days (for daily matrix)
  const changeDateByDays = (days) => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() + days);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    setSelectedDate(`${yyyy}-${mm}-${dd}`);
  };

  const setDatePreset = (preset) => {
    if (preset === 'today') {
      setSelectedDate('2026-09-05');
    } else if (preset === 'tomorrow') {
      setSelectedDate('2026-09-06');
    }
  };

  // Helper for daily matrix slot state
  const getSlotState = (venueId, timeStr) => {
    const slotHour = parseInt(timeStr.split(':')[0], 10);

    const matchingBooking = bookings.find((b) => {
      if (b.venueId !== venueId || b.date !== selectedDate || b.status === 'cancelled' || b.status === 'rejected') return false;
      const startHour = parseInt(b.startTime.split(':')[0], 10);
      const endHour = parseInt(b.endTime.split(':')[0], 10);
      return slotHour >= startHour && slotHour < endHour;
    });

    if (matchingBooking) {
      return {
        isOccupied: true,
        status: matchingBooking.status,
        booking: matchingBooking
      };
    }

    return { isOccupied: false, status: 'available', booking: null };
  };

  // Monthly Calendar Navigation & Computation
  const changeMonth = (delta) => {
    const nextMonth = new Date(currentMonthDate);
    nextMonth.setMonth(nextMonth.getMonth() + delta);
    setCurrentMonthDate(nextMonth);
  };

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth(); // 0-indexed
  const monthName = currentMonthDate.toLocaleString('default', { month: 'long' });

  // Compute days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Filter bookings for monthly view
  const activeBookings = bookings.filter(b => b.status !== 'cancelled' && b.status !== 'rejected');
  
  const filteredMonthlyBookings = activeBookings.filter((b) => {
    if (selectedDivision === 'All') return true;
    const v = venues.find(ven => ven.id === b.venueId);
    return v && v.type === selectedDivision;
  });

  // Get bookings for a specific day string (YYYY-MM-DD)
  const getBookingsForDate = (dateStr) => {
    return filteredMonthlyBookings.filter(b => b.date === dateStr);
  };

  // Monthly statistics
  const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
  const bookingsThisMonth = activeBookings.filter(b => b.date.startsWith(monthPrefix));

  const daysArray = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    daysArray.push({ dayNumber: d, dateStr });
  }

  // Selected day bookings
  const selectedDayBookings = activeBookings.filter(b => b.date === selectedMonthDay);

  return (
    <div className="space-y-6">
      
      {/* Top Header & View Switcher */}
      <div className="glass-panel p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 border border-slate-200 bg-white shadow-xs">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center shrink-0">
            {viewMode === 'monthly' ? <CalendarDays className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              {viewMode === 'monthly' ? 'Monthly Venue Schedule Overview' : 'Daily Hourly Venue Matrix'}
            </h2>
            <p className="text-xs text-slate-500">
              {viewMode === 'monthly' 
                ? `Month at a glance for ${monthName} ${year} • Click any event or day to inspect details` 
                : 'Hour-by-hour availability timeline • Click any event to inspect or click green slot to book'}
            </p>
          </div>
        </div>

        {/* Right View Switcher Toggle */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setViewMode('monthly')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
                viewMode === 'monthly' 
                  ? 'bg-white text-slate-900 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Monthly Overview</span>
            </button>
            <button
              onClick={() => setViewMode('daily')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
                viewMode === 'daily' 
                  ? 'bg-white text-slate-900 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Hourly Matrix</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          VIEW 1: MONTHLY CALENDAR OVERVIEW
          ========================================================================= */}
      {viewMode === 'monthly' && (
        <div className="space-y-6">
          
          {/* Monthly Controls Bar */}
          <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 border border-slate-200 bg-white shadow-xs">
            
            {/* Month Navigator */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => changeMonth(-1)}
                className="p-2 rounded-xl bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="px-4 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-center min-w-[170px]">
                <span className="font-extrabold text-sm text-slate-900">{monthName} {year}</span>
              </div>

              <button
                onClick={() => changeMonth(1)}
                className="p-2 rounded-xl bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setCurrentMonthDate(new Date('2026-09-01T00:00:00'));
                  setSelectedMonthDay('2026-09-05');
                }}
                className="btn-secondary text-xs py-1.5 px-3 ml-2 border-slate-300"
              >
                Current Month
              </button>
            </div>

            {/* Division Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1 md:pb-0">
              <span className="text-slate-500 text-[11px] font-medium mr-1 hidden sm:inline">Division:</span>
              {[
                { id: 'All', label: 'All Venues' },
                { id: 'Activity Division', label: 'Activity' },
                { id: 'Auditorium', label: 'Auditoriums' },
                { id: 'Computer Lab', label: 'Labs' },
                { id: 'Classrooms', label: 'Classrooms' },
              ].map((div) => (
                <button
                  key={div.id}
                  onClick={() => setSelectedDivision(div.id)}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all border ${
                    selectedDivision === div.id
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white text-slate-600 hover:text-slate-900 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {div.label}
                </button>
              ))}
            </div>

          </div>

          {/* Month Summary KPI Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="glass-panel p-3.5 rounded-xl border border-slate-200 bg-white text-xs shadow-xs">
              <div className="text-slate-500">Total Bookings in {monthName}</div>
              <div className="text-xl font-extrabold text-slate-900 mt-0.5">{bookingsThisMonth.length} Confirmed</div>
            </div>
            <div className="glass-panel p-3.5 rounded-xl border border-slate-200 bg-white text-xs shadow-xs">
              <div className="text-slate-500">Registered Facilities</div>
              <div className="text-xl font-extrabold text-blue-700 mt-0.5">{venues.length} Facilities</div>
            </div>
            <div className="glass-panel p-3.5 rounded-xl border border-slate-200 bg-white text-xs shadow-xs">
              <div className="text-slate-500">Activity Division Events</div>
              <div className="text-xl font-extrabold text-emerald-700 mt-0.5">
                {bookingsThisMonth.filter(b => {
                  const v = venues.find(ven => ven.id === b.venueId);
                  return v && v.type === 'Activity Division';
                }).length} Active
              </div>
            </div>
            <div className="glass-panel p-3.5 rounded-xl border border-slate-200 bg-white text-xs shadow-xs">
              <div className="text-slate-500">Conflict Engine</div>
              <div className="text-xl font-extrabold text-slate-900 mt-0.5">Zero Clashes</div>
            </div>
          </div>

          {/* Monthly Calendar Dates Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
            {daysArray.map((item) => {
              const dayBookings = getBookingsForDate(item.dateStr);
              const isSelected = selectedMonthDay === item.dateStr;
              const isToday = item.dateStr === '2026-09-05';

              return (
                <div
                  key={item.dateStr}
                  onClick={() => setSelectedMonthDay(item.dateStr)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2.5 shadow-xs ${
                    isSelected
                      ? 'bg-blue-50/60 border-blue-500 ring-2 ring-blue-500/30'
                      : isToday
                      ? 'bg-slate-50 border-blue-400 hover:bg-slate-100'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  {/* Day Top Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                        isToday 
                          ? 'bg-slate-900 text-white font-extrabold shadow-xs' 
                          : isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {item.dayNumber}
                      </span>
                      <span className="text-[11px] text-slate-800 font-bold">
                        {monthName.slice(0, 3)} {item.dayNumber}
                      </span>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                        {new Date(item.dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' })}
                      </span>
                    </div>

                    {dayBookings.length > 0 ? (
                      <span className="badge bg-blue-50 text-blue-800 border border-blue-200 text-[10px] px-2 py-0.5 font-bold">
                        {dayBookings.length} {dayBookings.length === 1 ? 'Event' : 'Events'}
                      </span>
                    ) : (
                      <span className="text-[10px] text-emerald-700 font-medium">
                        • Open
                      </span>
                    )}
                  </div>

                  {/* ALL Events List on this Date */}
                  <div className="space-y-2 flex-1">
                    {dayBookings.length > 0 ? (
                      dayBookings.map((b) => (
                        <div
                          key={b.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEventForDetails(b);
                          }}
                          className="bg-blue-50 hover:bg-blue-100 border border-blue-200 text-slate-900 p-2 rounded-xl text-xs font-medium shadow-xs cursor-pointer transition-all hover:scale-[1.01] space-y-1 group"
                          title={`Click to view full details: ${b.eventTitle}`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-slate-900 truncate text-[11px] leading-tight">
                              {b.eventTitle}
                            </span>
                            <Eye className="w-3 h-3 opacity-60 group-hover:opacity-100 shrink-0 text-blue-600" />
                          </div>

                          <div className="text-[10px] text-blue-800 font-semibold truncate">
                            {b.venueName} {b.roomNumber && `(${b.roomNumber})`} • {b.organizer}
                          </div>

                          <div className="text-[9px] text-slate-600 font-mono flex items-center gap-1 font-medium">
                            <Clock className="w-2.5 h-2.5 shrink-0 text-blue-600" />
                            <span>{formatTime12H(b.startTime)} - {formatTime12H(b.endTime)}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-[11px] text-slate-400 py-3 text-center italic">
                        No events booked
                      </div>
                    )}
                  </div>

                  {/* Day Footer Action */}
                  <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">
                      {dayBookings.length > 0 ? 'Click event for details' : 'All venues free'}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSlotClick(venues[0], item.dateStr, '10:00');
                      }}
                      className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-0.5"
                    >
                      <Plus className="w-2.5 h-2.5" /> Book
                    </button>
                  </div>

                </div>
              );
            })}
          </div>

          {/* Selected Day Inspector Drawer */}
          {selectedMonthDay && (
            <div className="glass-panel p-5 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm animate-fade-in">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {formatDateFriendly(selectedMonthDay)} — Bookings & Schedule
                    </h3>
                    <p className="text-xs text-slate-500">
                      {selectedDayBookings.length} confirmed venue {selectedDayBookings.length === 1 ? 'reservation' : 'reservations'} on this date • Click any event card to view full details
                    </p>
                  </div>
                </div>

                {/* Switch to Hourly Matrix for this day */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedDate(selectedMonthDay);
                      setViewMode('daily');
                    }}
                    className="btn-secondary text-xs py-1.5 px-3 border-slate-300"
                  >
                    <Clock className="w-3.5 h-3.5 text-blue-600" /> View Hourly Timeline
                  </button>
                  <button
                    onClick={() => onSlotClick(venues[0], selectedMonthDay, '10:00')}
                    className="btn-primary text-xs py-1.5 px-3.5 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" /> Book on this Date
                  </button>
                </div>
              </div>

              {/* Day's Event List */}
              {selectedDayBookings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {selectedDayBookings.map((b) => (
                    <div
                      key={b.id}
                      onClick={() => setSelectedEventForDetails(b)}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs hover:border-slate-300 hover:bg-slate-100 cursor-pointer transition-all hover:scale-[1.01] shadow-xs group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-bold text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                          {b.id}
                        </span>
                        <span className="badge badge-available text-[9px] py-0.5 flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Confirmed
                        </span>
                      </div>

                      <div>
                        <div className="font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-blue-600 transition-colors">
                          {b.eventTitle}
                        </div>
                        <div className="text-blue-800 text-[11px] font-semibold">{b.organizer}</div>
                      </div>

                      <div className="space-y-1 text-slate-700 bg-white p-2 rounded-lg border border-slate-200 text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="font-medium text-slate-900">
                            {b.venueName} {b.roomNumber && <span className="text-blue-600 font-mono">({b.roomNumber})</span>}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 font-mono text-slate-600">
                          <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>{formatTime12H(b.startTime)} - {formatTime12H(b.endTime)}</span>
                        </div>
                      </div>

                      <div className="text-[10px] text-blue-600 flex items-center justify-end gap-1 font-semibold pt-1 opacity-80 group-hover:opacity-100">
                        <Eye className="w-3 h-3" /> Click to view details
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-slate-500 space-y-2 bg-slate-50 rounded-xl border border-slate-200">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <p className="font-semibold text-slate-800">No events booked on this date</p>
                  <p className="text-slate-500">All campus auditoriums, activity spaces, and classrooms are wide open for reservation.</p>
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* =========================================================================
          VIEW 2: DAILY HOURLY MATRIX
          ========================================================================= */}
      {viewMode === 'daily' && (
        <div className="space-y-6">
          
          {/* Daily Date Controls Bar */}
          <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 border border-slate-200 bg-white shadow-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDatePreset('today')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                  selectedDate === '2026-09-05' 
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs' 
                    : 'bg-white text-slate-600 hover:text-slate-900 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setDatePreset('tomorrow')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                  selectedDate === '2026-09-06' 
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs' 
                    : 'bg-white text-slate-600 hover:text-slate-900 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Tomorrow
              </button>
              
              <div className="flex items-center gap-1.5 ml-2">
                <button
                  onClick={() => changeDateByDays(-1)}
                  className="p-1.5 rounded-lg bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors"
                  title="Previous Day"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="input-field text-xs font-mono py-1 px-2.5 bg-white border-slate-300 w-auto"
                />
                <button
                  onClick={() => changeDateByDays(1)}
                  className="p-1.5 rounded-lg bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors"
                  title="Next Day"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="text-xs text-slate-700 font-semibold bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              📅 {formatDateFriendly(selectedDate)}
            </div>
          </div>

          {/* Matrix Legend */}
          <div className="flex items-center gap-4 text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200 overflow-x-auto shadow-xs">
            <span className="font-semibold text-slate-900 text-[11px] mr-1">Legend:</span>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-emerald-50 border border-emerald-300" />
              <span>Available Slot (Click to Book)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-blue-600 border border-blue-700" />
              <span>Occupied Event (Click to View Details)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-slate-100 border border-slate-300" />
              <span>Under Maintenance</span>
            </div>
          </div>

          {/* The Live Matrix Table */}
          <div className="glass-panel rounded-2xl border border-slate-200 overflow-hidden shadow-xs bg-white">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left min-w-[900px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 text-xs font-semibold">
                    <th className="p-4 sticky left-0 z-20 bg-slate-50 border-r border-slate-200 min-w-[200px]">
                      Campus Venue & Capacity
                    </th>
                    {timeSlots.map((slot) => (
                      <th key={slot} className="p-3 text-center min-w-[70px] border-r border-slate-200 font-mono text-[11px]">
                        {formatTime12H(slot).replace(':00', '')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {venues.map((venue) => (
                    <tr key={venue.id} className="hover:bg-slate-50/60 transition-colors">
                      
                      {/* Sticky Venue Header Column */}
                      <td className="p-4 sticky left-0 z-10 bg-white border-r border-slate-200">
                        <div className="font-bold text-slate-900 truncate max-w-[200px]" title={venue.name}>
                          {venue.name}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <span>{venue.type}</span> • <span className="text-blue-700 font-semibold">{venue.capacity} seats</span>
                        </div>
                      </td>

                      {/* Hourly Slot Cells */}
                      {timeSlots.map((slot) => {
                        const slotState = getSlotState(venue.id, slot);
                        
                        if (venue.status === 'Maintenance') {
                          return (
                            <td key={slot} className="p-1 border-r border-slate-100 text-center bg-slate-50">
                              <div className="w-full h-11 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 text-[10px] font-medium">
                                Maint
                              </div>
                            </td>
                          );
                        }

                        if (slotState.isOccupied) {
                          return (
                            <td key={slot} className="p-1 border-r border-slate-100 relative group">
                              <div 
                                onClick={() => setSelectedEventForDetails(slotState.booking)}
                                className="w-full h-11 rounded-lg p-1.5 flex flex-col justify-center transition-all cursor-pointer bg-blue-600 hover:bg-blue-700 text-white shadow-xs hover:scale-[1.02]"
                                title="Click to view full event details"
                              >
                                <span className="font-bold truncate text-[10px] block">
                                  {slotState.booking.eventTitle}
                                </span>
                                <span className="text-[9px] opacity-90 truncate block font-medium">
                                  {slotState.booking.organizer}
                                </span>
                              </div>

                              {/* Quick Hover Tooltip */}
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-30 w-64 p-3 rounded-xl border border-slate-200 shadow-xl bg-white text-xs pointer-events-none">
                                <div className="font-bold text-slate-900 mb-0.5">{slotState.booking.eventTitle}</div>
                                <div className="text-blue-700 font-semibold text-[11px] mb-1">{slotState.booking.organizer}</div>
                                {slotState.booking.roomNumber && (
                                  <div className="text-slate-700 font-mono text-[10px] mb-1">
                                    Room: {slotState.booking.roomNumber}
                                  </div>
                                )}
                                <div className="text-slate-500 text-[10px] font-mono">
                                  Time: {formatTime12H(slotState.booking.startTime)} - {formatTime12H(slotState.booking.endTime)}
                                </div>
                                <div className="text-emerald-700 text-[10px] font-bold mt-1 flex items-center gap-1">
                                  <Eye className="w-3 h-3" /> Click slot to view details
                                </div>
                              </div>
                            </td>
                          );
                        }

                        {/* Free Slot */}
                        return (
                          <td key={slot} className="p-1 border-r border-slate-100">
                            <button
                              onClick={() => onSlotClick(venue, selectedDate, slot)}
                              className="w-full h-11 rounded-lg bg-emerald-50/40 hover:bg-emerald-100/80 border border-emerald-200 hover:border-emerald-300 transition-all flex items-center justify-center group"
                              title={`Book ${venue.name} at ${formatTime12H(slot)}`}
                            >
                              <span className="text-[10px] text-emerald-700 opacity-0 group-hover:opacity-100 font-bold">
                                + Book
                              </span>
                            </button>
                          </td>
                        );
                      })}

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* Full Event Details Modal */}
      {selectedEventForDetails && (
        <EventDetailsModal
          event={selectedEventForDetails}
          venue={venues.find(v => v.id === selectedEventForDetails.venueId)}
          onClose={() => setSelectedEventForDetails(null)}
          currentUser={currentUser}
          onAdminRevokeClick={onAdminCancelBooking ? (event) => onAdminCancelBooking(event.id, 'Revoked by Union Admin from Live Matrix') : null}
        />
      )}

    </div>
  );
}
