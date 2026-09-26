import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import VenueGrid from './components/VenueGrid';
import AvailabilityGrid from './components/AvailabilityGrid';
import VenueDetailsModal from './components/VenueDetailsModal';
import BookingModal from './components/BookingModal';
import AdminDashboard from './components/AdminDashboard';
import MyBookings from './components/MyBookings';
import AnalyticsView from './components/AnalyticsView';
import GoogleAuthModal from './components/GoogleAuthModal';
import ClubsView from './components/ClubsView';
import ClubProfileModal from './components/ClubProfileModal';
import EventDetailsModal from './components/EventDetailsModal';
import ErrorBoundary from './components/ErrorBoundary';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

import { initialVenues, initialBookings, initialAllowedUsers, initialClubs } from './data/mockData';
import { formatDateFriendly } from './utils/availabilityUtils';
import { isRespectiveClubUser, findRespectiveClub } from './utils/clubUtils';
import { 
  isFirebaseConfigured, 
  seedInitialFirestoreData, 
  subscribeToBookings, 
  subscribeToVenues, 
  subscribeToAllowedUsers, 
  subscribeToAuthSettings,
  subscribeToClubs,
  dbUpdateClubProfile,
  dbCreateBooking, 
  dbUpdateBooking, 
  dbDeleteBooking, 
  dbUpdateVenueStatus,
  dbAddAllowedUser,
  dbRemoveAllowedUser,
  dbUpdateAuthSettings,
  dbSignOut
} from './services/firebase';

import { CheckCircle2, AlertCircle, Info, Sparkles, XCircle, Cloud, Database } from 'lucide-react';

export default function App() {
  // Persistent State with Smart Migration
  const [venues, setVenues] = useState(() => {
    const saved = localStorage.getItem('cs_venues_v16');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 10) {
          return initialVenues.map(initV => {
            const savedV = parsed.find(v => v.id === initV.id);
            if (!savedV) return initV;
            const image = (initV.image && initV.image.startsWith('/')) ? initV.image : (savedV.image || initV.image);
            return { 
              ...savedV, 
              ...initV, 
              image, 
              capacity: initV.capacity,
              status: savedV.status || initV.status 
            };
          });
        }
      } catch (e) {}
    }
    return initialVenues;
  });

  const [bookings, setBookings] = useState(() => {
    const saved = localStorage.getItem('cs_bookings_v8');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return initialBookings;
  });

  // Allowed Users (Whitelist of authorized booking accounts)
  const [allowedUsers, setAllowedUsers] = useState(() => {
    const saved = localStorage.getItem('cs_allowed_users_v3');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const map = new Map();
          initialAllowedUsers.forEach(u => map.set(u.email.toLowerCase().trim(), u));
          parsed.forEach(u => map.set(u.email.toLowerCase().trim(), u));
          return Array.from(map.values());
        }
      } catch (e) {}
    }
    return initialAllowedUsers;
  });

  // Strict Whitelist Auth Policy
  const [strictAuthEnabled, setStrictAuthEnabled] = useState(() => {
    const saved = localStorage.getItem('cs_strict_auth_v1');
    if (saved !== null) {
      return saved === 'true';
    }
    return true; // Default: Only authorized accounts can sign in & book!
  });

  // Logged-in Google User State (null if logged out)
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('cs_google_user_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return null;
  });

  const [activeTab, setActiveTab] = useState('venues');

  // Toast / Notification State
  const [toast, setToast] = useState(null);

  // College Clubs & Societies Profiles State (Names published by default; user edits merged on save)
  const [clubs, setClubs] = useState(() => {
    try {
      localStorage.removeItem('cs_clubs_v2');
      localStorage.removeItem('cs_clubs_v3');
      localStorage.removeItem('cs_clubs_v4');
    } catch (e) {}
    const saved = localStorage.getItem('cs_clubs_v5');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const map = new Map();
          initialClubs.forEach(c => map.set(c.id, c));
          parsed.forEach(c => {
            const init = map.get(c.id) || {};
            map.set(c.id, { ...init, ...c });
          });
          return Array.from(map.values());
        }
      } catch (e) {}
    }
    return initialClubs;
  });

  // Modals
  const [selectedVenueForDetails, setSelectedVenueForDetails] = useState(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingModalInitialData, setBookingModalInitialData] = useState({
    venue: null,
    date: '2026-09-05',
    time: '10:00'
  });

  // Club Profile Modal State
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedClubForEdit, setSelectedClubForEdit] = useState(null);
  const [selectedEventForModal, setSelectedEventForModal] = useState(null);

  // Google Auth Modal State
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMessage, setAuthModalMessage] = useState('');
  const [pendingBookingPayload, setPendingBookingPayload] = useState(null);

  // Real-time Cloud Database Synchronization
  useEffect(() => {
    if (isFirebaseConfigured) {
      seedInitialFirestoreData();

      const unsubscribeBookings = subscribeToBookings((liveBookings) => {
        if (Array.isArray(liveBookings)) {
          setBookings(liveBookings);
          try {
            localStorage.setItem('cs_bookings_v8', JSON.stringify(liveBookings));
          } catch (e) {}
        }
      });

      const unsubscribeVenues = subscribeToVenues((liveVenues) => {
        if (liveVenues && liveVenues.length > 0) {
          const merged = initialVenues.map(initV => {
            const liveV = liveVenues.find(v => v.id === initV.id);
            if (!liveV) return initV;
            const image = (initV.image && initV.image.startsWith('/')) ? initV.image : (liveV.image || initV.image);
            return {
              ...liveV,
              ...initV,
              image,
              capacity: initV.capacity,
              status: liveV.status || initV.status
            };
          });
          setVenues(merged);
        }
      });

      const unsubscribeAllowedUsers = subscribeToAllowedUsers((liveAllowedUsers) => {
        if (liveAllowedUsers && Array.isArray(liveAllowedUsers)) {
          const map = new Map();
          initialAllowedUsers.forEach(u => map.set((u.email || '').toLowerCase().trim(), u));
          liveAllowedUsers.forEach(u => map.set((u.email || '').toLowerCase().trim(), u));
          setAllowedUsers(Array.from(map.values()));
        }
      });

      const unsubscribeAuthSettings = subscribeToAuthSettings((policy) => {
        if (policy && typeof policy.strictAuthEnabled === 'boolean') {
          setStrictAuthEnabled(policy.strictAuthEnabled);
        }
      });

      const unsubscribeClubs = subscribeToClubs((liveClubs) => {
        if (Array.isArray(liveClubs) && liveClubs.length > 0) {
          setClubs(prevClubs => {
            const map = new Map();
            initialClubs.forEach(c => map.set(c.id, c));
            (prevClubs || []).forEach(c => {
              if (c && c.id) {
                const init = map.get(c.id) || {};
                map.set(c.id, { ...init, ...c });
              }
            });
            liveClubs.forEach(c => {
              if (c && c.id) {
                const existing = map.get(c.id) || {};
                if (c.updatedByUser) {
                  map.set(c.id, { ...existing, ...c });
                }
              }
            });
            const merged = Array.from(map.values());
            try {
              localStorage.setItem('cs_clubs_v5', JSON.stringify(merged));
            } catch (e) {}
            return merged;
          });
        }
      });

      return () => {
        unsubscribeBookings();
        unsubscribeVenues();
        unsubscribeAllowedUsers();
        unsubscribeAuthSettings();
        unsubscribeClubs();
      };
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cs_clubs_v5', JSON.stringify(clubs));
  }, [clubs]);

  useEffect(() => {
    localStorage.setItem('cs_venues_v16', JSON.stringify(venues));
  }, [venues]);

  useEffect(() => {
    localStorage.setItem('cs_bookings_v8', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('cs_allowed_users_v3', JSON.stringify(allowedUsers));
  }, [allowedUsers]);

  useEffect(() => {
    localStorage.setItem('cs_strict_auth_v1', String(strictAuthEnabled));
  }, [strictAuthEnabled]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('cs_google_user_v1', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('cs_google_user_v1');
    }
  }, [currentUser]);

  // Security guard: If current tab is admin/analytics/access-control and user is not union admin, bounce to venues
  useEffect(() => {
    if ((activeTab === 'admin' || activeTab === 'analytics' || activeTab === 'access-control') && !currentUser?.isUnionAdmin) {
      setActiveTab('venues');
    }
  }, [activeTab, currentUser]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Trigger Google Auth Modal for unauthenticated actions
  const triggerAuthModal = (message, pendingPayload = null) => {
    setAuthModalMessage(message);
    setPendingBookingPayload(pendingPayload);
    setAuthModalOpen(true);
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    if (user.isUnionAdmin) {
      showToast(`Welcome Union Senate Executive (${user.email})! Master controls unlocked.`, 'success');
    } else {
      showToast(`Signed in with authorized Google account: ${user.name} (${user.email})`, 'success');
    }

    // If user was trying to book a venue, proceed to open booking modal
    if (pendingBookingPayload) {
      setBookingModalInitialData(pendingBookingPayload);
      setBookingModalOpen(true);
      setPendingBookingPayload(null);
    }
  };

  const handleLogout = async () => {
    try {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.disableAutoSelect();
        if (currentUser?.email) {
          try {
            window.google.accounts.id.revoke(currentUser.email, () => {});
          } catch (e) {}
        }
      }
      await dbSignOut();
    } catch (e) {}
    setCurrentUser(null);
    if (activeTab === 'admin' || activeTab === 'access-control') {
      setActiveTab('venues');
    }
    showToast('Signed out successfully.', 'info');
  };

  // Add Allowed User to Whitelist
  const handleAddAllowedUser = async (userEntry) => {
    const cleanEmail = userEntry.email.toLowerCase().trim();
    if (allowedUsers.some(u => u.email.toLowerCase() === cleanEmail)) {
      showToast(`${cleanEmail} is already in the authorized list!`, 'info');
      return;
    }

    const updated = [...allowedUsers, { ...userEntry, email: cleanEmail }];
    setAllowedUsers(updated);

    if (isFirebaseConfigured) {
      try {
        await dbAddAllowedUser(userEntry);
      } catch (e) {
        console.error('Firebase allowed user add error:', e);
      }
    }

    showToast(`Granted booking authorization to ${cleanEmail}`, 'success');
  };

  // Remove Allowed User from Whitelist (Revoke access)
  const handleRemoveAllowedUser = async (email) => {
    const cleanEmail = email.toLowerCase().trim();
    const updated = allowedUsers.filter(u => u.email.toLowerCase() !== cleanEmail);
    setAllowedUsers(updated);
    localStorage.setItem('cs_allowed_users_v3', JSON.stringify(updated));

    if (isFirebaseConfigured) {
      try {
        await dbRemoveAllowedUser(cleanEmail);
      } catch (e) {
        console.error('Firebase allowed user remove error:', e);
      }
    }

    showToast(`Revoked booking authorization for ${cleanEmail}`, 'info');
  };

  // Toggle Strict Auth Policy
  const handleToggleStrictAuth = async (enabled) => {
    setStrictAuthEnabled(enabled);

    if (isFirebaseConfigured) {
      try {
        await dbUpdateAuthSettings({ strictAuthEnabled: enabled });
      } catch (e) {
        console.error('Firebase auth policy update error:', e);
      }
    }

    showToast(enabled ? 'Strict Whitelist Login Enabled' : 'Open Login Mode Enabled', 'info');
  };

  // Open Club Profile Editor - STRICTLY available ONLY to the respective club login
  const handleOpenProfileModal = (targetClub = null) => {
    if (!currentUser) {
      triggerAuthModal('Please sign in with your authorized club account to edit profile details.');
      return;
    }

    if (targetClub) {
      if (!isRespectiveClubUser(currentUser, targetClub, allowedUsers)) {
        showToast(`Access Restricted: Only authorized representatives of ${targetClub.name} can edit this profile.`, 'error');
        return;
      }
      setSelectedClubForEdit(targetClub);
      setProfileModalOpen(true);
      return;
    }

    // Match current logged-in user's respective club
    const matchedClub = findRespectiveClub(currentUser, clubs, allowedUsers);

    if (matchedClub) {
      setSelectedClubForEdit(matchedClub);
      setProfileModalOpen(true);
    } else {
      const rawSociety = currentUser.society || '';
      if (!rawSociety) {
        showToast('Your account is not linked to any recognized college club.', 'error');
        return;
      }
      const userEmail = (currentUser.email || '').toLowerCase().trim();
      const clubId = rawSociety.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      setSelectedClubForEdit({
        id: clubId,
        name: rawSociety,
        society: rawSociety,
        email: currentUser.email || '',
        logo: '',
        instagram: '',
        description: '',
        coreMembers: [
          { id: '1', name: '', designation: 'Lead / Executive', phone: '' }
        ],
        updatedByUser: false
      });
      setProfileModalOpen(true);
    }
  };

  // Save updated club profile (edits saved and published)
  const handleSaveClubProfile = async (clubId, updatedData) => {
    if (!currentUser) {
      showToast('Please sign in to save profile changes.', 'error');
      return;
    }

    const targetClub = clubs.find(c => c.id === clubId) || updatedData;
    if (!isRespectiveClubUser(currentUser, targetClub, allowedUsers)) {
      showToast(`Unauthorized: You can only edit and save your own club's profile.`, 'error');
      return;
    }

    const dataWithFlag = {
      ...updatedData,
      id: clubId,
      updatedByUser: true,
      updatedAt: new Date().toISOString()
    };

    setClubs(prevClubs => {
      const exists = prevClubs.some(c => c.id === clubId);
      const updated = exists 
        ? prevClubs.map(c => c.id === clubId ? { ...c, ...dataWithFlag } : c)
        : [...prevClubs, dataWithFlag];
      try {
        localStorage.setItem('cs_clubs_v5', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    setSelectedClubForEdit(dataWithFlag);

    if (isFirebaseConfigured) {
      try {
        await dbUpdateClubProfile(clubId, dataWithFlag);
      } catch (err) {
        console.error('Firebase club profile update error:', err);
      }
    }

    showToast(`${dataWithFlag.name} profile updated successfully!`, 'success');
  };

  // Open booking modal (requires Google Login!)
  const handleOpenBookingModal = (venue = null, date = '2026-09-05', time = '10:00') => {
    const payload = { venue, date, time };
    if (!currentUser) {
      triggerAuthModal('Please sign in with your authorized Google account to book a venue.', payload);
      return;
    }
    setBookingModalInitialData(payload);
    setBookingModalOpen(true);
  };

  // Add new booking(s) (Instantly Confirmed & synced with Firestore)
  const handleCreateBooking = async (bookingOrList) => {
    const newItems = Array.isArray(bookingOrList) ? bookingOrList : [bookingOrList];

    // 1. Immediately update local state atomically and persist to localStorage
    setBookings((prevBookings) => {
      const newIds = new Set(newItems.map(b => b.id));
      const filteredPrev = prevBookings.filter(b => !newIds.has(b.id));
      const updated = [...newItems, ...filteredPrev];
      try {
        localStorage.setItem('cs_bookings_v8', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // 2. Sync to Firestore in background
    if (isFirebaseConfigured) {
      try {
        await dbCreateBooking(bookingOrList);
      } catch (e) {
        console.warn('Firestore booking sync notice (persisted in local state):', e);
      }
    }

    if (Array.isArray(bookingOrList)) {
      const eventTitle = bookingOrList[0]?.eventTitle || 'Event';
      showToast(`Event "${eventTitle}" confirmed across ${bookingOrList.length} venues!`, 'success');
    } else {
      showToast(`Booking ${bookingOrList.id} confirmed for ${bookingOrList.venueName}!`, 'success');
    }
  };

  // Union Admin Cancel/Revoke with message and multi-venue package support
  const handleAdminCancelBooking = async (bookingId, reason, cancelWholePackage = false) => {
    const targetBooking = bookings.find(b => b.id === bookingId);
    const eventIdToCancel = (cancelWholePackage && targetBooking?.eventId) ? targetBooking.eventId : null;

    const updates = {
      status: 'cancelled',
      cancelledBy: currentUser?.email || 'Union Admin',
      cancellationReason: reason || 'Cancelled by Union Admin: Administrative requirement / Priority adjustment.'
    };

    let updatedBookings;
    let targetList = [];
    if (eventIdToCancel) {
      targetList = bookings.filter(b => b.eventId === eventIdToCancel);
      updatedBookings = bookings.map(b => b.eventId === eventIdToCancel ? { ...b, ...updates } : b);
    } else {
      targetList = bookings.filter(b => b.id === bookingId);
      updatedBookings = bookings.map(b => b.id === bookingId ? { ...b, ...updates } : b);
    }

    setBookings(updatedBookings);
    localStorage.setItem('cs_bookings_v8', JSON.stringify(updatedBookings));
    
    if (isFirebaseConfigured) {
      try {
        await Promise.all(targetList.map(b => dbUpdateBooking(b.id, updates)));
      } catch (e) {
        console.error('Firebase update error:', e);
      }
    }

    showToast(
      eventIdToCancel
        ? `Event package ${eventIdToCancel} (${targetList.length} venues) revoked by Union Admin.`
        : `Booking permit ${bookingId} revoked by Union Admin.`,
      'error'
    );
  };

  // Student cancel own booking / Admin purge booking
  const handleCancelBooking = async (bookingId, deleteWholePackage = false) => {
    const targetBooking = bookings.find(b => b.id === bookingId);
    const eventIdToDelete = (deleteWholePackage && targetBooking?.eventId) ? targetBooking.eventId : null;

    let updatedBookings;
    let deletedList = [];
    if (eventIdToDelete) {
      deletedList = bookings.filter(b => b.eventId === eventIdToDelete);
      updatedBookings = bookings.filter(b => b.eventId !== eventIdToDelete);
    } else {
      deletedList = bookings.filter(b => b.id === bookingId);
      updatedBookings = bookings.filter(b => b.id !== bookingId);
    }

    setBookings(updatedBookings);
    localStorage.setItem('cs_bookings_v8', JSON.stringify(updatedBookings));

    if (isFirebaseConfigured) {
      try {
        await Promise.all(deletedList.map(b => dbDeleteBooking(b.id)));
      } catch (e) {
        console.error('Firebase delete error:', e);
      }
    }

    showToast(
      eventIdToDelete
        ? `Event package ${eventIdToDelete} purged completely.`
        : `Booking ${bookingId} permanently deleted.`,
      'info'
    );
  };

  // Individual Club cancel own booking with mandatory/structured reason and package support
  const handleClubCancelBooking = async (bookingId, reason, cancelWholePackage = false) => {
    const targetBooking = bookings.find(b => b.id === bookingId);
    if (!targetBooking) return;

    // Security check: Verify currentUser owns this booking (or is Union Admin)
    const userEmail = (currentUser?.email || '').toLowerCase().trim();
    const contactEmail = (targetBooking.contactEmail || '').toLowerCase().trim();
    const bookingUserEmail = (targetBooking.userEmail || '').toLowerCase().trim();
    const userSociety = (currentUser?.society || '').toLowerCase().trim();
    const bookingOrganizer = (targetBooking.organizer || '').toLowerCase().trim();

    const isOwner = userEmail && (
      contactEmail === userEmail ||
      bookingUserEmail === userEmail ||
      (userSociety && bookingOrganizer === userSociety)
    );

    if (!isOwner && !currentUser?.isUnionAdmin) {
      showToast('You can only cancel bookings made by your club account.', 'error');
      return;
    }

    const eventIdToCancel = (cancelWholePackage && targetBooking?.eventId) ? targetBooking.eventId : null;
    const nowIso = new Date().toISOString();
    const clubName = currentUser?.society || currentUser?.name || 'Club Representative';

    const updates = {
      status: 'cancelled',
      cancelledBy: currentUser?.email || 'Club Representative',
      cancelledByClub: clubName,
      cancellationReason: reason || 'Cancelled by club organizers.',
      cancelledAt: nowIso
    };

    let updatedBookings;
    let targetList = [];
    if (eventIdToCancel) {
      targetList = bookings.filter(b => b.eventId === eventIdToCancel);
      updatedBookings = bookings.map(b => b.eventId === eventIdToCancel ? { ...b, ...updates } : b);
    } else {
      targetList = bookings.filter(b => b.id === bookingId);
      updatedBookings = bookings.map(b => b.id === bookingId ? { ...b, ...updates } : b);
    }

    setBookings(updatedBookings);
    localStorage.setItem('cs_bookings_v8', JSON.stringify(updatedBookings));

    if (isFirebaseConfigured) {
      try {
        await Promise.all(targetList.map(b => dbUpdateBooking(b.id, updates)));
      } catch (e) {
        console.error('Firebase update error:', e);
      }
    }

    showToast(
      eventIdToCancel
        ? `Event package (${targetList.length} venues) cancelled by ${clubName}. Slots released.`
        : `Booking permit ${bookingId} cancelled by ${clubName}. Slot released.`,
      'info'
    );
  };

  // Admin Block All Venues for a Date (Campus-Wide Lockdown / Event Reservation)
  const handleBlockAllVenues = async ({
    date,
    eventTitle = 'Campus-Wide Event (All Venues Blocked)',
    organizer = 'College Student Union (Union MEC)',
    startTime = '08:00',
    endTime = '20:00',
    description = 'All campus facilities reserved by College Union / Administration.',
    autoRevokeConflicts = true
  }) => {
    const blockEventId = `BLK-${date.replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowIso = new Date().toISOString();

    // Find any existing active bookings on that date
    const conflictingBookings = bookings.filter(b => 
      b.date === date && 
      (b.status === 'confirmed' || b.status === 'approved') &&
      !b.isDayBlock &&
      !(b.eventId && b.eventId.startsWith('BLK-'))
    );

    let updatedBookings = [...bookings];

    // If auto-revoke is enabled, cancel conflicting bookings with explanation
    if (autoRevokeConflicts && conflictingBookings.length > 0) {
      const cancelUpdates = {
        status: 'cancelled',
        cancelledBy: currentUser?.email || 'Union Admin',
        cancellationReason: `Cancelled due to Day-Wide Campus Block: "${eventTitle}" on ${formatDateFriendly(date)}.`
      };

      updatedBookings = updatedBookings.map(b => {
        if (b.date === date && (b.status === 'confirmed' || b.status === 'approved') && !b.isDayBlock && !(b.eventId && b.eventId.startsWith('BLK-'))) {
          return { ...b, ...cancelUpdates };
        }
        return b;
      });

      if (isFirebaseConfigured) {
        try {
          await Promise.all(conflictingBookings.map(b => dbUpdateBooking(b.id, cancelUpdates)));
        } catch (e) {
          console.error('Firebase cancel conflicts error:', e);
        }
      }
    }

    // Create block entries for ALL registered venues in the system
    const newBlockBookings = venues.map((venue, idx) => ({
      id: `BK-BLK-${date.replace(/-/g, '')}-${idx + 1}-${Math.floor(100 + Math.random() * 900)}`,
      eventId: blockEventId,
      isDayBlock: true,
      venueId: venue.id,
      venueName: venue.name,
      roomNumber: null,
      eventTitle: eventTitle.trim(),
      organizer: organizer.trim(),
      date,
      startTime,
      endTime,
      status: 'confirmed',
      approvedBy: 'Union Admin (Campus Lockdown)',
      description: description.trim(),
      contactEmail: currentUser?.email || 'union@mec.ac.in',
      userEmail: currentUser?.email || 'union@mec.ac.in',
      createdAt: nowIso
    }));

    updatedBookings = [...newBlockBookings, ...updatedBookings];
    setBookings(updatedBookings);
    localStorage.setItem('cs_bookings_v8', JSON.stringify(updatedBookings));

    if (isFirebaseConfigured) {
      try {
        await dbCreateBooking(newBlockBookings);
      } catch (e) {
        console.error('Firebase day block create error:', e);
      }
    }

    showToast(`All ${venues.length} campus venues blocked for ${formatDateFriendly(date)} ("${eventTitle}")!`, 'success');
  };

  // Admin Unblock All Venues for a Date
  const handleUnblockDay = async (blockEventId) => {
    const blockList = bookings.filter(b => b.eventId === blockEventId || (b.isDayBlock && b.eventId === blockEventId));
    const targetDate = blockList[0]?.date;
    const updatedBookings = bookings.filter(b => b.eventId !== blockEventId);

    setBookings(updatedBookings);
    localStorage.setItem('cs_bookings_v8', JSON.stringify(updatedBookings));

    if (isFirebaseConfigured) {
      try {
        await Promise.all(blockList.map(b => dbDeleteBooking(b.id)));
      } catch (e) {
        console.error('Firebase unblock delete error:', e);
      }
    }

    showToast(targetDate ? `All venues unlocked for ${formatDateFriendly(targetDate)}.` : 'Day block released successfully.', 'info');
  };

  // Toggle Maintenance Status (Admin only)
  const handleToggleVenueStatus = async (venueId) => {
    const target = venues.find(v => v.id === venueId);
    const nextStatus = target?.status === 'Maintenance' ? 'Available' : 'Maintenance';

    setVenues(venues.map((v) => v.id === venueId ? { ...v, status: nextStatus } : v));

    if (isFirebaseConfigured) {
      try {
        await dbUpdateVenueStatus(venueId, nextStatus);
      } catch (e) {
        console.error('Firebase status error:', e);
      }
    }

    showToast(`${target?.name || 'Venue'} status updated to ${nextStatus}`, 'info');
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col justify-between">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[2000] animate-fade-in">
          <div className={`px-4 py-3 rounded-2xl border flex items-center gap-3 text-xs font-semibold shadow-2xl backdrop-blur-md ${
            toast.type === 'error' 
              ? 'bg-white border-red-500/60 text-red-700' 
              : toast.type === 'info'
              ? 'bg-white border-gray-300 text-gray-700'
              : 'bg-white border-emerald-500/60 text-emerald-700'
          }`}>
            {toast.type === 'error' ? (
              <XCircle className="w-4 h-4 shrink-0" style={{color:'#DC2626'}} />
            ) : toast.type === 'info' ? (
              <Info className="w-4 h-4 shrink-0" style={{color:'#6B7280'}} />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0" style={{color:'#10B981'}} />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header Navbar with Google Sign-in & Union Mail Role Gating */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenLoginModal={(msg) => triggerAuthModal(msg)}
        onOpenProfileModal={() => handleOpenProfileModal()}
        onLogout={handleLogout}
        onNewBookingClick={() => handleOpenBookingModal()}
      />

      {/* Main Workspace Container */}
      <main className="max-w-7xl mx-auto px-2.5 sm:px-4 lg:px-8 pb-16 flex-1 w-full space-y-4 sm:space-y-6">
        
        {/* Tab 1: Venues & Landing Showcase */}
        {activeTab === 'venues' && (
          <VenueGrid
            venues={venues}
            onBookClick={(venue) => handleOpenBookingModal(venue)}
            onViewDetails={(venue) => setSelectedVenueForDetails(venue)}
            onScheduleClick={() => setActiveTab('availability')}
          />
        )}

        {/* Tab 2: Availability Grid Matrix */}
        {activeTab === 'availability' && (
          <AvailabilityGrid
            venues={venues}
            bookings={bookings}
            currentUser={currentUser}
            onAdminCancelBooking={handleAdminCancelBooking}
            onClubCancelBooking={handleClubCancelBooking}
            onBlockAllVenues={handleBlockAllVenues}
            onUnblockDay={handleUnblockDay}
            onSlotClick={(venue, date, slot) => handleOpenBookingModal(venue, date, slot)}
          />
        )}

        {/* Tab 3: Campus Clubs & Societies Directory (Public) */}
        {activeTab === 'clubs' && (
          <ClubsView
            clubs={clubs}
            bookings={bookings}
            currentUser={currentUser}
            allowedUsers={allowedUsers}
            onEditProfileClick={(club) => handleOpenProfileModal(club)}
            onViewEventDetails={(event) => setSelectedEventForModal(event)}
          />
        )}

        {/* Tab 4: My Bookings (Filtered by logged in Google user) */}
        {activeTab === 'my-bookings' && (
          <MyBookings
            bookings={bookings}
            venues={venues}
            currentUser={currentUser}
            onOpenLoginModal={(msg) => triggerAuthModal(msg)}
            onNewBookingClick={() => handleOpenBookingModal()}
            onCancelBooking={handleClubCancelBooking}
          />
        )}

        {/* Tab 4: Union Admin & Access Control (Exclusively available to Union Mail) */}
        {(activeTab === 'admin' || activeTab === 'access-control') && currentUser?.isUnionAdmin && (
          <AdminDashboard
            bookings={bookings}
            venues={venues}
            allowedUsers={allowedUsers}
            strictAuthEnabled={strictAuthEnabled}
            initialSubTab={activeTab === 'access-control' ? 'access-control' : 'active-events'}
            onAdminCancelBooking={handleAdminCancelBooking}
            onAdminDeleteBooking={handleCancelBooking}
            onBlockAllVenues={handleBlockAllVenues}
            onUnblockDay={handleUnblockDay}
            onAddAllowedUser={handleAddAllowedUser}
            onRemoveAllowedUser={handleRemoveAllowedUser}
            onToggleStrictAuth={handleToggleStrictAuth}
            onToggleVenueStatus={handleToggleVenueStatus}
          />
        )}

        {/* Tab 5: Analytics & Insights (Exclusively available to Union Admin) */}
        {activeTab === 'analytics' && currentUser?.isUnionAdmin && (
          <AnalyticsView
            venues={venues}
            bookings={bookings}
          />
        )}

      </main>

      {/* Google Authentication Modal with Strict Whitelist Enforcement */}
      <GoogleAuthModal
        isOpen={authModalOpen}
        allowedUsers={allowedUsers}
        strictAuthEnabled={strictAuthEnabled}
        onClose={() => {
          setAuthModalOpen(false);
          setPendingBookingPayload(null);
        }}
        onLoginSuccess={handleLoginSuccess}
        intendedActionMessage={authModalMessage}
      />

      {/* Venue Details Modal */}
      {selectedVenueForDetails && (
        <VenueDetailsModal
          venue={selectedVenueForDetails}
          bookings={bookings}
          onClose={() => setSelectedVenueForDetails(null)}
          onBookClick={(venue) => handleOpenBookingModal(venue)}
        />
      )}

      {/* Booking Modal */}
      {bookingModalOpen && (
        <BookingModal
          venues={venues}
          existingBookings={bookings}
          currentUser={currentUser}
          allowedUsers={allowedUsers}
          initialVenue={bookingModalInitialData.venue}
          initialDate={bookingModalInitialData.date}
          initialTime={bookingModalInitialData.time}
          initialEmail={currentUser?.email || ''}
          initialOrganizer={
            currentUser?.society || 
            allowedUsers.find(u => (u.email || '').toLowerCase().trim() === (currentUser?.email || '').toLowerCase().trim())?.society || 
            (currentUser?.isUnionAdmin ? 'College Union Senate' : '')
          }
          onClose={() => setBookingModalOpen(false)}
          onSubmitBooking={handleCreateBooking}
        />
      )}

      {/* Club Profile Editor Modal */}
      {profileModalOpen && selectedClubForEdit && (
        <ClubProfileModal
          isOpen={profileModalOpen}
          club={selectedClubForEdit}
          onClose={() => {
            setProfileModalOpen(false);
            setSelectedClubForEdit(null);
          }}
          onSaveProfile={handleSaveClubProfile}
        />
      )}

      {/* Event Details Modal (from Clubs view) */}
      {selectedEventForModal && (
        <ErrorBoundary
          title="Unable to Display Event Details"
          onReset={() => setSelectedEventForModal(null)}
        >
          <EventDetailsModal
            event={selectedEventForModal}
            venue={venues.find(v => v.id === selectedEventForModal.venueId)}
            onClose={() => setSelectedEventForModal(null)}
            currentUser={currentUser}
            onAdminRevokeClick={handleAdminCancelBooking ? (event) => handleAdminCancelBooking(event.id, 'Revoked by Union Admin') : null}
            onClubCancelClick={handleClubCancelBooking ? (bookingId, reason, cancelPackage) => handleClubCancelBooking(bookingId, reason, cancelPackage) : null}
            allBookings={bookings}
          />
        </ErrorBoundary>
      )}

      {/* Footer with Database Status Indicator */}
      <footer className="border-t border-gray-100 py-6 bg-white text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-gray-50 p-1 rounded-lg border border-gray-200">
              <img src="/mec_college_logo.webp" alt="MEC" className="w-5 h-5 object-contain bg-white rounded p-0.5" />
              <img src="/union_mec_logo.webp" alt="Union MEC" className="w-5 h-5 object-contain bg-white rounded p-0.5" />
            </div>
            <div className="text-gray-500 text-left">
              © 2026 <strong className="text-gray-800">Govt. Model Engineering College</strong> • Managed by <strong style={{color:'#DC2626'}}>Union MEC</strong>
            </div>
          </div>

          {/* Cloud Sync Status */}
          <div className="flex items-center gap-2 text-[11px] bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
            {isFirebaseConfigured ? (
              <>
                <span className="w-2 h-2 rounded-full animate-pulse" style={{backgroundColor:'#10B981'}} />
                <span className="font-medium" style={{color:'#059669'}}>Cloud Database Connected (Live Sync)</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full" style={{backgroundColor:'#6B7280'}} />
                <span className="text-gray-500">Local Cache Mode (Ready for Cloud Sync)</span>
              </>
            )}
          </div>
        </div>
      </footer>

      {/* Vercel Web Analytics & Speed Performance Monitoring */}
      <Analytics />
      <SpeedInsights />

    </div>
  );
}
