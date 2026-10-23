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
import {
  getAuth,
  signInWithCredential,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { 
  initialVenues, 
  initialBookings, 
  initialAllowedUsers, 
  initialUnionMembers, 
  initialClassRepresentatives,
  initialComplaints 
} from '../data/mockData';

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
let auth = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    db = getFirestore(app);
    auth = getAuth(app);
  } catch (err) {
    console.error('Firebase initialization error:', err);
  }
}

/**
 * Sign in to Firebase Auth using Google OAuth Popup with account selection prompt
 */
export async function dbSignInWithGooglePopup() {
  if (!auth) throw new Error('Firebase Auth is not initialized');
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: 'select_account'
  });
  const userCredential = await signInWithPopup(auth, provider);
  return userCredential.user;
}

/**
 * Sign in to Firebase Auth using Google OAuth ID Token (Credential)
 */
export async function dbSignInWithGoogleCredential(idToken) {
  if (!auth) return null;
  try {
    const credential = GoogleAuthProvider.credential(idToken);
    const userCredential = await signInWithCredential(auth, credential);
    return userCredential.user;
  } catch (err) {
    console.warn('Firebase Auth credential link notice:', err);
    return null;
  }
}

/**
 * Sign out from Firebase Auth
 */
export async function dbSignOut() {
  if (!auth) return;
  try {
    await signOut(auth);
  } catch (err) {
    console.warn('Firebase Auth signOut notice:', err);
  }
}

/**
 * Listen to Firebase Auth state
 */
export function subscribeToAuthState(onUserChanged) {
  if (!auth) return () => {};
  return onAuthStateChanged(auth, onUserChanged);
}

/**
 * Seed default campus venues and authorized accounts to Firestore if empty
 */
export async function seedInitialFirestoreData() {
  if (!db) return;

  try {
    const venuesSnap = await getDocs(collection(db, 'venues'));
    if (venuesSnap.empty) {
      console.log('Seeding initial campus venues to Firestore...');
      for (const venue of initialVenues) {
        await setDoc(doc(db, 'venues', venue.id), venue);
      }
    } else {
      // Sync official images and updated capacities to Firestore
      for (const venue of initialVenues) {
        await setDoc(doc(db, 'venues', venue.id), { 
          capacity: venue.capacity,
          ...(venue.image && venue.image.startsWith('/') ? { image: venue.image } : {})
        }, { merge: true });
      }
    }

    // Seed / sync authorized club Gmail accounts whitelist to Firestore
    for (const user of initialAllowedUsers) {
      const cleanEmail = user.email.toLowerCase().trim();
      await setDoc(doc(db, 'allowed_users', cleanEmail), {
        email: cleanEmail,
        society: user.society,
        note: user.note,
        createdAt: new Date().toISOString()
      }, { merge: true });
    }

    // Clean up any unverified or automatically seeded mock clubs from Firestore
    try {
      const clubsSnap = await getDocs(collection(db, 'clubs'));
      for (const d of clubsSnap.docs) {
        const data = d.data();
        if (!data.updatedByUser) {
          await deleteDoc(doc(db, 'clubs', d.id));
        }
      }
    } catch (cleanErr) {
      console.warn('Firestore clubs cleanup notice:', cleanErr);
    }
    // Seed initial Union MEC office bearers if collection empty
    try {
      const membersSnap = await getDocs(collection(db, 'union_members'));
      if (membersSnap.empty) {
        console.log('Seeding initial Union MEC members to Firestore...');
        for (const member of initialUnionMembers) {
          await setDoc(doc(db, 'union_members', member.id), member);
        }
      }
    } catch (memErr) {
      console.warn('Firestore union members check notice:', memErr);
    }

    // Seed initial complaints & suggestions if collection empty
    try {
      const complaintsSnap = await getDocs(collection(db, 'complaints_suggestions'));
      if (complaintsSnap.empty) {
        console.log('Seeding initial complaints & suggestions to Firestore...');
        for (const complaint of initialComplaints) {
          await setDoc(doc(db, 'complaints_suggestions', complaint.id), complaint);
        }
      }
    } catch (cmpErr) {
      console.warn('Firestore complaints check notice:', cmpErr);
    }

    // Seed initial class representatives if collection empty
    try {
      const repsSnap = await getDocs(collection(db, 'class_representatives'));
      if (repsSnap.empty) {
        console.log('Seeding initial class representatives to Firestore...');
        for (const rep of initialClassRepresentatives) {
          await setDoc(doc(db, 'class_representatives', rep.id), rep);
        }
      }
    } catch (repErr) {
      console.warn('Firestore class reps check notice:', repErr);
    }
  } catch (err) {
    console.warn('Firestore initial data seed check:', err);
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
 * Real-time listener for Authorized Emails Whitelist
 */
export function subscribeToAllowedUsers(onData, onError) {
  if (!db) return () => {};

  return onSnapshot(collection(db, 'allowed_users'), (snapshot) => {
    const list = [];
    snapshot.forEach((doc) => {
      list.push({ ...doc.data(), email: doc.id });
    });
    onData(list);
  }, (err) => {
    console.error('Firestore Allowed Users Subscription Error:', err);
    if (onError) onError(err);
  });
}

/**
 * Real-time listener for Auth Settings (Strict Mode Toggle)
 */
export function subscribeToAuthSettings(onData, onError) {
  if (!db) return () => {};

  return onSnapshot(doc(db, 'settings', 'auth_policy'), (snapshot) => {
    if (snapshot.exists()) {
      onData(snapshot.data());
    } else {
      onData({ strictAuthEnabled: true });
    }
  }, (err) => {
    console.error('Firestore Auth Settings Error:', err);
    if (onError) onError(err);
  });
}

/**
 * Add or update an allowed user email in Firestore
 */
export async function dbAddAllowedUser(userEntry) {
  if (!db) return false;
  try {
    const cleanEmail = userEntry.email.toLowerCase().trim();
    await setDoc(doc(db, 'allowed_users', cleanEmail), {
      email: cleanEmail,
      note: userEntry.note || '',
      society: userEntry.society || '',
      addedBy: userEntry.addedBy || 'Union Admin',
      addedAt: new Date().toISOString()
    });
    return true;
  } catch (err) {
    console.error('Failed to add allowed user in Firestore:', err);
    throw err;
  }
}

/**
 * Remove an allowed user email from Firestore
 */
export async function dbRemoveAllowedUser(email) {
  if (!db) return false;
  try {
    const cleanEmail = email.toLowerCase().trim();
    await deleteDoc(doc(db, 'allowed_users', cleanEmail));
    return true;
  } catch (err) {
    console.error('Failed to remove allowed user in Firestore:', err);
    throw err;
  }
}

/**
 * Toggle strict authentication policy in Firestore
 */
export async function dbUpdateAuthSettings(settings) {
  if (!db) return false;
  try {
    await setDoc(doc(db, 'settings', 'auth_policy'), settings, { merge: true });
    return true;
  } catch (err) {
    console.error('Failed to update auth settings in Firestore:', err);
    throw err;
  }
}

function sanitizeBookingData(booking) {
  if (!booking) return {};
  const clean = { ...booking };
  Object.keys(clean).forEach(key => {
    if (clean[key] === undefined) {
      clean[key] = null;
    }
  });
  return clean;
}

/**
 * Create or save a booking (or batch array of bookings) to Firestore
 */
export async function dbCreateBooking(bookingOrList) {
  if (!db) return false;
  try {
    if (Array.isArray(bookingOrList)) {
      await Promise.all(
        bookingOrList.map(b => {
          const clean = sanitizeBookingData(b);
          return setDoc(doc(db, 'bookings', clean.id), clean);
        })
      );
    } else {
      const clean = sanitizeBookingData(bookingOrList);
      await setDoc(doc(db, 'bookings', clean.id), clean);
    }
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
    const clean = sanitizeBookingData(updates);
    await setDoc(doc(db, 'bookings', bookingId), clean, { merge: true });
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
    await setDoc(doc(db, 'venues', venueId), { status }, { merge: true });
    return true;
  } catch (err) {
    console.error('Failed to update venue status in Firestore:', err);
    throw err;
  }
}

/**
 * Real-time listener for College Clubs & Societies
 */
export function subscribeToClubs(onData, onError) {
  if (!db) return () => {};

  return onSnapshot(collection(db, 'clubs'), (snapshot) => {
    const list = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data && data.name && data.name.trim()) {
        list.push({ ...data, id: doc.id });
      }
    });
    onData(list);
  }, (err) => {
    console.warn('Firestore Clubs Subscription notice (operating with local clubs cache):', err);
    if (onError) onError(err);
  });
}

/**
 * Update or create club profile in Firestore (marks updatedByUser = true)
 */
export async function dbUpdateClubProfile(clubId, updates) {
  if (!db) return false;
  try {
    const clean = sanitizeBookingData({
      ...updates,
      updatedByUser: true,
      updatedAt: new Date().toISOString()
    });
    await setDoc(doc(db, 'clubs', clubId), clean, { merge: true });
    return true;
  } catch (err) {
    console.warn('Firestore club profile sync notice (saved locally in browser):', err);
    return false;
  }
}

/**
 * Real-time listener for Club Activity & Change Logs
 */
export function subscribeToActivityLogs(onData, onError) {
  if (!db) return () => {};

  return onSnapshot(collection(db, 'activity_logs'), (snapshot) => {
    const list = [];
    snapshot.forEach((doc) => {
      list.push({ ...doc.data(), id: doc.id });
    });
    list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    onData(list);
  }, (err) => {
    console.warn('Firestore Activity Logs Subscription notice:', err);
    if (onError) onError(err);
  });
}

/**
 * Save a new activity log entry to Firestore
 */
export async function dbAddActivityLog(logEntry) {
  if (!db || !logEntry) return false;
  try {
    const clean = sanitizeBookingData(logEntry);
    await setDoc(doc(db, 'activity_logs', clean.id), clean);
    return true;
  } catch (err) {
    console.warn('Firestore activity log save notice (saved locally in browser):', err);
    return false;
  }
}

/**
 * Clear activity logs from Firestore
 */
export async function dbClearActivityLogs(logIds = []) {
  if (!db) return false;
  try {
    for (const id of logIds) {
      await deleteDoc(doc(db, 'activity_logs', id));
    }
    return true;
  } catch (err) {
    console.warn('Firestore activity logs clear notice:', err);
    return false;
  }
}

/**
 * Real-time listener for Union MEC Office Bearers (About Tab)
 */
export function subscribeToUnionMembers(onData, onError) {
  if (!db) return () => {};

  return onSnapshot(collection(db, 'union_members'), (snapshot) => {
    const list = [];
    snapshot.forEach((doc) => {
      list.push({ ...doc.data(), id: doc.id });
    });
    list.sort((a, b) => (Number(a.order) || 99) - (Number(b.order) || 99));
    onData(list);
  }, (err) => {
    console.warn('Firestore Union Members Subscription notice:', err);
    if (onError) onError(err);
  });
}

/**
 * Add a new Union MEC member to Firestore
 */
export async function dbAddUnionMember(member) {
  if (!db || !member) return false;
  try {
    const clean = sanitizeBookingData(member);
    await setDoc(doc(db, 'union_members', clean.id), clean);
    return true;
  } catch (err) {
    console.warn('Firestore add union member notice (saved locally):', err);
    return false;
  }
}

/**
 * Update an existing Union MEC member in Firestore
 */
export async function dbUpdateUnionMember(memberId, updates) {
  if (!db || !memberId) return false;
  try {
    const clean = sanitizeBookingData(updates);
    await setDoc(doc(db, 'union_members', memberId), clean, { merge: true });
    return true;
  } catch (err) {
    console.warn('Firestore update union member notice:', err);
    return false;
  }
}

/**
 * Delete a Union MEC member from Firestore
 */
export async function dbDeleteUnionMember(memberId) {
  if (!db || !memberId) return false;
  try {
    await deleteDoc(doc(db, 'union_members', memberId));
    return true;
  } catch (err) {
    console.warn('Firestore delete union member notice:', err);
    return false;
  }
}

/**
 * Real-time listener for Complaints & Suggestions
 */
export function subscribeToComplaints(onData, onError) {
  if (!db) return () => {};

  return onSnapshot(collection(db, 'complaints_suggestions'), (snapshot) => {
    const list = [];
    snapshot.forEach((doc) => {
      list.push({ ...doc.data(), id: doc.id });
    });
    list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    onData(list);
  }, (err) => {
    console.warn('Firestore Complaints Subscription notice:', err);
    if (onError) onError(err);
  });
}

/**
 * Add a new complaint or suggestion to Firestore
 */
export async function dbAddComplaint(complaint) {
  if (!db || !complaint) return false;
  try {
    const clean = sanitizeBookingData(complaint);
    await setDoc(doc(db, 'complaints_suggestions', clean.id), clean);
    return true;
  } catch (err) {
    console.warn('Firestore add complaint notice (saved locally):', err);
    return false;
  }
}

/**
 * Update official admin comment and status on a complaint/suggestion in Firestore
 */
export async function dbUpdateComplaintComment(complaintId, updates) {
  if (!db || !complaintId) return false;
  try {
    const clean = sanitizeBookingData(updates);
    await setDoc(doc(db, 'complaints_suggestions', complaintId), clean, { merge: true });
    return true;
  } catch (err) {
    console.warn('Firestore update complaint comment notice:', err);
    return false;
  }
}

/**
 * Update complaint/suggestion status in Firestore
 */
export async function dbUpdateComplaintStatus(complaintId, status) {
  if (!db || !complaintId) return false;
  try {
    await setDoc(doc(db, 'complaints_suggestions', complaintId), { status }, { merge: true });
    return true;
  } catch (err) {
    console.warn('Firestore update complaint status notice:', err);
    return false;
  }
}

/**
 * Delete a complaint or suggestion from Firestore
 */
export async function dbDeleteComplaint(complaintId) {
  if (!db || !complaintId) return false;
  try {
    await deleteDoc(doc(db, 'complaints_suggestions', complaintId));
    return true;
  } catch (err) {
    console.warn('Firestore delete complaint notice:', err);
    return false;
  }
}

/**
 * Real-time listener for Class Representatives
 */
export function subscribeToClassRepresentatives(onData, onError) {
  if (!db) return () => {};

  return onSnapshot(collection(db, 'class_representatives'), (snapshot) => {
    const list = [];
    snapshot.forEach((doc) => {
      list.push({ ...doc.data(), id: doc.id });
    });
    onData(list);
  }, (err) => {
    console.warn('Firestore Class Reps Subscription notice:', err);
    if (onError) onError(err);
  });
}

/**
 * Add a new Class Representative to Firestore
 */
export async function dbAddClassRepresentative(rep) {
  if (!db || !rep) return false;
  try {
    const clean = sanitizeBookingData(rep);
    await setDoc(doc(db, 'class_representatives', clean.id), clean);
    return true;
  } catch (err) {
    console.warn('Firestore add class rep notice:', err);
    return false;
  }
}

/**
 * Update a Class Representative in Firestore
 */
export async function dbUpdateClassRepresentative(repId, updates) {
  if (!db || !repId) return false;
  try {
    const clean = sanitizeBookingData(updates);
    await setDoc(doc(db, 'class_representatives', repId), clean, { merge: true });
    return true;
  } catch (err) {
    console.warn('Firestore update class rep notice:', err);
    return false;
  }
}

/**
 * Delete a Class Representative from Firestore
 */
export async function dbDeleteClassRepresentative(repId) {
  if (!db || !repId) return false;
  try {
    await deleteDoc(doc(db, 'class_representatives', repId));
    return true;
  } catch (err) {
    console.warn('Firestore delete class rep notice:', err);
    return false;
  }
}




