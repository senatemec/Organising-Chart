import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Eye,
  Lock,
  Unlock,
  ShieldAlert,
  AlertTriangle,
  Search,
  X,
  ArrowRight,
  Tag
} from 'lucide-react';
import { timeSlots, formatDateFriendly, formatTime12H } from '../utils/availabilityUtils';
import EventDetailsModal from './EventDetailsModal';
import ErrorBoundary from './ErrorBoundary';

export default function AvailabilityGrid({ 
  venues, 
  bookings, 
  onSlotClick, 
  currentUser, 
  onAdminCancelBooking,
  onClubCancelBooking,
  onBlockAllVenues,
  onUnblockDay 
}) {
  const [viewMode, setViewMode] = useState('monthly'); // 'daily' | 'monthly'
  const [selectedDate, setSelectedDate] = useState('2026-09-05');
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date('2026-09-01T00:00:00'));
  const [selectedDivision, setSelectedDivision] = useState('All');
  const [selectedMonthDay, setSelectedMonthDay] = useState('2026-09-05');
  
  // Selected Event to view full details modal
  const [selectedEventForDetails, setSelectedEventForDetails] = useState(null);

  // Search Modal & Query State
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('all');
  const [highlightedBookingId, setHighlightedBookingId] = useState(null);
  const searchInputRef = useRef(null);

  // Quick Day Block Modal State (for Union Admin directly from Schedule Matrix)
  const [quickBlockModalOpen, setQuickBlockModalOpen] = useState(false);
  const [quickBlockTargetDate, setQuickBlockTargetDate] = useState('2026-09-05');
  const [quickBlockTitle, setQuickBlockTitle] = useState('College Union Day 2026');
  const [quickBlockOrganizer, setQuickBlockOrganizer] = useState('College Student Union (Union MEC)');
  const [quickBlockStartTime, setQuickBlockStartTime] = useState('08:00');
  const [quickBlockEndTime, setQuickBlockEndTime] = useState('20:00');
  const [quickBlockAutoRevoke, setQuickBlockAutoRevoke] = useState(true);

  // Keyboard shortcut listener (Cmd+K / Ctrl+K and Esc)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchModalOpen(prev => !prev);
      }
      if (e.key === 'Escape' && searchModalOpen) {
        setSearchModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchModalOpen]);

  // Autofocus search input when modal opens
  useEffect(() => {
    if (searchModalOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [searchModalOpen]);

  // All active bookings for search
  const searchableBookings = useMemo(() => {
    return (bookings || []).filter(b => b.status !== 'cancelled' && b.status !== 'rejected');
  }, [bookings]);

  // Counts for search category chips
  const searchCategoryCounts = useMemo(() => {
    const todayStr = '2026-09-05';
    const all = searchableBookings.length;
    const today = searchableBookings.filter(b => b.date === todayStr).length;
    const upcoming = searchableBookings.filter(b => b.date >= todayStr).length;
    const auditorium = searchableBookings.filter(b => {
      const v = venues.find(ven => ven.id === b.venueId);
      return v && v.type === 'Auditorium';
    }).length;
    const activity = searchableBookings.filter(b => {
      const v = venues.find(ven => ven.id === b.venueId);
      return v && v.type === 'Activity Division';
    }).length;
    const labs = searchableBookings.filter(b => {
      const v = venues.find(ven => ven.id === b.venueId);
      return v && (v.type === 'Computer Lab' || v.type === 'Classrooms');
    }).length;

    return { all, today, upcoming, auditorium, activity, labs };
  }, [searchableBookings, venues]);

  // Filtered search results
  const filteredSearchResults = useMemo(() => {
    let list = searchableBookings;
    const todayStr = '2026-09-05';

    if (searchCategory === 'today') {
      list = list.filter(b => b.date === todayStr);
    } else if (searchCategory === 'upcoming') {
      list = list.filter(b => b.date >= todayStr);
    } else if (searchCategory === 'auditorium') {
      list = list.filter(b => {
        const v = venues.find(ven => ven.id === b.venueId);
        return v && v.type === 'Auditorium';
      });
    } else if (searchCategory === 'activity') {
      list = list.filter(b => {
        const v = venues.find(ven => ven.id === b.venueId);
        return v && v.type === 'Activity Division';
      });
    } else if (searchCategory === 'labs') {
      list = list.filter(b => {
        const v = venues.find(ven => ven.id === b.venueId);
        return v && (v.type === 'Computer Lab' || v.type === 'Classrooms');
      });
    }

    const q = searchQuery.trim().toLowerCase();
    if (!q) return list;

    return list.filter(b => {
      const titleMatch = b.eventTitle?.toLowerCase().includes(q);
      const orgMatch = b.organizer?.toLowerCase().includes(q);
      const venueMatch = b.venueName?.toLowerCase().includes(q);
      const roomMatch = b.roomNumber?.toLowerCase().includes(q);
      const dateMatch = b.date?.toLowerCase().includes(q) || formatDateFriendly(b.date).toLowerCase().includes(q);
      const descMatch = b.description?.toLowerCase().includes(q);
      const idMatch = b.id?.toLowerCase().includes(q) || b.eventId?.toLowerCase().includes(q);

      return titleMatch || orgMatch || venueMatch || roomMatch || dateMatch || descMatch || idMatch;
    });
  }, [searchableBookings, searchQuery, searchCategory, venues]);

  const handleJumpToEventInMatrix = (booking) => {
    setSelectedDate(booking.date);
    setSelectedMonthDay(booking.date);
    setViewMode('daily');
    setHighlightedBookingId(booking.id);
    setSearchModalOpen(false);

    setTimeout(() => {
      const el = document.getElementById('hourly-matrix-table');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);

    setTimeout(() => {
      setHighlightedBookingId(null);
    }, 4500);
  };

  const handleInspectFromSearch = (booking) => {
    setSearchModalOpen(false);
    setSelectedEventForDetails(booking);
  };

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
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sun, 1 = Mon ...
  // Adjusted for Monday start (0 = Mon, 6 = Sun)
  const startOffset = (firstDayOfWeek + 6) % 7;

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
      <div className="glass-panel p-3.5 sm:p-5 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4 border border-gray-200 shadow-sm bg-white">
        <div className="flex items-center gap-2.5 sm:gap-3 w-full md:w-auto">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 border"
            style={{background:'#FEE2E2', borderColor:'#FCA5A5'}}>
            {viewMode === 'monthly' ? (
              <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5" style={{color:'#DC2626'}} />
            ) : (
              <Clock className="w-4 h-4 sm:w-5 sm:h-5" style={{color:'#DC2626'}} />
            )}
          </div>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-bold tracking-tight truncate" style={{color:'#000000'}}>
              {viewMode === 'monthly' ? 'Monthly Venue Schedule Overview' : 'Daily Hourly Venue Matrix'}
            </h2>
            <p className="text-[11px] sm:text-xs line-clamp-1" style={{color:'#555555'}}>
              {viewMode === 'monthly' 
                ? `Month at a glance for ${monthName} ${year} • Click any event to inspect` 
                : 'Hour-by-hour timeline • Click event or green slot to book'}
            </p>
          </div>
        </div>

        {/* Right Controls: Search Button + View Switcher */}
        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap sm:flex-nowrap">
          <button
            onClick={() => setSearchModalOpen(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-xs hover:shadow-sm active:scale-95 border"
            style={{
              background: '#FFF5F5',
              color: '#B91C1C',
              borderColor: '#FECACA'
            }}
            title="Search scheduled events (Cmd+K)"
          >
            <Search className="w-3.5 h-3.5 text-red-600" />
            <span>Search Events</span>
            <kbd className="hidden sm:inline-block text-[9px] px-1.5 py-0.5 rounded bg-white text-gray-400 border border-gray-200 font-mono">⌘K</kbd>
          </button>

          <div className="grid grid-cols-2 sm:flex items-center p-1 rounded-xl border text-xs flex-1 sm:flex-initial" style={{background:'#F3F4F6', borderColor:'#E5E7EB'}}>
            <button
              onClick={() => setViewMode('monthly')}
              className={`flex items-center justify-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg font-semibold transition-all text-[11px] sm:text-xs`}
              style={viewMode === 'monthly'
                ? { background: '#B91C1C', color: '#FFFFFF', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }
                : { color: '#4B5563', background: 'transparent' }
              }
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Monthly Overview</span>
            </button>
            <button
              onClick={() => setViewMode('daily')}
              className={`flex items-center justify-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg font-semibold transition-all text-[11px] sm:text-xs`}
              style={viewMode === 'daily'
                ? { background: '#B91C1C', color: '#FFFFFF', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }
                : { color: '#4B5563', background: 'transparent' }
              }
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
        <div className="space-y-4 sm:space-y-6">
          
          {/* Monthly Controls Bar */}
          <div className="glass-panel p-3 sm:p-4 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4 border border-gray-200 bg-white shadow-xs">
            
            {/* Month Navigator */}
            <div className="flex items-center justify-between sm:justify-start gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap">
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  onClick={() => changeMonth(-1)}
                  className="p-1.5 sm:p-2 rounded-xl bg-gray-50 text-gray-700 hover:text-red-700 hover:bg-gray-100 border border-gray-200 transition-colors"
                  title="Previous Month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                <div className="px-3 sm:px-4 py-1.5 bg-gray-50 rounded-xl border border-gray-200 text-center min-w-[130px] sm:min-w-[170px]">
                  <span className="font-extrabold text-xs sm:text-sm" style={{color:'#000000'}}>{monthName} {year}</span>
                </div>

                <button
                  onClick={() => changeMonth(1)}
                  className="p-1.5 sm:p-2 rounded-xl bg-gray-50 text-gray-700 hover:text-red-700 hover:bg-gray-100 border border-gray-200 transition-colors"
                  title="Next Month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => {
                  setCurrentMonthDate(new Date('2026-09-01T00:00:00'));
                  setSelectedMonthDay('2026-09-05');
                }}
                className="btn-secondary text-[11px] sm:text-xs py-1.5 px-2.5 sm:px-3 ml-auto sm:ml-2 font-semibold"
              >
                Current Month
              </button>

              <button
                onClick={() => setSearchModalOpen(true)}
                className="btn-secondary text-[11px] sm:text-xs py-1.5 px-2.5 sm:px-3 font-semibold flex items-center gap-1.5 hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-all ml-1 shrink-0"
                title="Search events across schedule"
              >
                <Search className="w-3.5 h-3.5 text-red-600" />
                <span className="hidden sm:inline">Search Events</span>
              </button>
            </div>

            {/* Division Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] sm:text-xs pb-1 md:pb-0 no-scrollbar">
              <span className="text-[11px] font-semibold mr-1 hidden sm:inline" style={{color:'#6B7280'}}>Division:</span>
              {[
                { id: 'All', label: 'All Venues' },
                { id: 'Activity Division', label: 'Activity' },
                { id: 'Auditorium', label: 'Auditoriums' },
                { id: 'Computer Lab', label: 'Labs' },
                { id: 'Classrooms', label: 'Classrooms' },
              ].map((div) => {
                const isSelected = selectedDivision === div.id;
                return (
                  <button
                    key={div.id}
                    onClick={() => setSelectedDivision(div.id)}
                    className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg font-semibold transition-all border whitespace-nowrap shrink-0`}
                    style={isSelected
                      ? { background: '#B91C1C', color: '#FFFFFF', borderColor: '#7F1D1D', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }
                      : { background: '#FFFFFF', color: '#374151', borderColor: '#E5E7EB' }
                    }
                  >
                    {div.label}
                  </button>
                );
              })}
            </div>

          </div>

          {/* Month Summary KPI Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            <div className="glass-panel p-2.5 sm:p-3.5 rounded-xl border border-gray-200 bg-white shadow-xs text-[11px] sm:text-xs">
              <div style={{color:'#6B7280'}}>Total Bookings</div>
              <div className="text-base sm:text-xl font-extrabold mt-0.5 truncate" style={{color:'#000000'}}>{bookingsThisMonth.length} Confirmed</div>
            </div>
            <div className="glass-panel p-2.5 sm:p-3.5 rounded-xl border border-gray-200 bg-white shadow-xs text-[11px] sm:text-xs">
              <div style={{color:'#6B7280'}}>Registered Facilities</div>
              <div className="text-base sm:text-xl font-extrabold mt-0.5 truncate" style={{color:'#B91C1C'}}>{venues.length} Facilities</div>
            </div>
            <div className="glass-panel p-2.5 sm:p-3.5 rounded-xl border border-gray-200 bg-white shadow-xs text-[11px] sm:text-xs">
              <div style={{color:'#6B7280'}}>Activity Division Events</div>
              <div className="text-base sm:text-xl font-extrabold mt-0.5 truncate" style={{color:'#059669'}}>
                {bookingsThisMonth.filter(b => {
                  const v = venues.find(ven => ven.id === b.venueId);
                  return v && v.type === 'Activity Division';
                }).length} Active
              </div>
            </div>
            <div className="glass-panel p-2.5 sm:p-3.5 rounded-xl border border-gray-200 bg-white shadow-xs text-[11px] sm:text-xs">
              <div style={{color:'#6B7280'}}>Conflict Engine</div>
              <div className="text-base sm:text-xl font-extrabold mt-0.5 truncate" style={{color:'#374151'}}>Zero Clashes</div>
            </div>
          </div>

          {/* Monthly Calendar Dates Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2.5 sm:gap-3.5">
            {daysArray.map((item) => {
              const dayBookings = getBookingsForDate(item.dateStr);
              const isSelected = selectedMonthDay === item.dateStr;
              const isToday = item.dateStr === '2026-09-05';
              const dayBlock = dayBookings.find(b => (b.isDayBlock || (b.eventId && b.eventId.startsWith('BLK-'))));
              const isDayBlocked = Boolean(dayBlock);

              return (
                <div
                  key={item.dateStr}
                  onClick={() => setSelectedMonthDay(item.dateStr)}
                  className="rounded-2xl transition-all cursor-pointer flex flex-col justify-between space-y-2 p-2.5 sm:p-3.5"
                  style={isSelected
                    ? {
                        background: '#FFF5F5',
                        border: '2px solid #DC2626',
                        boxShadow: '0 4px 18px rgba(220,38,38,0.18)'
                      }
                    : isToday
                    ? {
                        background: '#FFF8F8',
                        border: '1.5px solid #FCA5A5',
                        boxShadow: '0 3px 12px rgba(220,38,38,0.10)'
                      }
                    : isDayBlocked
                    ? {
                        background: '#FFF5F5',
                        border: '1.5px solid #F87171',
                        boxShadow: '0 2px 10px rgba(220,38,38,0.08)'
                      }
                    : {
                        background: '#F8F9FA',
                        border: '1.5px solid #E5E7EB',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                      }
                  }
                >
                  {/* Day Top Header */}
                  <div className="flex items-center justify-between border-b pb-1.5 sm:pb-2" style={{borderColor: isSelected || isToday ? '#FECACA' : '#E5E7EB'}}>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[11px] sm:text-xs font-bold w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center`}
                        style={isToday
                          ? { background: '#DC2626', color: '#FFFFFF', fontWeight: '800' }
                          : isSelected
                          ? { background: '#FEE2E2', color: '#7F1D1D', fontWeight: '800' }
                          : { background: '#E5E7EB', color: '#111827', fontWeight: '700' }
                        }
                      >
                        {item.dayNumber}
                      </span>
                      <span className="text-[11px] sm:text-[12px] font-bold" style={{color:'#111827'}}>
                        {monthName.slice(0, 3)} {item.dayNumber}
                      </span>
                      <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded border"
                        style={{background:'#FEE2E2', color:'#B91C1C', borderColor:'#FCA5A5'}}
                      >
                        {new Date(item.dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' })}
                      </span>
                    </div>

                    {isDayBlocked ? (
                      <span className="badge font-bold text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 flex items-center gap-1"
                        style={{background:'#FEE2E2', color:'#991B1B', borderColor:'#FCA5A5'}}
                      >
                        <Lock className="w-2.5 h-2.5 text-red-600" /> Day Block
                      </span>
                    ) : dayBookings.length > 0 ? (
                      <span className="badge font-bold text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5"
                        style={{background:'#FEE2E2', color:'#B91C1C', borderColor:'#FCA5A5'}}
                      >
                        {dayBookings.length} {dayBookings.length === 1 ? 'Event' : 'Events'}
                      </span>
                    ) : (
                      <span className="text-[9px] sm:text-[10px] font-semibold" style={{color:'#059669'}}>
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
                          className="p-2 rounded-xl text-xs font-medium cursor-pointer transition-all space-y-1 group"
                          style={{
                            background: '#FFFFFF',
                            border: '1px solid #FECACA',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
                          }}
                          title={`Click to view full details: ${b.eventTitle}`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold truncate text-[11px] leading-tight" style={{color:'#111827'}}>
                              {b.eventTitle}
                            </span>
                            <Eye className="w-3 h-3 opacity-60 group-hover:opacity-100 shrink-0" style={{color:'#DC2626'}} />
                          </div>

                          <div className="text-[10px] font-semibold truncate" style={{color:'#B91C1C'}}>
                            {b.venueName} {b.roomNumber && `(${b.roomNumber})`} • {b.organizer}
                          </div>

                          <div className="text-[9px] font-mono flex items-center gap-1 font-semibold" style={{color:'#4B5563'}}>
                            <Clock className="w-2.5 h-2.5 shrink-0" style={{color:'#DC2626'}} />
                            <span>{formatTime12H(b.startTime)} - {formatTime12H(b.endTime)}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-[11px] py-3 text-center italic" style={{color:'#9CA3AF'}}>
                        No events booked
                      </div>
                    )}
                  </div>

                  {/* Day Footer Action */}
                  <div className="pt-2 border-t flex items-center justify-between gap-1 text-[10px]" style={{borderColor: isSelected || isToday ? '#FECACA' : '#E5E7EB'}}>
                    <span className="font-medium truncate" style={{color:'#6B7280'}}>
                      {dayBookings.length > 0 ? 'Click to inspect' : 'Free all day'}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSlotClick(venues[0], item.dateStr, '10:00');
                      }}
                      className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all duration-150 shadow-xs hover:shadow-sm active:scale-95 group/btn"
                      style={{
                        background: '#FEF2F2',
                        color: '#B91C1C',
                        border: '1px solid #FECACA'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#DC2626';
                        e.currentTarget.style.color = '#FFFFFF';
                        e.currentTarget.style.borderColor = '#DC2626';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#FEF2F2';
                        e.currentTarget.style.color = '#B91C1C';
                        e.currentTarget.style.borderColor = '#FECACA';
                      }}
                      title={`Book a venue on ${formatDateFriendly(item.dateStr)}`}
                    >
                      <Plus className="w-3 h-3 transition-transform duration-200 group-hover/btn:rotate-90 stroke-[2.5]" />
                      <span>Book</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>

          {/* Selected Day Inspector Drawer */}
          {selectedMonthDay && (() => {
            const selectedDayBlockBooking = selectedDayBookings.find(b => (b.isDayBlock || (b.eventId && b.eventId.startsWith('BLK-'))));
            const isSelectedDayBlocked = Boolean(selectedDayBlockBooking);

            return (
              <div className="glass-panel p-5 rounded-2xl border space-y-4 shadow-xl animate-fade-in bg-white"
                style={{borderColor:'#FCA5A5'}}>
                
                {/* Lockdown Active Banner in Inspector */}
                {isSelectedDayBlocked && (
                  <div className="bg-red-50 border border-red-300 p-3.5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 border border-red-300 flex items-center justify-center shrink-0">
                        <Lock className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-extrabold text-gray-900 text-sm flex items-center gap-2">
                          <span>Campus-Wide Lockdown Active: {selectedDayBlockBooking.eventTitle}</span>
                          <span className="badge font-bold text-[10px]" style={{ background: '#FEE2E2', color: '#991B1B', borderColor: '#FCA5A5' }}>
                            ALL VENUES BLOCKED
                          </span>
                        </div>
                        <p className="text-red-800 text-[11px] font-medium mt-0.5">
                          All campus facilities reserved by {selectedDayBlockBooking.organizer} ({formatTime12H(selectedDayBlockBooking.startTime)} - {formatTime12H(selectedDayBlockBooking.endTime)})
                        </p>
                      </div>
                    </div>
                    {currentUser?.isUnionAdmin && onUnblockDay && (
                      <button
                        onClick={() => onUnblockDay(selectedDayBlockBooking.eventId)}
                        className="btn-secondary text-xs py-1.5 px-3 font-bold hover:bg-red-100 hover:text-red-800 border-red-300 shrink-0 flex items-center gap-1.5"
                      >
                        <Unlock className="w-3.5 h-3.5 text-red-600" />
                        <span>Unblock All Venues</span>
                      </button>
                    )}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center border"
                      style={{background:'#FEE2E2', borderColor:'#FCA5A5'}}>
                      <Calendar className="w-4 h-4" style={{color:'#DC2626'}} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold" style={{color:'#000000'}}>
                        {formatDateFriendly(selectedMonthDay)} — Bookings & Schedule
                      </h3>
                      <p className="text-xs" style={{color:'#555555'}}>
                        {selectedDayBookings.length} confirmed venue {selectedDayBookings.length === 1 ? 'reservation' : 'reservations'} on this date • Click any event card to view full details
                      </p>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Admin Block Day CTA */}
                    {currentUser?.isUnionAdmin && !isSelectedDayBlocked && (
                      <button
                        onClick={() => {
                          setQuickBlockTargetDate(selectedMonthDay);
                          setQuickBlockTitle('College Union Day 2026');
                          setQuickBlockModalOpen(true);
                        }}
                        className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 font-bold hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                        title="Block all campus venues for this date"
                      >
                        <Lock className="w-3.5 h-3.5 text-red-600" />
                        <span>Block All Venues</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setSelectedDate(selectedMonthDay);
                        setViewMode('daily');
                      }}
                      className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
                    >
                      <Clock className="w-3.5 h-3.5" style={{color:'#DC2626'}} />
                      <span>View Hourly Timeline</span>
                    </button>
                    <button
                      onClick={() => onSlotClick(venues[0], selectedMonthDay, '10:00')}
                      className="btn-primary text-xs py-1.5 px-3.5 flex items-center gap-1.5 font-bold shadow-sm hover:shadow-md transition-all active:scale-95 group"
                    >
                      <Plus className="w-3.5 h-3.5 transition-transform group-hover:rotate-90 stroke-[2.5]" />
                      <span>Book on this Date</span>
                    </button>
                  </div>
                </div>

              {/* Day's Event List (Clickable cards to view full event details) */}
              {selectedDayBookings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {selectedDayBookings.map((b) => (
                    <div
                      key={b.id}
                      onClick={() => setSelectedEventForDetails(b)}
                      className="p-3.5 rounded-xl border space-y-2 text-xs hover:border-red-300 cursor-pointer transition-all shadow-xs group"
                      style={{background:'#F9FAFB', borderColor:'#E5E7EB'}}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded border"
                          style={{background:'#FEE2E2', color:'#7F1D1D', borderColor:'#FCA5A5'}}>
                          {b.id}
                        </span>
                        <span className="badge badge-available text-[9px] py-0.5 flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Confirmed
                        </span>
                      </div>

                      <div>
                        <div className="font-bold text-sm line-clamp-1 transition-colors" style={{color:'#000000'}}>
                          {b.eventTitle}
                        </div>
                        <div className="text-[11px] font-semibold" style={{color:'#B91C1C'}}>{b.organizer}</div>
                      </div>

                      <div className="space-y-1 p-2 rounded-lg border text-[11px]" style={{background:'#FFFFFF', borderColor:'#E5E7EB'}}>
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 shrink-0" style={{color:'#DC2626'}} />
                          <span className="font-medium" style={{color:'#111827'}}>
                            {b.venueName} {b.roomNumber && <span className="font-mono font-bold" style={{color:'#B91C1C'}}>({b.roomNumber})</span>}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 font-mono font-semibold" style={{color:'#4B5563'}}>
                          <Clock className="w-3.5 h-3.5 shrink-0" style={{color:'#DC2626'}} />
                          <span>{formatTime12H(b.startTime)} - {formatTime12H(b.endTime)}</span>
                        </div>
                      </div>

                      <div className="text-[10px] flex items-center justify-end gap-1 font-medium pt-1 opacity-80 group-hover:opacity-100" style={{color:'#B91C1C'}}>
                        <Eye className="w-3 h-3" /> Click to view details
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-xs space-y-2 rounded-xl border" style={{background:'#F9FAFB', borderColor:'#E5E7EB'}}>
                  <CheckCircle2 className="w-8 h-8 mx-auto" style={{color:'#10B981'}} />
                  <p className="font-semibold" style={{color:'#111827'}}>No events booked on this date</p>
                  <p style={{color:'#6B7280'}}>All campus auditoriums, activity spaces, and classrooms are wide open for reservation.</p>
                </div>
              )}
            </div>
          );
        })()}

        </div>
      )}

      {/* =========================================================================
          VIEW 2: DAILY HOURLY MATRIX
          ========================================================================= */}
      {viewMode === 'daily' && (() => {
        const dailyDayBlock = activeBookings.find(b => b.date === selectedDate && (b.isDayBlock || (b.eventId && b.eventId.startsWith('BLK-'))));

        return (
          <div className="space-y-4 sm:space-y-6">
            
            {/* Daily Date Controls Bar */}
            <div className="glass-panel p-3 sm:p-4 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-4 border border-gray-200 bg-white shadow-xs">
              <div className="flex items-center justify-between sm:justify-start gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap">
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <button
                    onClick={() => setDatePreset('today')}
                    className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-all border"
                    style={selectedDate === '2026-09-05'
                      ? { background: '#B91C1C', color: '#FFFFFF', borderColor: '#7F1D1D', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }
                      : { background: '#FFFFFF', color: '#374151', borderColor: '#E5E7EB' }
                    }
                  >
                    Today
                  </button>
                  <button
                    onClick={() => setDatePreset('tomorrow')}
                    className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-all border"
                    style={selectedDate === '2026-09-06'
                      ? { background: '#B91C1C', color: '#FFFFFF', borderColor: '#7F1D1D', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }
                      : { background: '#FFFFFF', color: '#374151', borderColor: '#E5E7EB' }
                    }
                  >
                    Tomorrow
                  </button>
                </div>
                
                <div className="flex items-center gap-1 sm:gap-1.5 ml-auto sm:ml-2">
                  <button
                    onClick={() => changeDateByDays(-1)}
                    className="p-1 sm:p-1.5 rounded-lg bg-gray-50 text-gray-700 hover:text-red-700 hover:bg-gray-100 border border-gray-200 transition-colors"
                    title="Previous Day"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="input-field text-[11px] sm:text-xs font-mono py-1 px-2 sm:px-2.5 w-auto"
                    style={{color:'#111827'}}
                  />
                  <button
                    onClick={() => changeDateByDays(1)}
                    className="p-1 sm:p-1.5 rounded-lg bg-gray-50 text-gray-700 hover:text-red-700 hover:bg-gray-100 border border-gray-200 transition-colors"
                    title="Next Day"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap justify-between sm:justify-end">
                <button
                  onClick={() => setSearchModalOpen(true)}
                  className="btn-secondary text-[11px] sm:text-xs py-1 sm:py-1.5 px-2.5 sm:px-3 flex items-center gap-1.5 font-bold hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-all"
                  title="Search events across schedule matrix"
                >
                  <Search className="w-3.5 h-3.5 text-red-600" />
                  <span>Search Events</span>
                </button>

                {currentUser?.isUnionAdmin && !dailyDayBlock && (
                  <button
                    onClick={() => {
                      setQuickBlockTargetDate(selectedDate);
                      setQuickBlockTitle('College Union Day 2026');
                      setQuickBlockModalOpen(true);
                    }}
                    className="btn-secondary text-[11px] sm:text-xs py-1 sm:py-1.5 px-2.5 sm:px-3 flex items-center gap-1.5 font-bold hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                    title="Block all campus venues for this date"
                  >
                    <Lock className="w-3.5 h-3.5 text-red-600" />
                    <span>Block Date</span>
                  </button>
                )}

                <div className="text-[11px] sm:text-xs font-semibold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border text-center sm:text-left" style={{background:'#F9FAFB', borderColor:'#E5E7EB', color:'#111827'}}>
                  📅 {formatDateFriendly(selectedDate)}
                </div>
              </div>
            </div>

            {/* Day Lockdown Active Banner in Daily Matrix */}
            {dailyDayBlock && (
              <div className="bg-red-50 border border-red-300 p-3.5 sm:p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-red-100 text-red-700 border border-red-300 flex items-center justify-center shrink-0">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-extrabold text-gray-900 text-sm flex items-center gap-2">
                      <span>Campus-Wide Lockdown Active: {dailyDayBlock.eventTitle}</span>
                      <span className="badge font-bold text-[10px]" style={{ background: '#FEE2E2', color: '#991B1B', borderColor: '#FCA5A5' }}>
                        ALL VENUES BLOCKED
                      </span>
                    </div>
                    <p className="text-red-800 text-[11px] font-medium mt-0.5">
                      All campus facilities reserved by {dailyDayBlock.organizer} ({formatTime12H(dailyDayBlock.startTime)} - {formatTime12H(dailyDayBlock.endTime)})
                    </p>
                  </div>
                </div>
                {currentUser?.isUnionAdmin && onUnblockDay && (
                  <button
                    onClick={() => onUnblockDay(dailyDayBlock.eventId)}
                    className="btn-secondary text-xs py-1.5 px-3 font-bold hover:bg-red-100 hover:text-red-800 border-red-300 shrink-0 flex items-center gap-1.5"
                  >
                    <Unlock className="w-3.5 h-3.5 text-red-600" />
                    <span>Unblock All Venues</span>
                  </button>
                )}
              </div>
            )}

          {/* Matrix Legend & Quick Search */}
          <div className="flex items-center justify-between gap-3 text-[11px] sm:text-xs p-2.5 sm:p-3 rounded-xl border flex-wrap sm:flex-nowrap" style={{background:'#F9FAFB', borderColor:'#E5E7EB', color:'#6B7280'}}>
            <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar whitespace-nowrap">
              <span className="font-bold text-[11px] mr-1" style={{color:'#111827'}}>Legend:</span>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded" style={{background:'#D1FAE5', border:'1px solid #10B981'}} />
                <span>Available Slot (Click to Book)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded" style={{background:'#FEE2E2', border:'1px solid #EF4444'}} />
                <span>Occupied Event (Click to View Details)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded" style={{background:'#E5E7EB', border:'1px solid #D1D5DB'}} />
                <span>Under Maintenance</span>
              </div>
            </div>

            <button
              onClick={() => setSearchModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-all shrink-0 ml-auto shadow-2xs"
              title="Search events across schedule matrix (Cmd+K)"
            >
              <Search className="w-3.5 h-3.5 text-red-600" />
              <span>Search Events</span>
            </button>
          </div>

          {/* The Live Matrix Table */}
          <div id="hourly-matrix-table" className="glass-panel rounded-2xl border overflow-hidden shadow-sm sm:shadow-xl bg-white scroll-mt-20" style={{borderColor:'#E5E7EB'}}>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left min-w-[700px] sm:min-w-[900px]">
                <thead>
                  <tr className="border-b text-[11px] sm:text-xs font-bold uppercase tracking-wider" style={{background:'#F9FAFB', borderColor:'#E5E7EB', color:'#4B5563'}}>
                    <th className="p-2.5 sm:p-4 sticky left-0 z-20 border-r min-w-[130px] sm:min-w-[190px] max-w-[140px] sm:max-w-[200px]" style={{background:'#F9FAFB', borderColor:'#E5E7EB'}}>
                      Campus Venue
                    </th>
                    {timeSlots.map((slot) => (
                      <th key={slot} className="p-2 sm:p-3 text-center min-w-[55px] sm:min-w-[70px] border-r font-mono text-[10px] sm:text-[11px]" style={{borderColor:'#E5E7EB'}}>
                        {formatTime12H(slot).replace(':00', '')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y text-xs" style={{borderColor:'#F3F4F6'}}>
                  {venues.map((venue) => (
                    <tr key={venue.id} className="hover:bg-gray-50/50 transition-colors">
                      
                      {/* Sticky Venue Header Column */}
                      <td className="p-2 sm:p-3.5 sticky left-0 z-10 border-r backdrop-blur-md max-w-[130px] sm:max-w-[190px]" style={{background:'#FFFFFF', borderColor:'#E5E7EB'}}>
                        <div className="font-bold truncate text-xs sm:text-sm" style={{color:'#111827'}} title={venue.name}>
                          {venue.name}
                        </div>
                        <div className="text-[10px] sm:text-[11px] flex items-center gap-1 mt-0.5 truncate" style={{color:'#6B7280'}}>
                          <span className="truncate">{venue.type}</span> • <span className="font-semibold shrink-0" style={{color:'#B91C1C'}}>{venue.capacity === 'NA' ? 'NA' : `${venue.capacity} seats`}</span>
                        </div>
                      </td>

                      {/* Hourly Slot Cells */}
                      {timeSlots.map((slot) => {
                        const slotState = getSlotState(venue.id, slot);
                        
                        if (venue.status === 'Maintenance') {
                          return (
                            <td key={slot} className="p-0.5 sm:p-1 border-r text-center min-w-[55px] sm:min-w-[70px]" style={{borderColor:'#F3F4F6', background:'#F9FAFB'}}>
                              <div className="w-full h-9 sm:h-11 rounded-md sm:rounded-lg border flex items-center justify-center text-[9px] sm:text-[10px] font-medium" style={{background:'#F3F4F6', borderColor:'#E5E7EB', color:'#9CA3AF'}}>
                                Maint
                              </div>
                            </td>
                          );
                        }

                        if (slotState.isOccupied) {
                          const isHighlighted = slotState.booking.id === highlightedBookingId;
                          return (
                            <td key={slot} className="p-0.5 sm:p-1 border-r relative group min-w-[55px] sm:min-w-[70px]" style={{borderColor:'#F3F4F6'}}>
                              <div 
                                onClick={() => setSelectedEventForDetails(slotState.booking)}
                                className={`w-full h-9 sm:h-11 rounded-md sm:rounded-lg p-1 sm:p-1.5 flex flex-col justify-center transition-all cursor-pointer border text-white shadow-xs hover:scale-[1.02] ${isHighlighted ? 'ring-2 ring-amber-400 ring-offset-1 animate-pulse' : ''}`}
                                style={{
                                  background: isHighlighted ? '#B91C1C' : '#DC2626', 
                                  borderColor: isHighlighted ? '#F59E0B' : '#B91C1C'
                                }}
                                title="Click to view full event details"
                              >
                                <span className="font-bold truncate text-[9px] sm:text-[10px] block text-white leading-tight">
                                  {slotState.booking.eventTitle}
                                </span>
                                <span className="text-[8px] sm:text-[9px] opacity-90 truncate block text-red-100 font-medium leading-tight">
                                  {slotState.booking.organizer}
                                </span>
                              </div>

                              {/* Quick Hover Tooltip */}
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-30 w-64 glass-panel p-3 rounded-xl border border-gray-200 shadow-2xl bg-white text-xs pointer-events-none">
                                <div className="font-bold mb-0.5" style={{color:'#000000'}}>{slotState.booking.eventTitle}</div>
                                <div className="font-semibold text-[11px] mb-1" style={{color:'#B91C1C'}}>{slotState.booking.organizer}</div>
                                {slotState.booking.roomNumber && (
                                  <div className="font-mono text-[10px] mb-1 font-semibold" style={{color:'#374151'}}>
                                    Room: {slotState.booking.roomNumber}
                                  </div>
                                )}
                                <div className="text-[10px] font-mono" style={{color:'#6B7280'}}>
                                  Time: {formatTime12H(slotState.booking.startTime)} - {formatTime12H(slotState.booking.endTime)}
                                </div>
                                <div className="text-[10px] font-bold mt-1 flex items-center gap-1" style={{color:'#059669'}}>
                                  <Eye className="w-3 h-3" /> Click slot to view details
                                </div>
                              </div>
                            </td>
                          );
                        }

                        {/* Free Slot */}
                        return (
                          <td key={slot} className="p-0.5 sm:p-1 border-r min-w-[55px] sm:min-w-[70px]" style={{borderColor:'#F3F4F6'}}>
                            <button
                              onClick={() => onSlotClick(venue, selectedDate, slot)}
                              className="w-full h-9 sm:h-11 rounded-md sm:rounded-lg transition-all flex items-center justify-center group border"
                              style={{background:'#F0FDF4', borderColor:'#DCFCE7'}}
                              onMouseEnter={(e) => { e.currentTarget.style.background = '#DCFCE7'; e.currentTarget.style.borderColor = '#86EFAC'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = '#F0FDF4'; e.currentTarget.style.borderColor = '#DCFCE7'; }}
                              title={`Book ${venue.name} at ${formatTime12H(slot)}`}
                            >
                              <span className="text-[9px] sm:text-[10px] font-bold opacity-0 group-hover:opacity-100" style={{color:'#166534'}}>
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
        );
      })()}

      {/* Full Event Details Modal with Error Boundary */}
      {selectedEventForDetails && (
        <ErrorBoundary
          title="Unable to Display Event Details"
          onReset={() => setSelectedEventForDetails(null)}
        >
          <EventDetailsModal
            event={selectedEventForDetails}
            venue={venues.find(v => v.id === selectedEventForDetails.venueId)}
            onClose={() => setSelectedEventForDetails(null)}
            currentUser={currentUser}
            onAdminRevokeClick={onAdminCancelBooking ? (event) => onAdminCancelBooking(event.id, 'Revoked by Union Admin from Live Matrix') : null}
            onClubCancelClick={onClubCancelBooking ? (bookingId, reason, cancelPackage) => onClubCancelBooking(bookingId, reason, cancelPackage) : null}
            allBookings={bookings}
          />
        </ErrorBoundary>
      )}

      {/* =========================================================================
          EVENT SEARCH MODAL (Live Schedule Matrix)
          ========================================================================= */}
      {searchModalOpen && (
        <div 
          className="modal-overlay animate-fade-in" 
          onClick={(e) => { if (e.target === e.currentTarget) setSearchModalOpen(false); }}
        >
          <div 
            className="glass-panel w-full max-w-2xl rounded-2xl sm:rounded-3xl border border-gray-200 bg-white shadow-2xl flex flex-col max-h-[90vh] sm:max-h-[85vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Modal Top Header (Sticky) */}
            <div className="p-4 sm:p-5 pb-3 border-b border-gray-100 flex-shrink-0 bg-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 border"
                  style={{ background: '#FEE2E2', borderColor: '#FCA5A5' }}>
                  <Search className="w-4 h-4 sm:w-4.5 sm:h-4.5" style={{ color: '#DC2626' }} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-gray-900 leading-tight">
                    Search Campus Live Schedule
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Find events across all campus venues, societies, dates, and times
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSearchModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:text-gray-900 hover:bg-gray-200 flex items-center justify-center transition-colors border border-gray-200"
                title="Close (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input & Quick Filter Chips (Sticky) */}
            <div className="p-3.5 sm:p-4 pb-2.5 space-y-2.5 flex-shrink-0 border-b border-gray-100 bg-white">
              {/* Search Input Box */}
              <div className="relative">
                <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-gray-300 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-100 bg-gray-50/70 transition-all">
                  <Search className="w-4 h-4 text-gray-400 shrink-0" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by event title, organizing club, venue, room, date..."
                    className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-gray-900 placeholder-gray-400 font-medium"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors"
                      title="Clear input"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Quick Filter Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-[11px]">
                {[
                  { id: 'all', label: `All Events (${searchCategoryCounts.all})` },
                  { id: 'today', label: `Today (${searchCategoryCounts.today})` },
                  { id: 'upcoming', label: `Upcoming (${searchCategoryCounts.upcoming})` },
                  { id: 'auditorium', label: `Auditoriums (${searchCategoryCounts.auditorium})` },
                  { id: 'activity', label: `Activity Spaces (${searchCategoryCounts.activity})` },
                  { id: 'labs', label: `Labs & Classes (${searchCategoryCounts.labs})` }
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSearchCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-all border shrink-0 whitespace-nowrap ${
                      searchCategory === cat.id
                        ? 'bg-red-600 text-white border-red-700 shadow-xs'
                        : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Results Count Summary */}
              <div className="flex items-center justify-between text-[11px] text-gray-500 px-1 pt-0.5">
                <span>
                  Found <strong className="text-gray-900 font-bold">{filteredSearchResults.length}</strong> {filteredSearchResults.length === 1 ? 'event' : 'events'}
                  {searchQuery ? ` matching "${searchQuery}"` : ''}
                </span>
                <span className="text-[10px] text-gray-400 hidden sm:inline">
                  Click "Inspect" for full details or "View in Matrix" to jump to date
                </span>
              </div>
            </div>

            {/* Scrollable Results List */}
            <div className="overflow-y-auto flex-1 min-h-0 p-3.5 sm:p-4 space-y-2.5 divide-y divide-gray-100">
              {filteredSearchResults.length > 0 ? (
                filteredSearchResults.map((booking) => (
                  <div
                    key={booking.id}
                    className="p-3 sm:p-3.5 rounded-xl border border-gray-200 bg-white hover:border-red-300 hover:shadow-xs transition-all space-y-2 group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded border"
                            style={{ background: '#FEE2E2', color: '#7F1D1D', borderColor: '#FCA5A5' }}>
                            {booking.id}
                          </span>
                          <span className="text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
                            {booking.organizer}
                          </span>
                        </div>
                        <h4 className="font-bold text-xs sm:text-sm text-gray-900 group-hover:text-red-700 transition-colors">
                          {booking.eventTitle}
                        </h4>
                      </div>

                      <span className="badge badge-available text-[9px] py-0.5 shrink-0">
                        <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" /> Confirmed
                      </span>
                    </div>

                    {/* Venue & Time details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-100">
                      <div className="flex items-center gap-1.5 truncate">
                        <Building2 className="w-3.5 h-3.5 text-red-600 shrink-0" />
                        <span className="font-medium truncate text-gray-800">
                          {booking.venueName} {booking.roomNumber && <span className="font-mono text-red-700">({booking.roomNumber})</span>}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-red-600 shrink-0" />
                        <span className="font-semibold text-gray-800">
                          {formatDateFriendly(booking.date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 sm:col-span-2 font-mono text-[10px]">
                        <Clock className="w-3.5 h-3.5 text-red-600 shrink-0" />
                        <span>{formatTime12H(booking.startTime)} – {formatTime12H(booking.endTime)}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => handleJumpToEventInMatrix(booking)}
                        className="btn-secondary text-[11px] py-1 px-2.5 font-bold flex items-center gap-1 hover:bg-gray-100"
                        title="Jump to this date in hourly matrix"
                      >
                        <Clock className="w-3 h-3 text-red-600" />
                        <span>View in Matrix</span>
                        <ArrowRight className="w-3 h-3 text-gray-400" />
                      </button>

                      <button
                        onClick={() => handleInspectFromSearch(booking)}
                        className="btn-primary text-[11px] py-1 px-3 font-bold flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Inspect Details</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 space-y-2">
                  <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
                    <Search className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-gray-900">No matching events found</h4>
                  <p className="text-xs text-gray-500 max-w-xs mx-auto">
                    No bookings found matching "{searchQuery}". Try searching by another keyword or reset the filter.
                  </p>
                  <button
                    onClick={() => { setSearchQuery(''); setSearchCategory('all'); }}
                    className="btn-secondary text-xs py-1 px-3 font-semibold mt-2"
                  >
                    Clear Filter
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer (Sticky) */}
            <div className="p-3 sm:p-4 border-t border-gray-100 flex-shrink-0 bg-white flex items-center justify-between text-xs text-gray-500">
              <span className="hidden sm:inline text-[11px]">
                Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-gray-100 font-mono text-[10px] text-gray-700 border">Esc</kbd> to exit search
              </span>
              <button
                onClick={() => setSearchModalOpen(false)}
                className="btn-secondary text-xs py-1.5 px-4 font-bold ml-auto"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* QUICK BLOCK ALL VENUES MODAL (Admin) */}
      {quickBlockModalOpen && (
        <div className="modal-overlay animate-fade-in" onClick={(e) => { if (e.target === e.currentTarget) setQuickBlockModalOpen(false); }}>
          <div className="glass-panel w-full max-w-lg rounded-3xl border border-red-200 p-5 sm:p-7 relative bg-white shadow-2xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-gray-900">Block All Campus Venues for a Day</h3>
                <p className="text-xs text-gray-600">
                  {formatDateFriendly(quickBlockTargetDate)} • Full Campus Lockdown ({venues.length} Facilities)
                </p>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (onBlockAllVenues) {
                  onBlockAllVenues({
                    date: quickBlockTargetDate,
                    eventTitle: quickBlockTitle.trim(),
                    organizer: quickBlockOrganizer.trim(),
                    startTime: quickBlockStartTime,
                    endTime: quickBlockEndTime,
                    description: `All campus facilities reserved for ${quickBlockTitle.trim()}`,
                    autoRevokeConflicts: quickBlockAutoRevoke
                  });
                }
                setQuickBlockModalOpen(false);
              }}
              className="space-y-4 text-xs"
            >
              <div className="space-y-1.5">
                <label className="font-bold text-gray-700">Lockdown Reason / Event Title:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. College Day 2026, Union Arts Fest..."
                  value={quickBlockTitle}
                  onChange={(e) => setQuickBlockTitle(e.target.value)}
                  className="input-field text-xs w-full"
                />
                <div className="flex items-center gap-1 flex-wrap pt-1">
                  {['College Day 2026', 'Union Arts Fest', 'Excel 2026', 'Tech Symposium', 'Union Elections', 'Sports Meet'].map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setQuickBlockTitle(preset)}
                      className={`text-[10px] px-2 py-0.5 rounded-lg border font-semibold ${
                        quickBlockTitle === preset
                          ? 'bg-red-50 text-red-800 border-red-300'
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-gray-700">Authority / Organizing Body:</label>
                <select
                  value={quickBlockOrganizer}
                  onChange={(e) => setQuickBlockOrganizer(e.target.value)}
                  className="input-field text-xs w-full cursor-pointer"
                >
                  <option value="College Student Union (Union MEC)">College Student Union (Union MEC)</option>
                  <option value="Excel (Annual Tech Fest)">Excel (Annual Tech Fest)</option>
                  <option value="Excel MEC">Excel MEC</option>
                  <option value="Principal & Senate Office">Principal &amp; Senate Office</option>
                  <option value="Staff Council & Administration">Staff Council &amp; Administration</option>
                  <option value="Physical Education Dept">Physical Education Dept</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Start Time:</label>
                  <select
                    value={quickBlockStartTime}
                    onChange={(e) => setQuickBlockStartTime(e.target.value)}
                    className="input-field text-xs font-mono w-full"
                  >
                    {['08:00', '09:00', '10:00', '11:00', '12:00'].map(t => (
                      <option key={t} value={t}>{formatTime12H(t)}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">End Time:</label>
                  <select
                    value={quickBlockEndTime}
                    onChange={(e) => setQuickBlockEndTime(e.target.value)}
                    className="input-field text-xs font-mono w-full"
                  >
                    {['17:00', '18:00', '19:00', '20:00', '21:00', '22:00'].map(t => (
                      <option key={t} value={t}>{formatTime12H(t)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2 pt-2 border-t border-gray-100 font-bold text-gray-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={quickBlockAutoRevoke}
                  onChange={(e) => setQuickBlockAutoRevoke(e.target.checked)}
                  className="rounded text-red-600 focus:ring-red-500"
                />
                <span>Auto-revoke any conflicting bookings on this date</span>
              </label>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setQuickBlockModalOpen(false)}
                  className="btn-secondary text-xs py-2 px-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-danger text-xs py-2 px-4 font-bold flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Lock All {venues.length} Venues</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
