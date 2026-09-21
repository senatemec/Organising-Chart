import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  ArrowLeft, 
  Instagram, 
  Phone, 
  Mail, 
  Calendar, 
  Clock, 
  Building2, 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Ticket
} from 'lucide-react';
import { formatDateFriendly, formatTime12H } from '../utils/availabilityUtils';

export default function ClubsView({ 
  clubs = [], 
  bookings = [], 
  currentUser,
  onEditProfileClick,
  onViewEventDetails,
  initialSelectedClubId = null
}) {
  const [selectedClubId, setSelectedClubId] = useState(initialSelectedClubId);
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Club
  const selectedClub = clubs.find(c => c.id === selectedClubId);

  // Helper to extract clean 2-letter club monogram initials
  const getClubInitials = (name, society) => {
    const text = (society || name || 'CL').replace(/\b(MEC|Student|Branch|Cell|Club|Community|Chapter)\b/gi, '').trim();
    const clean = text.length > 0 ? text : (name || 'CL');
    const words = clean.split(/\s+/).filter(w => w.length > 0);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return clean.substring(0, 2).toUpperCase();
  };

  // Published clubs (All club names published by default)
  const publishedClubs = clubs.filter(c => c.name && c.name.trim().length > 0);

  const filteredClubs = publishedClubs.filter(club => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      (club.name || '').toLowerCase().includes(q) ||
      (club.society || '').toLowerCase().includes(q)
    );
  });

  // Check if current user is the respective owner/representative of selected club (STRICT: no other user or role)
  const isRespectiveClubLogin = Boolean(
    currentUser && selectedClub && (
      (currentUser.email && selectedClub.email && currentUser.email.toLowerCase().trim() === selectedClub.email.toLowerCase().trim()) ||
      (currentUser.society && selectedClub.society && currentUser.society.toLowerCase().trim() === selectedClub.society.toLowerCase().trim()) ||
      (currentUser.society && selectedClub.id && currentUser.society.toLowerCase().replace(/[^a-z0-9]+/g, '-') === selectedClub.id.toLowerCase().trim())
    )
  );

  // Booked events for the selected club - ONLY active events, NOT cancelled ones
  const clubActiveBookings = selectedClub ? bookings.filter(b => {
    const isConfirmed = b.status === 'confirmed' || b.status === 'approved';
    if (!isConfirmed) return false;

    const org = (b.organizer || '').toLowerCase().trim();
    const contact = (b.contactEmail || '').toLowerCase().trim();
    const user = (b.userEmail || '').toLowerCase().trim();
    const cSociety = (selectedClub.society || '').toLowerCase().trim();
    const cName = (selectedClub.name || '').toLowerCase().trim();
    const cEmail = (selectedClub.email || '').toLowerCase().trim();

    return (
      (cSociety && org === cSociety) ||
      (cName && org === cName) ||
      (cEmail && (contact === cEmail || user === cEmail))
    );
  }) : [];

  // FORMAT INSTAGRAM URL
  const formatInstagramUrl = (handleOrUrl) => {
    if (!handleOrUrl) return null;
    const clean = handleOrUrl.trim();
    if (clean.startsWith('http://') || clean.startsWith('https://')) return clean;
    const handle = clean.replace('@', '');
    return `https://instagram.com/${handle}`;
  };

  const getInstagramHandle = (handleOrUrl) => {
    if (!handleOrUrl) return '';
    const clean = handleOrUrl.trim();
    if (clean.includes('instagram.com/')) {
      const parts = clean.split('instagram.com/');
      return `@${parts[1].replace(/\/$/, '')}`;
    }
    return clean.startsWith('@') ? clean : `@${clean}`;
  };

  // -------------------------------------------------------------
  // VIEW 1: INITIAL PUBLIC LIST (LOGO AND NAMES ONLY)
  // -------------------------------------------------------------
  if (!selectedClub) {
    return (
      <div className="space-y-6">
        
        {/* Banner */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-gray-200 bg-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center shadow-sm shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                  Campus Clubs &amp; Societies
                </h2>
                <span className="badge font-bold text-[10px] bg-red-50 text-red-800 border-red-200">
                  {publishedClubs.length} Registered Clubs
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Explore student organizations, technical chapters, cultural teams, and their scheduled venue events.
              </p>
            </div>
          </div>

          {/* Quick Search */}
          <div className="w-full md:w-72 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search club by name..."
              className="input-field text-xs pl-9 pr-3 py-2 w-full rounded-xl bg-gray-50/50"
            />
          </div>
        </div>

        {/* Clubs Grid: ONLY LOGO AND NAME */}
        {publishedClubs.length === 0 ? (
          <div className="glass-panel p-10 sm:p-14 text-center rounded-3xl border border-gray-200 space-y-4 bg-white shadow-sm max-w-md mx-auto my-4">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center mx-auto text-gray-400 shadow-2xs">
              <Users className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-gray-900">No Club Profiles Published Yet</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Club details, logos, and executive directories will appear here once updated and published by authorized club representatives.
              </p>
            </div>
            {currentUser ? (
              <button
                onClick={() => onEditProfileClick && onEditProfileClick()}
                className="btn-primary text-xs font-bold py-2 px-4 rounded-xl shadow-xs inline-flex items-center gap-2 mt-2"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Set Up Your Club Profile
              </button>
            ) : (
              <div className="pt-2 border-t border-gray-100">
                <span className="text-[11px] text-gray-400 font-medium">
                  Authorized club leads can sign in to set up and publish their club profile.
                </span>
              </div>
            )}
          </div>
        ) : filteredClubs.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4.5">
            {filteredClubs.map((club) => {
              return (
                <div
                  key={club.id}
                  onClick={() => setSelectedClubId(club.id)}
                  className="glass-panel p-4 sm:p-5 rounded-2xl border border-gray-200 bg-white hover:border-red-400 hover:shadow-md cursor-pointer transition-all flex flex-col items-center text-center space-y-3 group"
                >
                  {/* Logo Container */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center p-1.5 group-hover:scale-105 group-hover:border-red-300 transition-all shadow-2xs relative">
                    {club.logo ? (
                      <img
                        src={club.logo}
                        alt={club.name}
                        className="w-full h-full object-contain rounded-xl"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                          const fallback = e.target.parentElement.querySelector('.logo-fallback');
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className={`logo-fallback w-full h-full rounded-xl bg-red-50 text-red-700 items-center justify-center font-extrabold text-base sm:text-lg border border-red-100/80 shadow-2xs ${club.logo ? 'hidden' : 'flex'}`}>
                      {getClubInitials(club.name, club.society)}
                    </div>
                  </div>

                  {/* Club Name */}
                  <div className="w-full">
                    <h3 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-red-700 line-clamp-2 transition-colors leading-snug">
                      {club.name}
                    </h3>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass-panel p-12 text-center rounded-2xl border border-gray-200 space-y-3 bg-white shadow-sm">
            <Users className="w-12 h-12 text-gray-400 mx-auto" />
            <h3 className="text-base font-bold text-gray-900">No Clubs Found</h3>
            <p className="text-xs text-gray-600 max-w-sm mx-auto">
              No registered club found matching "{searchQuery}". Try a different keyword.
            </p>
          </div>
        )}

      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: DETAILED CLUB PROFILE & BOOKED EVENTS
  // -------------------------------------------------------------
  const instagramUrl = formatInstagramUrl(selectedClub.instagram);
  const instagramHandle = getInstagramHandle(selectedClub.instagram);

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Back Button */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => setSelectedClubId(null)}
          className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 font-bold shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Clubs</span>
        </button>

        {isRespectiveClubLogin && onEditProfileClick && (
          <button
            onClick={() => onEditProfileClick(selectedClub)}
            className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 font-bold shadow-sm"
            title={`Edit ${selectedClub.name} Profile`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Club Profile</span>
          </button>
        )}
      </div>

      {/* Hero Club Profile Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-gray-200 bg-white shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6">
          
          {/* Logo */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl border border-gray-200 bg-white p-2 flex items-center justify-center shrink-0 shadow-sm relative overflow-hidden">
            {selectedClub.logo ? (
              <img
                src={selectedClub.logo}
                alt={selectedClub.name}
                className="w-full h-full object-contain rounded-2xl"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                  const fallback = e.target.parentElement.querySelector('.hero-logo-fallback');
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : null}
            <div className={`hero-logo-fallback w-full h-full rounded-2xl bg-red-50 text-red-700 items-center justify-center font-extrabold text-2xl border border-red-100/80 shadow-2xs ${selectedClub.logo ? 'hidden' : 'flex'}`}>
              {getClubInitials(selectedClub.name, selectedClub.society)}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                {selectedClub.name}
              </h1>
              {selectedClub.society && (
                <span className="badge font-bold text-[10px] bg-red-50 text-red-800 border-red-200">
                  {selectedClub.society}
                </span>
              )}
            </div>

            {selectedClub.description ? (
              <p className="text-xs text-gray-600 leading-relaxed max-w-3xl">
                {selectedClub.description}
              </p>
            ) : (
              <p className="text-xs text-gray-400 italic leading-relaxed max-w-3xl">
                Official student organization of Govt. Model Engineering College. Profile bio and details have not been edited yet.
              </p>
            )}

            {/* Links Bar: Instagram & Email */}
            <div className="flex items-center gap-3 pt-1 flex-wrap">
              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-pink-700 bg-pink-50 hover:bg-pink-100 border border-pink-200 transition-colors shadow-2xs"
                >
                  <Instagram className="w-3.5 h-3.5 text-pink-600" />
                  <span>{instagramHandle || 'Instagram'}</span>
                  <ExternalLink className="w-3 h-3 ml-0.5 text-pink-500" />
                </a>
              )}

              {selectedClub.email && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono text-gray-700 bg-gray-50 border border-gray-200">
                  <Mail className="w-3.5 h-3.5 text-gray-500" />
                  <span>{selectedClub.email}</span>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* SECTION 1: CORE MEMBERS */}
      <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-gray-200 bg-white shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-red-600" />
            <h2 className="text-base sm:text-lg font-extrabold text-gray-900">
              Core Committee Members
            </h2>
          </div>
          <span className="text-xs text-gray-500 font-medium">
            {selectedClub.coreMembers?.length || 0} Member(s)
          </span>
        </div>

        {selectedClub.coreMembers && selectedClub.coreMembers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {selectedClub.coreMembers.map((member, index) => (
              <div
                key={member.id || index}
                className="p-4 rounded-2xl border border-gray-200 bg-gray-50/60 flex flex-col justify-between space-y-3 hover:border-gray-300 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <h3 className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">
                      {member.name}
                    </h3>
                  </div>
                  {member.designation && (
                    <span className="inline-block text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md">
                      {member.designation}
                    </span>
                  )}
                </div>

                {member.phone && (
                  <div className="pt-2 border-t border-gray-200/60">
                    <a
                      href={`tel:${member.phone.replace(/\s+/g, '')}`}
                      className="inline-flex items-center gap-1.5 text-xs text-gray-700 hover:text-red-700 font-mono font-medium transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{member.phone}</span>
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-gray-500 bg-gray-50/70 rounded-2xl border border-gray-200 space-y-2">
            <p>Core committee members have not been updated yet.</p>
            {isRespectiveClubLogin && onEditProfileClick && (
              <button
                onClick={() => onEditProfileClick(selectedClub)}
                className="btn-secondary text-xs font-bold py-1.5 px-3 rounded-lg inline-flex items-center gap-1.5 text-gray-700"
              >
                <Edit3 className="w-3 h-3 text-red-600" />
                <span>Add Core Committee Members</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* SECTION 2: BOOKED EVENTS & VENUES */}
      <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-gray-200 bg-white shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-red-600" />
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-gray-900">
                Booked Venues &amp; Scheduled Events
              </h2>
              <p className="text-xs text-gray-500">
                Campus facilities reserved by {selectedClub.name}
              </p>
            </div>
          </div>

          {/* Active Booking Count Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{clubActiveBookings.length} Active Booking{clubActiveBookings.length === 1 ? '' : 's'}</span>
          </div>
        </div>

        {/* Active Bookings Grid */}
        {clubActiveBookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clubActiveBookings.map((b) => {
              return (
                <div
                  key={b.id}
                  onClick={() => onViewEventDetails && onViewEventDetails(b)}
                  className="p-4 rounded-2xl border border-gray-200 transition-all cursor-pointer bg-white flex flex-col justify-between space-y-3 shadow-2xs hover:shadow-sm hover:border-red-400"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-red-900 bg-red-50 px-2.5 py-0.5 rounded-lg border border-red-200">
                        {b.id}
                      </span>
                      <span className="badge badge-available text-[10px]">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Confirmed
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-gray-900 leading-snug">
                      {b.eventTitle}
                    </h3>

                    <div className="space-y-1 text-xs text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-200 font-medium">
                      <div className="flex items-center gap-1.5 text-gray-900 font-bold">
                        <Building2 className="w-3.5 h-3.5 text-red-600 shrink-0" />
                        <span>{b.venueName} {b.roomNumber && <strong className="text-red-700">({b.roomNumber})</strong>}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-mono text-gray-800">
                        <Calendar className="w-3.5 h-3.5 text-red-600 shrink-0" />
                        <span>{formatDateFriendly(b.date)} ({formatTime12H(b.startTime)} - {formatTime12H(b.endTime)})</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-[10px] text-gray-400 pt-2 border-t border-gray-100 flex items-center justify-between">
                    <span>Click to view full reservation permit</span>
                    <span className="text-red-700 font-bold">View Details →</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-gray-500 bg-gray-50/70 rounded-2xl border border-gray-200 space-y-2">
            <Ticket className="w-8 h-8 text-gray-400 mx-auto" />
            <p className="font-bold text-gray-800 text-sm">No Active Bookings</p>
            <p className="text-gray-500 text-[11px]">There are currently no active venue reservations scheduled by {selectedClub.name}.</p>
          </div>
        )}

      </div>

    </div>
  );
}
