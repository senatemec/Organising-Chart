import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  AlertCircle, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCw,
  UserCheck,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { dbSignInWithGoogleCredential, dbSignInWithGooglePopup } from '../services/firebase';

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
  const [unauthorizedEmail, setUnauthorizedEmail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
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

  // Process authenticated user details & check authorization
  const processAuthenticatedUser = (email, name, picture) => {
    if (!email) {
      setAuthError('Could not retrieve email from Google. Please try again.');
      return;
    }
    const userEmail = email.toLowerCase().trim();

    // senatemec@mec.ac.in receives Union Admin controls!
    const isSenateAdmin = userEmail === 'senatemec@mec.ac.in' || 
                         userEmail === 'senate@mec.ac.in' || 
                         userEmail.startsWith('senatemec@') ||
                         userEmail.startsWith('senate@') || 
                         userEmail === 'union@mec.ac.in';

    const isWhitelisted = allowedUsers.some(u => (u.email || '').toLowerCase().trim() === userEmail);

    // Access Control Enforcement:
    if (strictAuthEnabled && !isSenateAdmin && !isWhitelisted) {
      setUnauthorizedEmail(userEmail);
      setAuthError(`Access Restricted: "${userEmail}" is not on the Union MEC authorized organizer whitelist.`);
      return;
    }

    const matchedUser = allowedUsers.find(u => (u.email || '').toLowerCase().trim() === userEmail);

    const account = {
      name: name || userEmail.split('@')[0],
      email: userEmail,
      avatar: picture || (isSenateAdmin ? '/union_mec_logo.webp' : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'),
      isUnionAdmin: isSenateAdmin,
      society: matchedUser?.society || (isSenateAdmin ? 'Union Senate' : 'Authorized Organizer'),
      role: isSenateAdmin ? 'Union Senate Executive' : (matchedUser?.note || 'Authorized Organizer')
    };

    setAuthError(null);
    setUnauthorizedEmail(null);
    onLoginSuccess(account);
    onClose();
  };

  // Primary Google Sign-In with Guaranteed Account Chooser (GIS OAuth2 Token Client)
  const handleSignInWithGoogle = () => {
    setIsLoading(true);
    setAuthError(null);
    setUnauthorizedEmail(null);

    // Method 1: Google Identity Services Token Client with prompt: 'select_account'
    if (window.google?.accounts?.oauth2) {
      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'email profile openid',
          prompt: 'select_account',
          callback: async (tokenResponse) => {
            setIsLoading(false);
            if (tokenResponse.error) {
              if (tokenResponse.error === 'access_denied') {
                setAuthError('Sign-in was cancelled. Please select your Google account.');
              } else {
                setAuthError(`Sign-in error: ${tokenResponse.error_description || tokenResponse.error}`);
              }
              return;
            }

            if (tokenResponse.access_token) {
              try {
                const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                });
                const profile = await res.json();
                if (profile && profile.email) {
                  processAuthenticatedUser(profile.email, profile.name, profile.picture);
                } else {
                  setAuthError('Could not retrieve user details from Google. Please try again.');
                }
              } catch (fetchErr) {
                console.error('Error fetching Google profile:', fetchErr);
                setAuthError('Failed to fetch user details from Google. Please try again.');
              }
            }
          }
        });
        client.requestAccessToken({ prompt: 'select_account' });
        return;
      } catch (err) {
        console.warn('GIS TokenClient init warning, trying popup fallback:', err);
      }
    }

    // Method 2: Firebase Auth Popup Fallback
    dbSignInWithGooglePopup()
      .then((user) => {
        setIsLoading(false);
        if (user && user.email) {
          processAuthenticatedUser(user.email, user.displayName, user.photoURL);
        }
      })
      .catch((err) => {
        setIsLoading(false);
        if (err.code === 'auth/popup-blocked') {
          setAuthError('Popup was blocked by your browser settings. Please allow popups for localhost / this site or use the one-click button below.');
        } else if (err.code === 'auth/popup-closed-by-user') {
          setAuthError('Google sign-in popup was closed before completing.');
        } else {
          setAuthError(err.message || 'Google Sign-In encountered an error. Please try again.');
        }
      });
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

  // Initialize Google Identity Services (GIS) button as 1-click fallback
  useEffect(() => {
    if (!isOpen || !sdkReady || !googleBtnRef.current) return;

    try {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response) => {
          if (response.credential) {
            try {
              await dbSignInWithGoogleCredential(response.credential);
            } catch (authErr) {
              console.warn('Firebase Auth credential link notice:', authErr);
            }

            const payload = parseJwt(response.credential);
            if (payload && payload.email) {
              processAuthenticatedUser(payload.email, payload.name, payload.picture);
            } else {
              setAuthError('Could not verify Google account details. Please try again.');
            }
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true
      });

      googleBtnRef.current.innerHTML = '';
      const buttonWidth = Math.min(280, Math.max(220, window.innerWidth - 80));
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'medium',
        text: 'signin_with',
        shape: 'pill',
        logo_alignment: 'left',
        width: buttonWidth
      });
    } catch (err) {
      console.warn('Google GIS button render notice:', err);
    }
  }, [isOpen, sdkReady, allowedUsers, strictAuthEnabled]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay animate-fade-in" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="glass-panel w-full max-w-md rounded-2xl sm:rounded-3xl border border-gray-200 p-5 sm:p-7 md:p-8 relative bg-white shadow-2xl space-y-5 sm:space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gray-100 text-gray-500 hover:text-gray-900 hover:bg-gray-200 flex items-center justify-center transition-colors border border-gray-200"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <img src="/mec_college_logo.webp" alt="MEC Logo" className="w-10 h-10 object-contain rounded-xl bg-white p-1 border border-gray-200 shadow-sm" />
            <img src="/union_mec_logo.webp" alt="Union MEC" className="w-10 h-10 object-contain rounded-xl bg-white p-1 border border-gray-200 shadow-sm" />
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

        {/* Error Notification with Switch Account CTA */}
        {authError && (
          <div className="border p-3.5 rounded-xl space-y-2.5 text-xs animate-fade-in" style={{ background: '#FFF5F5', borderColor: '#FCA5A5', color: '#7F1D1D' }}>
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="leading-relaxed font-semibold">{authError}</span>
                {unauthorizedEmail && (
                  <div className="text-[11px] text-gray-600 pt-0.5">
                    Attempted: <span className="font-mono font-bold text-red-800">{unauthorizedEmail}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={handleSignInWithGoogle}
                disabled={isLoading}
                className="w-full btn-primary text-xs py-2 px-3 flex items-center justify-center gap-1.5 font-bold shadow-sm"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Switch / Choose Another Google Account</span>
              </button>
            </div>
          </div>
        )}

        {/* Main Sign-In Controls */}
        <div className="space-y-3.5">
          {/* PRIMARY GOOGLE BUTTON (Guaranteed Account Chooser) */}
          <button
            type="button"
            onClick={handleSignInWithGoogle}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 font-bold text-sm shadow-sm hover:shadow-md transition-all active:scale-[0.99] disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 text-red-600 animate-spin" />
                <span>Opening Google Account Chooser...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          {/* Secondary / Alternate GIS One-Tap Button Container */}
          <div className="flex flex-col items-center justify-center pt-1">
            <div ref={googleBtnRef} className="flex justify-center" style={{ colorScheme: 'light' }} />
          </div>

          <div className="text-[11px] text-center space-y-1 p-3 rounded-xl border" style={{ background: '#F9FAFB', borderColor: '#E5E7EB', color: '#4B5563' }}>
            <p className="font-bold text-gray-900">🔒 Authorized Access Control</p>
            <p className="text-gray-600">
              Only authorized Gmail accounts approved by <strong className="font-bold text-red-700">Union MEC</strong> can book campus venues.
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
