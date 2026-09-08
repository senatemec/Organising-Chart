import React, { useState, useEffect, useRef } from 'react';
import { X, ShieldCheck, Lock, AlertCircle, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';
import { dbSignInWithGoogleCredential } from '../services/firebase';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '339715089734-il7f8qb0mrpg7nlm35edqutdnu7761ov.apps.googleusercontent.com';

export default function GoogleAuthModal({ 
  isOpen, 
  onClose, 
  onLoginSuccess, 
  intendedActionMessage,
  allowedUsers = [],
  strictAuthEnabled = true
}) {
  const [authError, setAuthError] = useState(null);
  const [sdkReady, setSdkReady] = useState(false);
  const googleBtnRef = useRef(null);

  // Helper to parse JWT payload from Google GIS response
  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  // Check if Google SDK script is ready
  useEffect(() => {
    if (!isOpen) return;

    const checkGsiReady = () => {
      if (window.google && window.google.accounts && window.google.accounts.id) {
        setSdkReady(true);
      } else {
        setTimeout(checkGsiReady, 150);
      }
    };
    checkGsiReady();
  }, [isOpen]);

  // Initialize Google Identity Services automatically
  useEffect(() => {
    if (!isOpen || !sdkReady || !googleBtnRef.current) return;

    try {
      setAuthError(null);
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response) => {
          if (response.credential) {
            // Authenticate directly with Firebase Auth backend
            try {
              await dbSignInWithGoogleCredential(response.credential);
            } catch (authErr) {
              console.warn('Firebase Auth backend sync notice:', authErr);
            }

            const payload = parseJwt(response.credential);
            if (payload && payload.email) {
              const userEmail = payload.email.toLowerCase().trim();
              
              // senatemec@mec.ac.in receives Union Admin controls!
              const isSenateAdmin = userEmail === 'senatemec@mec.ac.in' || 
                                   userEmail === 'senate@mec.ac.in' || 
                                   userEmail.startsWith('senatemec@') ||
                                   userEmail.startsWith('senate@') || 
                                   userEmail === 'union@mec.ac.in';

              const isWhitelisted = allowedUsers.some(u => (u.email || '').toLowerCase().trim() === userEmail);

              // Access Control Enforcement:
              if (strictAuthEnabled && !isSenateAdmin && !isWhitelisted) {
                setAuthError(`Access Restricted: "${userEmail}" is not authorized by Union MEC to book college venues. Please contact senatemec@mec.ac.in to add your email to the approved organizer list.`);
                return;
              }

              const matchedUser = allowedUsers.find(u => (u.email || '').toLowerCase().trim() === userEmail);

              const account = {
                name: payload.name || userEmail.split('@')[0],
                email: userEmail,
                avatar: payload.picture || (isSenateAdmin ? '/union_mec_logo.png' : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'),
                isUnionAdmin: isSenateAdmin,
                society: matchedUser?.society || (isSenateAdmin ? 'Union Senate' : 'Authorized Organizer'),
                role: isSenateAdmin ? 'Union Senate Executive' : (matchedUser?.note || 'Authorized Organizer')
              };

              onLoginSuccess(account);
              onClose();
            } else {
              setAuthError('Could not verify Google account details. Please try again.');
            }
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true
      });

      // Clear existing button container and render Google official button
      googleBtnRef.current.innerHTML = '';
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'pill',
        logo_alignment: 'left',
        width: 320
      });

      // Trigger Google One-Tap prompt automatically
      window.google.accounts.id.prompt();
    } catch (err) {
      console.error('Google Auth Init Error:', err);
      setAuthError('Failed to initialize Google Sign-In.');
    }
  }, [isOpen, sdkReady, allowedUsers, strictAuthEnabled]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay animate-fade-in" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="glass-panel w-full max-w-md rounded-3xl border border-gray-200 p-6 sm:p-8 relative bg-white shadow-2xl space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-gray-100 text-gray-500 hover:text-gray-900 hover:bg-gray-200 flex items-center justify-center transition-colors border border-gray-200"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <img src="/mec_college_logo.png" alt="MEC Logo" className="w-10 h-10 object-contain rounded-xl bg-white p-1 border border-gray-200 shadow-sm" />
            <img src="/union_mec_logo.png" alt="Union MEC" className="w-10 h-10 object-contain rounded-xl bg-white p-1 border border-gray-200 shadow-sm" />
          </div>

          <div>
            <h2 className="text-xl font-extrabold tracking-tight" style={{ color: '#000000' }}>Sign In with Google</h2>
            <p className="text-xs mt-1" style={{ color: '#4B5563' }}>
              Govt. Model Engineering College Venue Portal
            </p>
          </div>
        </div>

        {/* Action Prompt message */}
        {intendedActionMessage && (
          <div className="border p-3 rounded-xl flex items-center gap-2 text-xs font-semibold" style={{ background: '#FFF5F5', borderColor: '#FECACA', color: '#991B1B' }}>
            <Sparkles className="w-4 h-4 text-red-600 shrink-0" />
            <span>{intendedActionMessage}</span>
          </div>
        )}

        {/* Error Notification */}
        {authError && (
          <div className="border p-3.5 rounded-xl flex items-start gap-2.5 text-xs animate-fade-in" style={{ background: '#FFF5F5', borderColor: '#FCA5A5', color: '#7F1D1D' }}>
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed font-semibold">{authError}</span>
          </div>
        )}

        {/* Official Google GIS Button Container */}
        <div className="space-y-4" style={{ colorScheme: 'light' }}>
          <div className="flex flex-col items-center justify-center min-h-[48px]" style={{ colorScheme: 'light' }}>
            <div ref={googleBtnRef} className="flex justify-center" style={{ colorScheme: 'light' }} />
          </div>

          <div className="text-[11px] text-center space-y-1 p-3 rounded-xl border" style={{ background: '#F9FAFB', borderColor: '#E5E7EB', color: '#4B5563' }}>
            <p className="font-bold" style={{ color: '#111827' }}>🔒 Authorized Access Control</p>
            <p style={{ color: '#4B5563' }}>
              Only authorized Gmail accounts approved by <strong className="font-bold" style={{ color: '#B91C1C' }}>Union MEC</strong> can book campus venues.
            </p>
          </div>
        </div>

        {/* Security Footer */}
        <div className="pt-2 border-t border-gray-200 text-center">
          <p className="text-[10px] text-gray-500">
            Protected by Google OAuth 2.0 • Admin: <span className="font-mono text-red-700 font-bold">senatemec@mec.ac.in</span>
          </p>
        </div>

      </div>
    </div>
  );
}
