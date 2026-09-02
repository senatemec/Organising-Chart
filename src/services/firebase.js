import { initializeApp, getApps } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  onSnapshot, 
  updateDoc, 
  deleteDoc, 
  query 
} from 'firebase/firestore';
import { initialVenues, initialBookings } from '../data/mockData';

// Firebase configuration with environment variables and project defaults
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAffMJaBxMcWsOTH57ZkK2ygKx3Hx6cyCw",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "oc-sheet-507420.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "oc-sheet-507420",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "oc-sheet-507420.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "339715089734",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:339715089734:web:0ec2588660ae131cfc3147",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-6R539ERFJ2"
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && 
  firebaseConfig.projectId
);

let db = null;
let app = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    db = getFirestore(app);
  } catch (err) {
    console.error('Firebase initialization error:', err);
  }
}

/**
 * Seed default venues and sample bookings to Firestore if collection is empty
 */
export async function seedInitialFirestoreData() {
  if (!db) return;

  try {
    const venuesSnap = await getDocs(collection(db, 'venues'));
    if (venuesSnap.empty) {
      console.log('Seeding initial venues to Firestore...');
      for (const venue of initialVenues) {
        await setDoc(doc(db, 'venues', venue.id), venue);
      }
    }

    const bookingsSnap = await getDocs(collection(db, 'bookings'));
    if (bookingsSnap.empty) {
      console.log('Seeding initial bookings to Firestore...');
      for (const booking of initialBookings) {
        await setDoc(doc(db, 'bookings', booking.id), booking);
      }
    }
  } catch (err) {
    console.warn('Firestore initial data check/seed:', err);
  }
}

/**
 * Real-time listener for Bookings
 */
export function subscribeToBookings(onData, onError) {
  if (!db) return () => {};

  const q = query(collection(db, 'bookings'));
  return onSnapshot(q, (snapshot) => {
    const list = [];
    snapshot.forEach((doc) => {
      list.push({ ...doc.data(), id: doc.id });
    });
    onData(list);
  }, (err) => {
    console.error('Firestore Bookings Subscription Error:', err);
    if (onError) onError(err);
  });
}

/**
 * Real-time listener for Venues
 */
export function subscribeToVenues(onData, onError) {
  if (!db) return () => {};

  return onSnapshot(collection(db, 'venues'), (snapshot) => {
    const list = [];
    snapshot.forEach((doc) => {
      list.push({ ...doc.data(), id: doc.id });
    });
    onData(list);
  }, (err) => {
    console.error('Firestore Venues Subscription Error:', err);
    if (onError) onError(err);
  });
}

/**
 * Create or save a booking to Firestore
 */
export async function dbCreateBooking(booking) {
  if (!db) return false;
  try {
    await setDoc(doc(db, 'bookings', booking.id), booking);
    return true;
  } catch (err) {
    console.error('Failed to create booking in Firestore:', err);
    throw err;
  }
}

/**
 * Update an existing booking (e.g. Admin cancellation with reason)
 */
export async function dbUpdateBooking(bookingId, updates) {
  if (!db) return false;
  try {
    await updateDoc(doc(db, 'bookings', bookingId), updates);
    return true;
  } catch (err) {
    console.error('Failed to update booking in Firestore:', err);
    throw err;
  }
}

/**
 * Delete a booking
 */
export async function dbDeleteBooking(bookingId) {
  if (!db) return false;
  try {
    await deleteDoc(doc(db, 'bookings', bookingId));
    return true;
  } catch (err) {
    console.error('Failed to delete booking in Firestore:', err);
    throw err;
  }
}

/**
 * Update venue status (e.g. Maintenance toggle)
 */
export async function dbUpdateVenueStatus(venueId, status) {
  if (!db) return false;
  try {
    await updateDoc(doc(db, 'venues', venueId), { status });
    return true;
  } catch (err) {
    console.error('Failed to update venue status in Firestore:', err);
    throw err;
  }
}
