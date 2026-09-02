import React, { useState } from 'react';
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
  Users,
  Search,
  DoorClosed,
  Trash2
} from 'lucide-react';
import { formatDateFriendly, formatTime12H } from '../utils/availabilityUtils';

export default function AdminDashboard({ 
  bookings, 
  venues, 
  onAdminCancelBooking, 
  onToggleVenueStatus 
}) {
  const [activeSubTab, setActiveSubTab] = useState('active-events');
  const [cancelReasonModal, setCancelReasonModal] = useState(null);
  const [reasonText, setReasonText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const activeBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'approved');
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled' || b.status === 'rejected');

  const filteredActiveBookings = activeBookings.filter(b => 
    b.eventTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.organizer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.venueName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.id.toLowerCase().includes(searchQuery.toLowerCase())
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

  return (
    <div className="space-y-6">
      
      {/* Admin Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-red-500/20 bg-gradient-to-r from-slate-900 via-red-950/20 to-slate-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="flex items-center gap-1.5 bg-white/10 p-1.5 rounded-2xl border border-white/10 shrink-0">
            <img src="/mec_college_logo.png" alt="MEC" className="w-9 h-9 object-contain rounded-lg bg-white p-0.5" />
            <img src="/union_mec_logo.png" alt="Union MEC" className="w-9 h-9 object-contain rounded-lg bg-white p-0.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-white tracking-tight">Union MEC Executive Portal</h2>
              <span className="badge bg-red-500/20 text-red-300 border border-red-500/30 text-[10px]">
                ADMIN CONTROL
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Govt. Model Engineering College • Bookings are auto-confirmed. Union Admin can revoke permits with a reason note.
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-3 text-xs">
          <div className="bg-slate-900/90 px-3.5 py-2 rounded-xl border border-white/10 text-center">
            <div className="text-emerald-400 font-extrabold text-lg">{activeBookings.length}</div>
            <div className="text-slate-400 text-[10px]">Active Bookings</div>
          </div>
          <div className="bg-slate-900/90 px-3.5 py-2 rounded-xl border border-white/10 text-center">
            <div className="text-rose-400 font-extrabold text-lg">{cancelledBookings.length}</div>
            <div className="text-slate-400 text-[10px]">Cancelled Bookings</div>
          </div>
          <div className="bg-slate-900/90 px-3.5 py-2 rounded-xl border border-white/10 text-center">
            <div className="text-indigo-400 font-extrabold text-lg">{venues.length}</div>
            <div className="text-slate-400 text-[10px]">Total Venues</div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('active-events')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'active-events'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Active Bookings & Revocation ({activeBookings.length})
        </button>

        <button
          onClick={() => setActiveSubTab('all-history')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'all-history'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4 text-indigo-400" />
          Master Event History ({bookings.length})
        </button>

        <button
          onClick={() => setActiveSubTab('venue-maintenance')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'venue-maintenance'
              ? 'bg-slate-800 text-slate-200 border border-white/20 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Wrench className="w-4 h-4 text-cyan-400" />
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
              placeholder="Search active bookings by title, society or venue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-9 py-2 text-xs"
            />
          </div>

          {filteredActiveBookings.length > 0 ? (
            filteredActiveBookings.map((b) => (
              <div
                key={b.id}
                className="glass-panel p-5 rounded-2xl border border-white/10 bg-slate-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-emerald-500/40 transition-all shadow-md"
              >
                <div className="space-y-2.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                      {b.id}
                    </span>
                    <span className="badge badge-available">
                      <CheckCircle2 className="w-3 h-3" /> Confirmed
                    </span>
                    <span className="badge bg-slate-900 text-slate-300 border border-white/10">
                      {b.category}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white leading-snug">{b.eventTitle}</h3>
                    <p className="text-xs text-indigo-300 font-semibold">{b.organizer} • <span className="text-slate-400 font-normal">{b.contactEmail}</span></p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 pt-0.5">
                    <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-lg border border-white/5">
                      <Building2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="font-semibold text-white">
                        {b.venueName} {b.roomNumber && `(${b.roomNumber})`}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-lg border border-white/5 font-mono text-cyan-300">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span>{formatDateFriendly(b.date)} ({formatTime12H(b.startTime)} - {formatTime12H(b.endTime)})</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-lg border border-white/5 text-slate-400">
                      <Users className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{b.expectedAttendees} Expected</span>
                    </div>
                  </div>
                </div>

                {/* Union Admin Revoke Button */}
                <div className="w-full md:w-auto border-t md:border-t-0 border-white/10 pt-3 md:pt-0">
                  <button
                    onClick={() => setCancelReasonModal(b)}
                    className="btn-danger w-full md:w-auto text-xs justify-center py-2 px-3.5"
                    title="Cancel this booking"
                  >
                    <XCircle className="w-4 h-4" /> Cancel Booking
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="glass-panel p-12 text-center rounded-2xl border border-white/10 space-y-2 bg-slate-950">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="text-base font-bold text-white">No Matching Active Bookings</h3>
              <p className="text-xs text-slate-400">
                All bookings are running smoothly or match no query filters.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MASTER EVENT HISTORY */}
      {activeSubTab === 'all-history' && (
        <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950 border-b border-white/10 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-3.5">Tracking ID & Category</th>
                  <th className="p-3.5">Event Title & Society</th>
                  <th className="p-3.5">Target Venue & Room</th>
                  <th className="p-3.5">Schedule</th>
                  <th className="p-3.5">Status & Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-3.5">
                      <div className="font-mono font-bold text-indigo-300">{b.id}</div>
                      <div className="text-[10px] text-slate-400">{b.category}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-white text-sm">{b.eventTitle}</div>
                      <div className="text-slate-400 text-[11px]">{b.organizer}</div>
                    </td>
                    <td className="p-3.5 font-semibold text-slate-200">
                      <div>{b.venueName}</div>
                      {b.roomNumber && (
                        <div className="text-cyan-400 font-mono text-[11px]">{b.roomNumber}</div>
                      )}
                    </td>
                    <td className="p-3.5 font-mono text-slate-300">
                      <div className="font-semibold text-cyan-300">{formatDateFriendly(b.date)}</div>
                      <div className="text-[10px] text-slate-400">{formatTime12H(b.startTime)} - {formatTime12H(b.endTime)}</div>
                    </td>
                    <td className="p-3.5">
                      {b.status === 'confirmed' || b.status === 'approved' ? (
                        <span className="badge badge-available">Confirmed</span>
                      ) : (
                        <div>
                          <span className="badge badge-occupied">Cancelled</span>
                          {b.cancellationReason && (
                            <div className="text-[10px] text-rose-300 max-w-xs truncate mt-0.5" title={b.cancellationReason}>
                              {b.cancellationReason}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: VENUE MAINTENANCE & CONTROLS */}
      {activeSubTab === 'venue-maintenance' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {venues.map((venue) => (
            <div key={venue.id} className="glass-panel p-4 rounded-2xl border border-white/10 flex items-center justify-between gap-4 bg-slate-950 shadow-md">
              <div className="flex items-center gap-3">
                <img src={venue.image} alt={venue.name} className="w-14 h-14 rounded-xl object-cover border border-white/10" />
                <div>
                  <h4 className="font-bold text-white text-sm">{venue.name}</h4>
                  <div className="text-xs text-slate-400">{venue.location}</div>
                  <div className="mt-1">
                    {venue.status === 'Maintenance' ? (
                      <span className="badge badge-maintenance">Under Maintenance</span>
                    ) : (
                      <span className="badge badge-available">Operational</span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => onToggleVenueStatus(venue.id)}
                className={`btn-secondary text-xs ${
                  venue.status === 'Maintenance' 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30' 
                    : 'bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20'
                }`}
              >
                {venue.status === 'Maintenance' ? 'Set Operational' : 'Set Maintenance'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ADMIN CANCEL MODAL WITH REASON */}
      {cancelReasonModal && (
        <div className="modal-overlay animate-fade-in" onClick={(e) => { if (e.target === e.currentTarget) setCancelReasonModal(null); }}>
          <div className="glass-panel w-full max-w-md p-6 rounded-2xl border border-rose-500/30 bg-slate-950 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">Cancel Booking (Admin Override)</h3>
            </div>
            
            <p className="text-xs text-slate-300 leading-relaxed">
              Cancel booking <span className="text-indigo-300 font-mono font-bold">{cancelReasonModal.id}</span> for{' '}
              <strong className="text-white">"{cancelReasonModal.eventTitle}"</strong>. Please specify the reason message.
            </p>

            <textarea
              rows={3}
              value={reasonText}
              onChange={(e) => setReasonText(e.target.value)}
              placeholder="e.g. Venue required for University Inspection / Maintenance emergency."
              className="input-field border-rose-500/30 focus:border-rose-500 text-xs"
              required
            />

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setCancelReasonModal(null)} className="btn-secondary text-xs">
                Keep Booking
              </button>
              <button onClick={handleConfirmCancel} className="btn-danger text-xs py-2 px-4 shadow-rose-500/20">
                Cancel Booking
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
