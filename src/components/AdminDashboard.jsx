import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Building2, 
  Calendar, 
  Wrench, 
  User, 
  FileText, 
  AlertTriangle, 
  Sparkles, 
  Search, 
  DoorClosed, 
  Trash2,
  CalendarDays,
  Tag,
  UserCheck,
  UserPlus,
  Lock,
  Unlock,
  Mail,
  ToggleLeft,
  ToggleRight,
  ShieldAlert,
  Layers
} from 'lucide-react';
import { formatDateFriendly, formatTime12H, formatDateTime } from '../utils/availabilityUtils';
import { studentSocieties } from '../data/mockData';

export default function AdminDashboard({ 
  bookings, 
  venues, 
  allowedUsers = [],
  strictAuthEnabled = true,
  initialSubTab = 'active-events',
  onAdminCancelBooking, 
  onAdminDeleteBooking,
  onBlockAllVenues,
  onUnblockDay,
  onAddAllowedUser,
  onRemoveAllowedUser,
  onToggleStrictAuth,
  onToggleVenueStatus 
}) {
  const [activeSubTab, setActiveSubTab] = useState(initialSubTab);
  const [cancelReasonModal, setCancelReasonModal] = useState(null);
  const [reasonText, setReasonText] = useState('');
  const [revokeWholePackage, setRevokeWholePackage] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Day-Wide Venue Block form state
  const [blockDate, setBlockDate] = useState('2026-09-05');
  const [blockTitle, setBlockTitle] = useState('College Day 2026');
  const [blockOrganizer, setBlockOrganizer] = useState('College Student Union (Union MEC)');
  const [blockStartTime, setBlockStartTime] = useState('08:00');
  const [blockEndTime, setBlockEndTime] = useState('20:00');
  const [blockDescription, setBlockDescription] = useState('All campus facilities reserved exclusively for Union MEC Institutional Event.');
  const [autoRevokeConflicts, setAutoRevokeConflicts] = useState(true);
  const [unblockTargetModal, setUnblockTargetModal] = useState(null);

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  // Group active day blocks by eventId or date
  const dayBlockMap = {};
  bookings.filter(b => (b.status === 'confirmed' || b.status === 'approved') && (b.isDayBlock || (b.eventId && b.eventId.startsWith('BLK-')))).forEach(b => {
    const key = b.eventId || b.date;
    if (!dayBlockMap[key]) {
      dayBlockMap[key] = {
        eventId: key,
        date: b.date,
        eventTitle: b.eventTitle,
        organizer: b.organizer,
        startTime: b.startTime,
        endTime: b.endTime,
        createdAt: b.createdAt,
        venuesCount: 0,
        venuesList: []
      };
    }
    dayBlockMap[key].venuesCount += 1;
    if (!dayBlockMap[key].venuesList.includes(b.venueName)) {
      dayBlockMap[key].venuesList.push(b.venueName);
    }
  });
  const activeDayBlocks = Object.values(dayBlockMap);

  // Active bookings on the selected blockDate for conflict detection
  const existingBookingsOnBlockDate = bookings.filter(b => 
    b.date === blockDate && 
    (b.status === 'confirmed' || b.status === 'approved') &&
    !b.isDayBlock &&
    !(b.eventId && b.eventId.startsWith('BLK-'))
  );

  // Handle Day Block Form Submit
  const handleBlockSubmit = (e) => {
    e.preventDefault();
    if (!blockDate || !blockTitle.trim()) return;

    if (onBlockAllVenues) {
      onBlockAllVenues({
        date: blockDate,
        eventTitle: blockTitle.trim(),
        organizer: blockOrganizer.trim(),
        startTime: blockStartTime,
        endTime: blockEndTime,
        description: blockDescription.trim(),
        autoRevokeConflicts
      });
    }
  };

  // New allowed user form state
  const [newEmail, setNewEmail] = useState('');
  const [newSociety, setNewSociety] = useState(studentSocieties[0] || 'IEDC');
  const [newNote, setNewNote] = useState('');

  const activeBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'approved');
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled' || b.status === 'rejected');

  const filteredActiveBookings = activeBookings.filter(b => 
    b.eventTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.organizer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.venueName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.contactEmail && b.contactEmail.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleConfirmCancel = () => {
    if (cancelReasonModal) {
      onAdminCancelBooking(
        cancelReasonModal.id, 
        reasonText || 'Cancelled by Union Admin: Administrative priority / Official college requirement.',
        revokeWholePackage
      );
      setCancelReasonModal(null);
      setReasonText('');
    }
  };

  const handleConfirmDelete = () => {
    if (cancelReasonModal && onAdminDeleteBooking) {
      onAdminDeleteBooking(
        cancelReasonModal.id,
        revokeWholePackage
      );
      setCancelReasonModal(null);
      setReasonText('');
    }
  };

  const handleAddUserSubmit = (e) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    if (onAddAllowedUser) {
      onAddAllowedUser({
        email: newEmail.trim().toLowerCase(),
        society: newSociety,
        note: newNote.trim() || `${newSociety} Representative`
      });
    }

    setNewEmail('');
    setNewNote('');
  };

  return (
    <div className="space-y-6">
      
      {/* Admin Header Banner */}
      <div className="glass-panel p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-200 bg-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-gray-50 p-1.5 rounded-2xl border border-gray-200 shrink-0">
            <img src="/mec_college_logo.webp" alt="MEC" className="w-8 h-8 sm:w-9 sm:h-9 object-contain rounded-lg bg-white p-0.5 border border-gray-200" />
            <img src="/union_mec_logo.webp" alt="Union MEC" className="w-8 h-8 sm:w-9 sm:h-9 object-contain rounded-lg bg-white p-0.5 border border-gray-200" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight truncate">Union MEC Executive Portal</h2>
              <span className="badge font-bold text-[10px]" style={{ background: '#FEE2E2', color: '#B91C1C', borderColor: '#FCA5A5' }}>
                ADMIN CONTROL
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-0.5">
              Govt. Model Engineering College • Master booking oversight, organizer email authorization & facility maintenance.
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 sm:flex items-center gap-2 sm:gap-3 text-xs w-full md:w-auto">
          <div className="bg-gray-50 px-2.5 sm:px-3.5 py-2 rounded-xl border border-gray-200 text-center">
            <div className="text-emerald-700 font-extrabold text-base sm:text-lg">{activeBookings.length}</div>
            <div className="text-gray-600 text-[10px] font-semibold truncate">Active Bookings</div>
          </div>
          <div className="bg-gray-50 px-2.5 sm:px-3.5 py-2 rounded-xl border border-gray-200 text-center">
            <div className="text-red-700 font-extrabold text-base sm:text-lg">{allowedUsers.length + 1}</div>
            <div className="text-gray-600 text-[10px] font-semibold truncate">Allowed Accts</div>
          </div>
          <div className="bg-gray-50 px-2.5 sm:px-3.5 py-2 rounded-xl border border-gray-200 text-center">
            <div className="text-gray-900 font-extrabold text-base sm:text-lg">{venues.length}</div>
            <div className="text-gray-600 text-[10px] font-semibold truncate">Total Venues</div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveSubTab('active-events')}
          className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
            activeSubTab === 'active-events'
              ? 'bg-red-600 text-white shadow-sm'
              : 'text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 border border-gray-200'
          }`}
        >
          <CheckCircle2 className={`w-4 h-4 ${activeSubTab === 'active-events' ? 'text-white' : 'text-emerald-600'}`} />
          Active Bookings & Revocation ({activeBookings.length})
        </button>

        <button
          onClick={() => setActiveSubTab('all-history')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'all-history'
              ? 'bg-red-600 text-white shadow-sm'
              : 'text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 border border-gray-200'
          }`}
        >
          <Calendar className={`w-4 h-4 ${activeSubTab === 'all-history' ? 'text-white' : 'text-red-600'}`} />
          Master Event History ({bookings.length})
        </button>

        <button
          onClick={() => setActiveSubTab('access-control')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'access-control'
              ? 'bg-red-600 text-white shadow-sm'
              : 'text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 border border-gray-200'
          }`}
        >
          <UserCheck className={`w-4 h-4 ${activeSubTab === 'access-control' ? 'text-white' : 'text-amber-600'}`} />
          Authorized Gmail Accounts ({allowedUsers.length})
        </button>

        <button
          onClick={() => setActiveSubTab('day-block')}
          className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
            activeSubTab === 'day-block'
              ? 'bg-red-600 text-white shadow-sm'
              : 'text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 border border-gray-200'
          }`}
        >
          <Lock className={`w-4 h-4 ${activeSubTab === 'day-block' ? 'text-white' : 'text-red-600'}`} />
          Block All Venues (Day Lockdown) ({activeDayBlocks.length})
        </button>

        <button
          onClick={() => setActiveSubTab('venue-maintenance')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'venue-maintenance'
              ? 'bg-red-600 text-white shadow-sm'
              : 'text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 border border-gray-200'
          }`}
        >
          <Wrench className={`w-4 h-4 ${activeSubTab === 'venue-maintenance' ? 'text-white' : 'text-gray-600'}`} />
          Venue Maintenance & Controls ({venues.length})
        </button>
      </div>

      {/* TAB 1: ACTIVE BOOKINGS & REVOCATION CONSOLE */}
      {activeSubTab === 'active-events' && (
        <div className="space-y-4">
          
          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search active bookings by title, society, venue or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-9 py-2 text-xs"
            />
          </div>

          {filteredActiveBookings.length > 0 ? (
            filteredActiveBookings.map((b) => (
              <div
                key={b.id}
                className="glass-panel p-5 rounded-2xl border border-gray-200 bg-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-red-400 transition-all shadow-sm"
              >
                <div className="space-y-3 flex-1">
                  
                  {/* Top Header */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-red-900 bg-red-50 px-2.5 py-1 rounded-lg border border-red-200">
                      {b.id}
                    </span>
                    {b.eventId && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-red-50 text-red-800 border-red-200">
                        Event: {b.eventId}
                      </span>
                    )}
                    <span className="badge badge-available">
                      <CheckCircle2 className="w-3 h-3" /> Confirmed Permit
                    </span>
                  </div>

                  {/* Event Title & Society */}
                  <div>
                    <h3 className="text-base font-bold text-gray-900 leading-snug">{b.eventTitle}</h3>
                    <p className="text-xs text-red-700 font-semibold mt-0.5">
                      {b.organizer} {b.contactEmail && <span className="text-gray-600 font-mono font-normal">({b.contactEmail})</span>}
                    </p>
                  </div>

                  {/* Scheduled Date/Time & Booking Submission Time */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs pt-0.5">
                    
                    {/* Venue */}
                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200">
                      <Building2 className="w-4 h-4 text-red-600 shrink-0" />
                      <div>
                        <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Venue</div>
                        <span className="font-bold text-gray-900 truncate block">
                          {b.venueName} {b.roomNumber && <span className="text-red-700 font-mono">({b.roomNumber})</span>}
                        </span>
                      </div>
                    </div>

                    {/* Event Scheduled Date & Time */}
                    <div className="flex items-center gap-2 bg-red-50 px-3 py-2 rounded-xl border border-red-200">
                      <Calendar className="w-4 h-4 text-red-600 shrink-0" />
                      <div>
                        <div className="text-[10px] text-red-800 uppercase font-bold tracking-wider">Event Schedule</div>
                        <span className="font-mono text-red-950 font-bold text-[11px] block">
                          {formatDateFriendly(b.date)} • {formatTime12H(b.startTime)} - {formatTime12H(b.endTime)}
                        </span>
                      </div>
                    </div>

                    {/* Booking Submission Timestamp */}
                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200">
                      <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <div className="text-[10px] text-emerald-800 uppercase font-bold tracking-wider">Booking Date & Time</div>
                        <span className="text-gray-900 font-medium text-[11px] block">
                          {formatDateTime(b.createdAt || b.bookedAt)}
                        </span>
                      </div>
                    </div>

                  </div>

                  {/* Description / Notes if available */}
                  {b.description && (
                    <p className="text-[11px] text-gray-700 italic bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                      "{b.description}"
                    </p>
                  )}

                </div>

                {/* Union Admin Revoke Button */}
                <div className="w-full md:w-auto border-t md:border-t-0 border-gray-200 pt-3 md:pt-0 shrink-0">
                  <button
                    onClick={() => setCancelReasonModal(b)}
                    className="btn-danger w-full md:w-auto text-xs justify-center py-2.5 px-4 shadow-red-500/20"
                    title="Cancel this booking with reason"
                  >
                    <XCircle className="w-4 h-4" /> Revoke Permit
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="glass-panel p-12 text-center rounded-2xl border border-gray-200 space-y-2 bg-white shadow-sm">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="text-base font-bold text-gray-900">No Matching Active Bookings</h3>
              <p className="text-xs text-gray-600">
                All bookings are running smoothly or match no query filters.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MASTER EVENT HISTORY */}
      {activeSubTab === 'all-history' && (
        <div className="glass-panel rounded-2xl border border-gray-200 overflow-hidden shadow-sm bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-700 font-bold uppercase tracking-wider">
                  <th className="p-3.5">Tracking ID</th>
                  <th className="p-3.5">Event Title & Society</th>
                  <th className="p-3.5">Venue & Room</th>
                  <th className="p-3.5">Event Schedule (Date & Time)</th>
                  <th className="p-3.5">Booking Date & Time</th>
                  <th className="p-3.5">Status & Remarks</th>
                  {onAdminDeleteBooking && <th className="p-3.5 text-center">Delete</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                    
                    {/* ID */}
                    <td className="p-3.5">
                      <div className="font-mono font-bold text-red-900 bg-red-50 px-2 py-0.5 rounded border border-red-200 inline-block">
                        {b.id}
                      </div>
                      {b.eventId && (
                        <div className="text-[9px] font-mono font-bold text-red-700 mt-1">
                          {b.eventId}
                        </div>
                      )}
                    </td>

                    {/* Title & Society */}
                    <td className="p-3.5">
                      <div className="font-bold text-gray-900 text-sm">{b.eventTitle}</div>
                      <div className="text-red-700 text-[11px] font-semibold">{b.organizer}</div>
                      {b.contactEmail && (
                        <div className="text-gray-600 text-[10px] font-mono">{b.contactEmail}</div>
                      )}
                    </td>

                    {/* Venue & Room */}
                    <td className="p-3.5 font-semibold text-gray-900">
                      <div className="text-gray-900 font-medium">{b.venueName}</div>
                      {b.roomNumber && (
                        <div className="text-red-700 font-mono text-[11px]">Room: {b.roomNumber}</div>
                      )}
                    </td>

                    {/* Event Schedule (Date & Time) */}
                    <td className="p-3.5 font-mono text-gray-800">
                      <div className="font-bold text-gray-900 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-red-600 shrink-0" />
                        <span>{formatDateFriendly(b.date)}</span>
                      </div>
                      <div className="text-[11px] text-red-700 font-semibold flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-red-600 shrink-0" />
                        <span>{formatTime12H(b.startTime)} - {formatTime12H(b.endTime)}</span>
                      </div>
                    </td>

                    {/* Booking Date & Time (When booked) */}
                    <td className="p-3.5 text-gray-800">
                      <div className="text-[11px] text-emerald-800 font-medium flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{formatDateTime(b.createdAt || b.bookedAt)}</span>
                      </div>
                      <div className="text-[10px] text-gray-500 mt-0.5">Auto-Confirmed</div>
                    </td>

                    {/* Status & Remarks */}
                    <td className="p-3.5">
                      {b.status === 'confirmed' || b.status === 'approved' ? (
                        <span className="badge badge-available">
                          <CheckCircle2 className="w-3 h-3" /> Confirmed
                        </span>
                      ) : (
                        <div>
                          <span className="badge badge-occupied">
                            <XCircle className="w-3 h-3" /> Revoked
                          </span>
                          {b.cancellationReason && (
                            <div className="text-[10px] text-red-800 max-w-xs truncate mt-1 bg-red-50 px-2 py-0.5 rounded border border-red-200" title={b.cancellationReason}>
                              "{b.cancellationReason}"
                            </div>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Admin Purge/Delete Action */}
                    {onAdminDeleteBooking && (
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => onAdminDeleteBooking(b.id)}
                          className="p-1.5 rounded-lg bg-gray-100 text-gray-600 hover:text-red-600 hover:bg-red-50 border border-gray-200 transition-colors"
                          title="Permanently remove this booking from database"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ACCESS CONTROL & ALLOWED GMAIL ACCOUNTS */}
      {activeSubTab === 'access-control' && (
        <div className="space-y-6">
          
          {/* Policy Banner & Strict Mode Switch */}
          <div className="glass-panel p-5 rounded-2xl border border-gray-200 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Gmail Access Control Policy</h3>
                <p className="text-xs text-gray-600">
                  {strictAuthEnabled 
                    ? 'Strict Access Mode Active: ONLY explicitly approved Gmail addresses can sign in & reserve venues.' 
                    : 'Open Mode Active: Any Google user can sign in and book.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => onToggleStrictAuth && onToggleStrictAuth(!strictAuthEnabled)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                strictAuthEnabled 
                  ? 'bg-red-600 text-white border-red-600 hover:bg-red-700 shadow-sm' 
                  : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
              }`}
            >
              {strictAuthEnabled ? <ToggleRight className="w-5 h-5 text-white" /> : <ToggleLeft className="w-5 h-5 text-gray-500" />}
              <span>{strictAuthEnabled ? 'Strict Whitelist Enabled' : 'Strict Whitelist Disabled'}</span>
            </button>
          </div>

          {/* Add Authorized User Form */}
          <div className="glass-panel p-5 rounded-2xl border border-gray-200 bg-white space-y-4 shadow-sm">
            <div className="flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-red-600" />
              <h4 className="text-sm font-bold text-gray-900">Authorize New Gmail Address</h4>
            </div>

            <form onSubmit={handleAddUserSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              <div className="md:col-span-4 space-y-1">
                <label className="text-[11px] font-bold text-gray-700">Google Email Address:</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. iedcmec@gmail.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="input-field pl-9 py-2 text-xs w-full"
                  />
                </div>
              </div>

              <div className="md:col-span-3 space-y-1">
                <label className="text-[11px] font-bold text-gray-700">Official Organizing Body:</label>
                <select
                  value={newSociety}
                  onChange={(e) => setNewSociety(e.target.value)}
                  className="input-field py-2 text-xs w-full"
                >
                  {studentSocieties.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-3 space-y-1">
                <label className="text-[11px] font-bold text-gray-700">Role / Designee Name:</label>
                <input
                  type="text"
                  placeholder="e.g. Secretary / Club Lead"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="input-field py-2 text-xs w-full"
                />
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="btn-primary w-full text-xs py-2 px-3 justify-center"
                >
                  <UserPlus className="w-3.5 h-3.5" /> Grant Access
                </button>
              </div>
            </form>
          </div>

          {/* Allowed Accounts Table */}
          <div className="glass-panel rounded-2xl border border-gray-200 overflow-hidden shadow-sm bg-white">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h4 className="text-xs font-bold text-gray-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Authorized Booking Accounts Whitelist ({allowedUsers.length + 1})</span>
              </h4>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-700 font-bold uppercase tracking-wider">
                    <th className="p-3.5">Google Account Email</th>
                    <th className="p-3.5">Authorized Organizing Body</th>
                    <th className="p-3.5">Role / Designee</th>
                    <th className="p-3.5">Permission Level</th>
                    <th className="p-3.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  
                  {/* Master Union Admin Row */}
                  <tr className="bg-red-50/60 hover:bg-red-50 transition-colors">
                    <td className="p-3.5">
                      <div className="font-mono font-bold text-red-950 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                        <span>senatemec@mec.ac.in</span>
                      </div>
                    </td>
                    <td className="p-3.5 font-bold text-red-700">College Union Senate</td>
                    <td className="p-3.5 text-gray-700 font-medium">Union Senate Executive</td>
                    <td className="p-3.5">
                      <span className="badge font-bold text-[10px]" style={{ background: '#FEE2E2', color: '#B91C1C', borderColor: '#FCA5A5' }}>
                        Master Super Admin
                      </span>
                    </td>
                    <td className="p-3.5 text-center text-gray-500 italic text-[10px]">
                      Permanent
                    </td>
                  </tr>

                  {/* Whitelisted Accounts List */}
                  {allowedUsers.map((u) => (
                    <tr key={u.email} className="hover:bg-gray-50 transition-colors">
                      <td className="p-3.5 font-mono text-gray-900 font-bold">
                        {u.email}
                      </td>
                      <td className="p-3.5 font-bold text-gray-900">
                        {u.society || 'Authorized Body'}
                      </td>
                      <td className="p-3.5 text-gray-600">
                        {u.note || 'Authorized Organizer'}
                      </td>
                      <td className="p-3.5">
                        <span className="badge badge-available text-[10px]">
                          Authorized Booking Access
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => onRemoveAllowedUser && onRemoveAllowedUser(u.email)}
                          className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:text-red-600 hover:bg-red-50 border border-gray-200 transition-colors"
                          title="Revoke booking access for this email"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {allowedUsers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-gray-500 italic">
                        No additional Gmail accounts registered yet. Use the form above to grant access to club leads.
                      </td>
                    </tr>
                  )}

                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 4: VENUE MAINTENANCE & CONTROLS */}
      {activeSubTab === 'venue-maintenance' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {venues.map((venue) => (
            <div key={venue.id} className="glass-panel p-4 rounded-2xl border border-gray-200 flex items-center justify-between gap-4 bg-white shadow-sm">
              <div className="flex items-center gap-3">
                <img src={venue.image} alt={venue.name} className="w-14 h-14 rounded-xl object-cover border border-gray-200" />
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">{venue.name}</h4>
                  <div className="text-xs text-gray-600">{venue.location} • {venue.capacity === 'NA' ? 'NA' : `${venue.capacity} seats`}</div>
                  <div className="text-[11px] font-mono text-red-700 font-semibold">{venue.type}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`badge ${venue.status === 'Available' ? 'badge-available' : 'badge-occupied'}`}>
                  {venue.status}
                </span>
                <button
                  onClick={() => onToggleVenueStatus(venue.id)}
                  className={`text-xs py-1.5 px-3 font-semibold rounded-xl border transition-all ${
                    venue.status === 'Maintenance' 
                      ? 'border-emerald-300 text-emerald-800 bg-emerald-50 hover:bg-emerald-100' 
                      : 'border-red-300 text-red-800 bg-red-50 hover:bg-red-100'
                  }`}
                >
                  {venue.status === 'Maintenance' ? 'Set Available' : 'Set Maintenance'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 5: DAY-WIDE VENUE BLOCK & LOCKDOWN */}
      {activeSubTab === 'day-block' && (
        <div className="space-y-6">
          
          {/* Main Block Form Panel */}
          <div className="glass-panel p-5 sm:p-7 rounded-3xl border border-red-200 bg-white shadow-sm space-y-6">
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center border shrink-0"
                  style={{ background: '#FEE2E2', borderColor: '#FCA5A5' }}>
                  <Lock className="w-5 h-5" style={{ color: '#DC2626' }} />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                    <span>Block All Campus Venues for a Date</span>
                    <span className="badge font-bold text-[10px]" style={{ background: '#FEE2E2', color: '#B91C1C', borderColor: '#FCA5A5' }}>
                      CAMPUS LOCKDOWN
                    </span>
                  </h3>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Instantly reserve and block all {venues.length} campus auditoriums, labs, activity spaces, and classrooms for college-wide events, elections, fests, or administrative holidays.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleBlockSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* 1. Date Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-red-600" />
                    <span>Select Date to Block:</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={blockDate}
                    onChange={(e) => setBlockDate(e.target.value)}
                    className="input-field text-xs font-mono w-full"
                  />
                  {/* Quick Date Presets */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[10px] text-gray-500 font-semibold">Quick:</span>
                    {[
                      { label: 'Today', date: '2026-09-05' },
                      { label: 'Tomorrow', date: '2026-09-06' },
                      { label: 'Sept 10', date: '2026-09-10' },
                      { label: 'Sept 15', date: '2026-09-15' },
                      { label: 'Sept 20', date: '2026-09-20' },
                    ].map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => setBlockDate(p.date)}
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg border transition-all ${
                          blockDate === p.date
                            ? 'bg-red-600 text-white border-red-600'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Event Title & Presets */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-red-600" />
                    <span>Lockdown Reason / Event Title:</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. College Day 2026, Union Arts Fest, Tech Fest..."
                    value={blockTitle}
                    onChange={(e) => setBlockTitle(e.target.value)}
                    className="input-field text-xs w-full"
                  />
                  {/* Quick Title Presets */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[10px] text-gray-500 font-semibold">Presets:</span>
                    {[
                      'College Day 2026',
                      'Union Arts Fest',
                      'Tech Symposium',
                      'Union Elections & Counting',
                      'Annual Sports Meet',
                      'Institutional Holiday / Lockdown'
                    ].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setBlockTitle(preset)}
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg border transition-all ${
                          blockTitle === preset
                            ? 'bg-red-50 text-red-800 border-red-300'
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-gray-200'
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Organizing Body */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-red-600" />
                    <span>Authority / Organizing Body:</span>
                  </label>
                  <select
                    value={blockOrganizer}
                    onChange={(e) => setBlockOrganizer(e.target.value)}
                    className="input-field text-xs w-full cursor-pointer"
                  >
                    <option value="College Student Union (Union MEC)">College Student Union (Union MEC)</option>
                    <option value="Principal & Senate Office">Principal &amp; Senate Office</option>
                    <option value="Staff Council & Administration">Staff Council &amp; Administration</option>
                    <option value="Physical Education Dept (Sports Council)">Physical Education Dept (Sports Council)</option>
                    <option value="Campus Maintenance & Facilities Division">Campus Maintenance &amp; Facilities Division</option>
                  </select>
                </div>

                {/* 4. Time Window */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-red-600" />
                    <span>Time Window (Hours to Block):</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-gray-500 font-semibold block mb-0.5">Start Time:</span>
                      <select
                        value={blockStartTime}
                        onChange={(e) => setBlockStartTime(e.target.value)}
                        className="input-field text-xs font-mono w-full"
                      >
                        {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00'].map(t => (
                          <option key={t} value={t}>{formatTime12H(t)}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 font-semibold block mb-0.5">End Time:</span>
                      <select
                        value={blockEndTime}
                        onChange={(e) => setBlockEndTime(e.target.value)}
                        className="input-field text-xs font-mono w-full"
                      >
                        {['16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'].map(t => (
                          <option key={t} value={t}>{formatTime12H(t)}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

              </div>

              {/* Conflict Detection Banner */}
              {existingBookingsOnBlockDate.length > 0 ? (
                <div className="bg-amber-50 border border-amber-300 p-4 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>⚠️ {existingBookingsOnBlockDate.length} Existing {existingBookingsOnBlockDate.length === 1 ? 'Booking' : 'Bookings'} Found on {formatDateFriendly(blockDate)}</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    The following bookings are currently active on this date: {existingBookingsOnBlockDate.map(b => `"${b.eventTitle}" (${b.venueName} - ${b.organizer})`).join(', ')}.
                  </p>
                  <label className="flex items-center gap-2 mt-2 pt-2 border-t border-amber-200 text-xs font-bold text-amber-950 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoRevokeConflicts}
                      onChange={(e) => setAutoRevokeConflicts(e.target.checked)}
                      className="rounded text-red-600 focus:ring-red-500"
                    />
                    <span>Automatically revoke conflicting bookings and notify organizers with reason</span>
                  </label>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center gap-2 text-xs text-emerald-800 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>No conflicting bookings on {formatDateFriendly(blockDate)}. All {venues.length} venues are currently open for reservation.</span>
                </div>
              )}

              {/* Submit CTA */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="submit"
                  className="btn-danger text-xs sm:text-sm py-2.5 px-6 font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
                >
                  <Lock className="w-4 h-4" />
                  <span>Block All {venues.length} Venues on {formatDateFriendly(blockDate)}</span>
                </button>
              </div>

            </form>
          </div>

          {/* Active Day Blocks List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                <span>Active Campus-Wide Day Blocks</span>
                <span className="badge font-bold text-[10px]" style={{ background: '#FEE2E2', color: '#B91C1C', borderColor: '#FCA5A5' }}>
                  {activeDayBlocks.length} Active
                </span>
              </h3>
            </div>

            {activeDayBlocks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeDayBlocks.map((block) => (
                  <div
                    key={block.eventId}
                    className="glass-panel p-5 rounded-2xl border border-red-200 bg-white flex flex-col justify-between space-y-4 shadow-sm hover:border-red-400 transition-all"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[11px] font-bold text-red-900 bg-red-50 px-2.5 py-1 rounded-lg border border-red-200">
                            {block.eventId}
                          </span>
                          <span className="badge badge-occupied text-[10px]">
                            <Lock className="w-3 h-3" /> All Venues Blocked
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-gray-500">
                          {block.venuesCount} Facilities
                        </span>
                      </div>

                      <div>
                        <h4 className="text-base font-bold text-gray-900">{block.eventTitle}</h4>
                        <p className="text-xs text-red-700 font-semibold">{block.organizer}</p>
                      </div>

                      <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 space-y-1 text-xs">
                        <div className="flex items-center gap-2 font-mono font-bold text-gray-900">
                          <Calendar className="w-3.5 h-3.5 text-red-600 shrink-0" />
                          <span>{formatDateFriendly(block.date)} ({formatTime12H(block.startTime)} - {formatTime12H(block.endTime)})</span>
                        </div>
                        <div className="text-[11px] text-gray-600 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                          <span>Includes: {block.venuesList.slice(0, 4).join(', ')}{block.venuesList.length > 4 ? ` +${block.venuesList.length - 4} more` : ''}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Lockdown Enforced
                      </span>
                      <button
                        type="button"
                        onClick={() => setUnblockTargetModal(block)}
                        className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 font-bold hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                      >
                        <Unlock className="w-3.5 h-3.5 text-red-600" />
                        <span>Release / Unblock</span>
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-panel p-10 text-center rounded-2xl border border-gray-200 bg-white space-y-2 shadow-xs">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-bold text-gray-900">No Active Day-Wide Blocks</h4>
                <p className="text-xs text-gray-600 max-w-md mx-auto">
                  There are no campus-wide lockdowns or full-day blocks currently active. Campus facilities are operating under standard booking schedules.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* UNBLOCK CONFIRMATION MODAL */}
      {unblockTargetModal && (
        <div className="modal-overlay animate-fade-in" onClick={(e) => { if (e.target === e.currentTarget) setUnblockTargetModal(null); }}>
          <div className="glass-panel w-full max-w-md rounded-3xl border border-gray-200 p-6 relative bg-white shadow-2xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center shrink-0">
                <Unlock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-gray-900">Release Day Block</h3>
                <p className="text-xs text-gray-600">
                  {unblockTargetModal.eventId} • {formatDateFriendly(unblockTargetModal.date)}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 space-y-1.5 text-xs">
              <div className="font-bold text-gray-900">{unblockTargetModal.eventTitle}</div>
              <div className="text-gray-600 font-semibold">{unblockTargetModal.organizer}</div>
              <p className="text-gray-700 text-[11px] pt-1">
                Releasing this day block will remove the lockdown and reopen all {unblockTargetModal.venuesCount || venues.length} campus venues for normal club &amp; student reservations on {formatDateFriendly(unblockTargetModal.date)}.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setUnblockTargetModal(null)}
                className="btn-secondary text-xs py-2 px-3"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onUnblockDay) onUnblockDay(unblockTargetModal.eventId);
                  setUnblockTargetModal(null);
                }}
                className="btn-primary text-xs py-2 px-4 font-bold"
              >
                Confirm Release
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MANDATORY CANCELLATION REASON MODAL */}
      {cancelReasonModal && (() => {
        const siblingBookings = cancelReasonModal.eventId
          ? bookings.filter(b => b.eventId === cancelReasonModal.eventId)
          : [];
        const isPackage = cancelReasonModal.eventId && siblingBookings.length > 1;

        return (
          <div className="modal-overlay animate-fade-in" onClick={(e) => { if (e.target === e.currentTarget) setCancelReasonModal(null); }}>
            <div className="glass-panel w-full max-w-md rounded-3xl border border-gray-200 p-6 relative bg-white shadow-2xl space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-gray-900">Revoke Booking Permit</h3>
                  <p className="text-xs text-gray-600">
                    {cancelReasonModal.id} • {cancelReasonModal.venueName}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 space-y-1.5 text-xs">
                <div className="font-bold text-gray-900">{cancelReasonModal.eventTitle}</div>
                <div className="text-gray-600 font-semibold">{cancelReasonModal.organizer}</div>
                <div className="font-mono text-red-700 text-[11px] font-bold">
                  {formatDateFriendly(cancelReasonModal.date)} ({formatTime12H(cancelReasonModal.startTime)} - {formatTime12H(cancelReasonModal.endTime)})
                </div>
                {isPackage && (
                  <div className="mt-2 pt-2 border-t border-gray-200 text-[11px] text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200 space-y-1.5">
                    <span className="font-bold block">📦 Multi-Venue Event Package ({cancelReasonModal.eventId})</span>
                    <p className="text-gray-700 text-[10px]">
                      Part of an event package with {siblingBookings.length} venues ({siblingBookings.map(b => b.venueName).join(', ')}).
                    </p>
                    <label className="flex items-center gap-2 mt-1 text-gray-900 font-bold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={revokeWholePackage}
                        onChange={(e) => setRevokeWholePackage(e.target.checked)}
                        className="rounded text-red-600 focus:ring-red-500"
                      />
                      <span>Revoke all {siblingBookings.length} venues in this package</span>
                    </label>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-red-600" />
                  <span>Administrative Reason for Revocation:</span>
                </label>
                <textarea
                  rows="3"
                  value={reasonText}
                  onChange={(e) => setReasonText(e.target.value)}
                  placeholder="e.g. Venue required for official Institute Senate Meeting / Principal Address."
                  className="input-field text-xs w-full resize-none"
                />
                <p className="text-[11px] text-gray-500">
                  This notice will appear on the society's booking permit and release the slot.
                </p>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100 flex-wrap">
                {onAdminDeleteBooking && (
                  <button
                    type="button"
                    onClick={handleConfirmDelete}
                    className="text-xs text-gray-500 hover:text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors font-semibold"
                    title="Purge completely from database"
                  >
                    Delete Permanently
                  </button>
                )}
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setCancelReasonModal(null)}
                    className="btn-secondary text-xs py-2 px-3"
                  >
                    Go Back
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmCancel}
                    className="btn-danger text-xs py-2 px-4 font-bold"
                  >
                    Confirm Revocation
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
}
