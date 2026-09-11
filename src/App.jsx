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

import { initialVenues, initialBookings } from './data/mockData';
import { 
  isFirebaseConfigured, 
  seedInitialFirestoreData, 
  subscribeToBookings, 
  subscribeToVenues, 
  subscribeToAllowedUsers,
  subscribeToAuthSettings,
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
    const saved = localStorage.getItem('cs_venues_v14');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 10) {
          return initialVenues.map(initV => {
            const savedV = parsed.find(v => v.id === initV.id);
            if (!savedV) return initV;
            const image = (initV.image && initV.image.startsWith('/')) ? initV.image : (savedV.image || initV.image);
            return { ...initV, ...savedV, image };
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
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return initialBookings;
  });

  // Allowed Users (Whitelist of authorized booking accounts)
  const [allowedUsers, setAllowedUsers] = useState(() => {
    const saved = localStorage.getItem('cs_allowed_users_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [];
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

  // Modals
  const [selectedVenueForDetails, setSelectedVenueForDetails] = useState(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingModalInitialData, setBookingModalInitialData] = useState({
    venue: null,
    date: '2026-09-05',
    time: '10:00'
  });

  // Google Auth Modal State
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMessage, setAuthModalMessage] = useState('');
  const [pendingBookingPayload, setPendingBookingPayload] = useState(null);

  // Real-time Cloud Database Synchronization
  useEffect(() => {
    if (isFirebaseConfigured) {
      seedInitialFirestoreData();

      const unsubscribeBookings = subscribeToBookings((liveBookings) => {
        if (liveBookings) {
          setBookings(liveBookings);
        }
      });

      const unsubscribeVenues = subscribeToVenues((liveVenues) => {
        if (liveVenues && liveVenues.length > 0) {
          const merged = initialVenues.map(initV => {
            const liveV = liveVenues.find(v => v.id === initV.id);
            if (!liveV) return initV;
            const image = (initV.image && initV.image.startsWith('/')) ? initV.image : (liveV.image || initV.image);
            return {
              ...initV,
              ...liveV,
              image
            };
          });
          setVenues(merged);
        }
      });

      const unsubscribeAllowedUsers = subscribeToAllowedUsers((liveAllowedUsers) => {
        if (liveAllowedUsers) {
          setAllowedUsers(liveAllowedUsers);
        }
      });

      const unsubscribeAuthSettings = subscribeToAuthSettings((policy) => {
        if (policy && typeof policy.strictAuthEnabled === 'boolean') {
          setStrictAuthEnabled(policy.strictAuthEnabled);
        }
      });

      return () => {
        unsubscribeBookings();
        unsubscribeVenues();
        unsubscribeAllowedUsers();
        unsubscribeAuthSettings();
      };
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cs_venues_v14', JSON.stringify(venues));
  }, [venues]);

  useEffect(() => {
    localStorage.setItem('cs_bookings_v8', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('cs_allowed_users_v1', JSON.stringify(allowedUsers));
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

  // Remove Allowed User from Whitelist
  const handleRemoveAllowedUser = async (email) => {
    const cleanEmail = email.toLowerCase().trim();
    setAllowedUsers(allowedUsers.filter(u => u.email.toLowerCase() !== cleanEmail));

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
    if (Array.isArray(bookingOrList)) {
      setBookings([...bookingOrList, ...bookings]);
      if (isFirebaseConfigured) {
        try {
          await dbCreateBooking(bookingOrList);
        } catch (e) {
          console.error('Firebase batch create error:', e);
        }
      }
      const eventTitle = bookingOrList[0]?.eventTitle || 'Event';
      showToast(`Event "${eventTitle}" confirmed across ${bookingOrList.length} venues!`, 'success');
    } else {
      setBookings([bookingOrList, ...bookings]);
      if (isFirebaseConfigured) {
        try {
          await dbCreateBooking(bookingOrList);
        } catch (e) {
          console.error('Firebase create error:', e);
        }
      }
      showToast(`Booking ${bookingOrList.id} confirmed for ${bookingOrList.venueName}!`, 'success');
    }
  };

  // Union Admin Cancel with message
  const handleAdminCancelBooking = async (bookingId, reason) => {
    const updates = {
      status: 'cancelled',
      cancelledBy: currentUser?.email || 'Union Admin',
      cancellationReason: reason
    };

    setBookings(bookings.map((b) => b.id === bookingId ? { ...b, ...updates } : b));
    
    if (isFirebaseConfigured) {
      try {
        await dbUpdateBooking(bookingId, updates);
      } catch (e) {
        console.error('Firebase update error:', e);
      }
    }

    showToast(`Booking ${bookingId} cancelled by Union Admin.`, 'error');
  };

  // Student cancel own booking / Admin purge booking
  const handleCancelBooking = async (bookingId) => {
    setBookings(bookings.filter(b => b.id !== bookingId));

    if (isFirebaseConfigured) {
      try {
        await dbDeleteBooking(bookingId);
      } catch (e) {
        console.error('Firebase delete error:', e);
      }
    }

    showToast(`Booking ${bookingId} deleted.`, 'info');
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
        onLogout={handleLogout}
        onNewBookingClick={() => handleOpenBookingModal()}
      />

      {/* Main Workspace Container */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 pb-16 flex-1 w-full space-y-6">
        
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
            onSlotClick={(venue, date, slot) => handleOpenBookingModal(venue, date, slot)}
          />
        )}

        {/* Tab 3: My Bookings (Filtered by logged in Google user) */}
        {activeTab === 'my-bookings' && (
          <MyBookings
            bookings={bookings}
            venues={venues}
            currentUser={currentUser}
            onOpenLoginModal={(msg) => triggerAuthModal(msg)}
            onNewBookingClick={() => handleOpenBookingModal()}
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

      {/* Footer with Database Status Indicator */}
      <footer className="border-t border-gray-100 py-6 bg-white text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-gray-50 p-1 rounded-lg border border-gray-200">
              <img src="/mec_college_logo.png" alt="MEC" className="w-5 h-5 object-contain bg-white rounded p-0.5" />
              <img src="/union_mec_logo.png" alt="Union MEC" className="w-5 h-5 object-contain bg-white rounded p-0.5" />
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

    </div>
  );
}
