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
  Mail,
  ToggleLeft,
  ToggleRight
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
  onAddAllowedUser,
  onRemoveAllowedUser,
  onToggleStrictAuth,
  onToggleVenueStatus 
}) {
  const [activeSubTab, setActiveSubTab] = useState(initialSubTab);
  const [cancelReasonModal, setCancelReasonModal] = useState(null);
  const [reasonText, setReasonText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

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
        reasonText || 'Cancelled by Union Admin: Administrative priority / Official college requirement.'
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
      <div className="glass-panel p-6 rounded-2xl border border-red-200 bg-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200 shrink-0">
            <img src="/mec_college_logo.png" alt="MEC" className="w-9 h-9 object-contain rounded-lg bg-white p-0.5" />
            <img src="/union_mec_logo.png" alt="Union MEC" className="w-9 h-9 object-contain rounded-lg bg-white p-0.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Union MEC Executive Portal</h2>
              <span className="badge bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold">
                ADMIN CONTROL
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Govt. Model Engineering College • Master booking oversight, organizer email authorization & facility maintenance.
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-3 text-xs">
          <div className="bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 text-center">
            <div className="text-emerald-700 font-extrabold text-lg">{activeBookings.length}</div>
            <div className="text-slate-500 text-[10px] font-medium">Active Bookings</div>
          </div>
          <div className="bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 text-center">
            <div className="text-blue-700 font-extrabold text-lg">{allowedUsers.length + 1}</div>
            <div className="text-slate-500 text-[10px] font-medium">Allowed Accounts</div>
          </div>
          <div className="bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 text-center">
            <div className="text-slate-900 font-extrabold text-lg">{venues.length}</div>
            <div className="text-slate-500 text-[10px] font-medium">Total Venues</div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('active-events')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
            activeSubTab === 'active-events'
              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
              : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <CheckCircle2 className={`w-4 h-4 ${activeSubTab === 'active-events' ? 'text-emerald-400' : 'text-emerald-600'}`} />
          Active Bookings & Revocation ({activeBookings.length})
        </button>

        <button
          onClick={() => setActiveSubTab('all-history')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
            activeSubTab === 'all-history'
              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
              : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Calendar className={`w-4 h-4 ${activeSubTab === 'all-history' ? 'text-blue-400' : 'text-blue-600'}`} />
          Master Event History ({bookings.length})
        </button>

        <button
          onClick={() => setActiveSubTab('access-control')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
            activeSubTab === 'access-control'
              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
              : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <UserCheck className={`w-4 h-4 ${activeSubTab === 'access-control' ? 'text-amber-400' : 'text-amber-600'}`} />
          Authorized Gmail Accounts ({allowedUsers.length})
        </button>

        <button
          onClick={() => setActiveSubTab('venue-maintenance')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
            activeSubTab === 'venue-maintenance'
              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
              : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Wrench className={`w-4 h-4 ${activeSubTab === 'venue-maintenance' ? 'text-cyan-400' : 'text-slate-600'}`} />
          Venue Maintenance & Controls ({venues.length})
        </button>
      </div>

      {/* TAB 1: ACTIVE BOOKINGS & REVOCATION CONSOLE */}
      {activeSubTab === 'active-events' && (
        <div className="space-y-4">
          
          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search active bookings by title, society, venue or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-9 py-2 text-xs bg-white border-slate-300"
            />
          </div>

          {filteredActiveBookings.length > 0 ? (
            filteredActiveBookings.map((b) => (
              <div
                key={b.id}
                className="glass-panel p-5 rounded-2xl border border-slate-200 bg-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-slate-300 transition-all shadow-xs"
              >
                <div className="space-y-3 flex-1">
                  
                  {/* Top Header */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                      {b.id}
                    </span>
                    <span className="badge badge-available">
                      <CheckCircle2 className="w-3 h-3" /> Confirmed Permit
                    </span>
                  </div>

                  {/* Event Title & Society */}
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">{b.eventTitle}</h3>
                    <p className="text-xs text-blue-800 font-semibold mt-0.5">
                      {b.organizer} {b.contactEmail && <span className="text-slate-500 font-mono font-normal">({b.contactEmail})</span>}
                    </p>
                  </div>

                  {/* Scheduled Date/Time & Booking Submission Time */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-slate-700 pt-0.5">
                    
                    {/* Venue */}
                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                      <Building2 className="w-4 h-4 text-slate-600 shrink-0" />
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Venue</div>
                        <span className="font-semibold text-slate-900 truncate block">
                          {b.venueName} {b.roomNumber && <span className="text-blue-700 font-mono">({b.roomNumber})</span>}
                        </span>
                      </div>
                    </div>

                    {/* Event Scheduled Date & Time */}
                    <div className="flex items-center gap-2 bg-blue-50/60 px-3 py-2 rounded-xl border border-blue-200">
                      <Calendar className="w-4 h-4 text-blue-700 shrink-0" />
                      <div>
                        <div className="text-[10px] text-blue-800 uppercase font-bold tracking-wider">Event Schedule</div>
                        <span className="font-mono text-slate-900 font-semibold text-[11px] block">
                          {formatDateFriendly(b.date)} • {formatTime12H(b.startTime)} - {formatTime12H(b.endTime)}
                        </span>
                      </div>
                    </div>

                    {/* Booking Submission Timestamp */}
                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                      <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <div className="text-[10px] text-emerald-800 uppercase font-bold tracking-wider">Booking Date & Time</div>
                        <span className="text-slate-800 font-medium text-[11px] block">
                          {formatDateTime(b.createdAt || b.bookedAt)}
                        </span>
                      </div>
                    </div>

                  </div>

                  {/* Description / Notes if available */}
                  {b.description && (
                    <p className="text-[11px] text-slate-600 italic bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      "{b.description}"
                    </p>
                  )}

                </div>

                {/* Union Admin Revoke Button */}
                <div className="w-full md:w-auto border-t md:border-t-0 border-slate-200 pt-3 md:pt-0 shrink-0">
                  <button
                    onClick={() => setCancelReasonModal(b)}
                    className="btn-danger w-full md:w-auto text-xs justify-center py-2.5 px-4"
                    title="Cancel this booking with reason"
                  >
                    <XCircle className="w-4 h-4" /> Revoke Permit
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="glass-panel p-12 text-center rounded-2xl border border-slate-200 space-y-2 bg-white">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">No Matching Active Bookings</h3>
              <p className="text-xs text-slate-500">
                All bookings are running smoothly or match no query filters.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MASTER EVENT HISTORY */}
      {activeSubTab === 'all-history' && (
        <div className="glass-panel rounded-2xl border border-slate-200 overflow-hidden shadow-xs bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <th className="p-3.5">Tracking ID</th>
                  <th className="p-3.5">Event Title & Society</th>
                  <th className="p-3.5">Venue & Room</th>
                  <th className="p-3.5">Event Schedule (Date & Time)</th>
                  <th className="p-3.5">Booking Date & Time</th>
                  <th className="p-3.5">Status & Remarks</th>
                  {onAdminDeleteBooking && <th className="p-3.5 text-center">Delete</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                    
                    {/* ID */}
                    <td className="p-3.5">
                      <div className="font-mono font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 inline-block">
                        {b.id}
                      </div>
                    </td>

                    {/* Title & Society */}
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900 text-sm">{b.eventTitle}</div>
                      <div className="text-blue-800 text-[11px] font-semibold">{b.organizer}</div>
                      {b.contactEmail && (
                        <div className="text-slate-500 text-[10px] font-mono">{b.contactEmail}</div>
                      )}
                    </td>

                    {/* Venue & Room */}
                    <td className="p-3.5 font-semibold text-slate-700">
                      <div className="text-slate-900 font-medium">{b.venueName}</div>
                      {b.roomNumber && (
                        <div className="text-blue-700 font-mono text-[11px]">Room: {b.roomNumber}</div>
                      )}
                    </td>

                    {/* Event Schedule (Date & Time) */}
                    <td className="p-3.5 font-mono text-slate-700">
                      <div className="font-bold text-slate-900 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                        <span>{formatDateFriendly(b.date)}</span>
                      </div>
                      <div className="text-[11px] text-slate-600 font-semibold flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-500 shrink-0" />
                        <span>{formatTime12H(b.startTime)} - {formatTime12H(b.endTime)}</span>
                      </div>
                    </td>

                    {/* Booking Date & Time (When booked) */}
                    <td className="p-3.5 text-slate-700">
                      <div className="text-[11px] text-slate-900 font-medium flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{formatDateTime(b.createdAt || b.bookedAt)}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Auto-Confirmed</div>
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
                            <div className="text-[10px] text-rose-800 max-w-xs truncate mt-1 bg-rose-50 px-2 py-0.5 rounded border border-rose-200" title={b.cancellationReason}>
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
                          className="p-1.5 rounded-lg bg-slate-50 text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors"
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
          <div className="glass-panel p-5 rounded-2xl border border-amber-200 bg-amber-50/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 border border-amber-200 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Gmail Access Control Policy</h3>
                <p className="text-xs text-slate-600">
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
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' 
                  : 'bg-white text-slate-600 border-slate-300 hover:text-slate-900'
              }`}
            >
              {strictAuthEnabled ? <ToggleRight className="w-5 h-5 text-white" /> : <ToggleLeft className="w-5 h-5 text-slate-400" />}
              <span>{strictAuthEnabled ? 'Strict Whitelist Enabled' : 'Strict Whitelist Disabled'}</span>
            </button>
          </div>

          {/* Add Authorized User Form */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-xs">
            <div className="flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-blue-600" />
              <h4 className="text-sm font-bold text-slate-900">Authorize New Gmail Address</h4>
            </div>

            <form onSubmit={handleAddUserSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              <div className="md:col-span-4 space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Google Email Address:</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. iedcmec@gmail.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="input-field pl-9 py-2 text-xs w-full bg-white border-slate-300"
                  />
                </div>
              </div>

              <div className="md:col-span-3 space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Official Organizing Body:</label>
                <select
                  value={newSociety}
                  onChange={(e) => setNewSociety(e.target.value)}
                  className="input-field py-2 text-xs w-full bg-white border-slate-300"
                >
                  {studentSocieties.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-3 space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Role / Designee Name:</label>
                <input
                  type="text"
                  placeholder="e.g. Secretary / Club Lead"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="input-field py-2 text-xs w-full bg-white border-slate-300"
                />
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="btn-primary w-full text-xs py-2 px-3 justify-center shadow-xs"
                >
                  <UserPlus className="w-3.5 h-3.5" /> Grant Access
                </button>
              </div>
            </form>
          </div>

          {/* Allowed Accounts Table */}
          <div className="glass-panel rounded-2xl border border-slate-200 overflow-hidden shadow-xs bg-white">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Authorized Booking Accounts Whitelist ({allowedUsers.length + 1})</span>
              </h4>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                    <th className="p-3.5">Google Account Email</th>
                    <th className="p-3.5">Authorized Organizing Body</th>
                    <th className="p-3.5">Role / Designee</th>
                    <th className="p-3.5">Permission Level</th>
                    <th className="p-3.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  
                  {/* Master Union Admin Row */}
                  <tr className="bg-red-50/50 hover:bg-red-50 transition-colors">
                    <td className="p-3.5">
                      <div className="font-mono font-bold text-slate-900 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-600" />
                        <span>senatemec@mec.ac.in</span>
                      </div>
                    </td>
                    <td className="p-3.5 font-bold text-red-800">College Union Senate</td>
                    <td className="p-3.5 text-slate-700">Union Senate Executive</td>
                    <td className="p-3.5">
                      <span className="badge bg-red-100 text-red-800 border border-red-200 text-[10px] font-bold">
                        Master Super Admin
                      </span>
                    </td>
                    <td className="p-3.5 text-center text-slate-400 italic text-[10px]">
                      Permanent
                    </td>
                  </tr>

                  {/* Whitelisted Accounts List */}
                  {allowedUsers.map((u) => (
                    <tr key={u.email} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-mono text-blue-700 font-semibold">
                        {u.email}
                      </td>
                      <td className="p-3.5 font-bold text-slate-900">
                        {u.society || 'Authorized Body'}
                      </td>
                      <td className="p-3.5 text-slate-600">
                        {u.note || 'Authorized Organizer'}
                      </td>
                      <td className="p-3.5">
                        <span className="badge bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px]">
                          Authorized Booking Access
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => onRemoveAllowedUser && onRemoveAllowedUser(u.email)}
                          className="p-1.5 rounded-lg bg-slate-50 text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors"
                          title="Revoke booking access for this email"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {allowedUsers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-400 italic">
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
            <div key={venue.id} className="glass-panel p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-4 bg-white shadow-xs">
              <div className="flex items-center gap-3">
                <img src={venue.image} alt={venue.name} className="w-14 h-14 rounded-xl object-cover border border-slate-200" />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{venue.name}</h4>
                  <div className="text-xs text-slate-500">{venue.location} • {venue.capacity} seats</div>
                  <div className="text-[11px] font-mono text-blue-700 font-semibold">{venue.type}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`badge ${venue.status === 'Available' ? 'badge-available' : 'badge-occupied'}`}>
                  {venue.status}
                </span>
                <button
                  onClick={() => onToggleVenueStatus(venue.id)}
                  className={`btn-secondary text-xs py-1.5 px-3 font-semibold ${
                    venue.status === 'Maintenance' 
                      ? 'border-emerald-300 text-emerald-700 hover:bg-emerald-50' 
                      : 'border-rose-300 text-rose-700 hover:bg-rose-50'
                  }`}
                >
                  {venue.status === 'Maintenance' ? 'Set Available' : 'Set Maintenance'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MANDATORY CANCELLATION REASON MODAL */}
      {cancelReasonModal && (
        <div className="modal-overlay animate-fade-in" onClick={(e) => { if (e.target === e.currentTarget) setCancelReasonModal(null); }}>
          <div className="glass-panel w-full max-w-md rounded-3xl border border-rose-200 p-6 relative bg-white shadow-2xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Revoke Booking Permit</h3>
                <p className="text-xs text-slate-500">
                  {cancelReasonModal.id} • {cancelReasonModal.venueName}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1 text-xs">
              <div className="font-bold text-slate-900">{cancelReasonModal.eventTitle}</div>
              <div className="text-slate-600">{cancelReasonModal.organizer}</div>
              <div className="font-mono text-blue-700 text-[11px]">
                {formatDateFriendly(cancelReasonModal.date)} ({formatTime12H(cancelReasonModal.startTime)} - {formatTime12H(cancelReasonModal.endTime)})
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-rose-600" />
                <span>Administrative Reason for Revocation:</span>
              </label>
              <textarea
                rows="3"
                value={reasonText}
                onChange={(e) => setReasonText(e.target.value)}
                placeholder="e.g. Venue required for official Institute Senate Meeting / Principal Address."
                className="input-field text-xs w-full resize-none bg-white border-slate-300"
              />
              <p className="text-[11px] text-slate-500">
                This notice will appear on the society's booking permit and release the slot.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCancelReasonModal(null)}
                className="btn-secondary text-xs py-2 px-4 border-slate-300"
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="btn-danger text-xs py-2 px-5 font-bold"
              >
                Confirm Revocation
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
