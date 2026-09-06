import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  AlertCircle, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle,
  Mail,
  ArrowRight,
  Loader2,
  Crown,
  UserCheck
} from 'lucide-react';
import { signInWithFirebaseGoogle } from '../services/firebase';

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
  const [isLoading, setIsLoading] = useState(false);
  const [manualEmail, setManualEmail] = useState('');
  const [activeMode, setActiveMode] = useState('google'); // 'google' | 'email'
  
  const googleBtnRef = useRef(null);
  const allowedUsersRef = useRef(allowedUsers);
  const strictAuthRef = useRef(strictAuthEnabled);

  useEffect(() => {
    allowedUsersRef.current = allowedUsers;
    strictAuthRef.current = strictAuthEnabled;
  }, [allowedUsers, strictAuthEnabled]);

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

  // Central User Login Verification & Processing
  const processUserLogin = useCallback((userData) => {
    if (!userData || !userData.email) {
      setAuthError('Could not retrieve account email. Please try again.');
      setIsLoading(false);
      return;
    }

    const userEmail = userData.email.toLowerCase().trim();
    
    // Check if Union Admin
    const isSenateAdmin = 
      userEmail === 'senatemec@mec.ac.in' || 
      userEmail === 'senate@mec.ac.in' || 
      userEmail === 'union@mec.ac.in' || 
      userEmail === 'mohdshaddaad2005@gmail.com' ||
      userEmail.startsWith('senatemec@') ||
      userEmail.startsWith('senate@');

    const currentAllowed = allowedUsersRef.current || [];
    const isWhitelisted = currentAllowed.some(u => (u.email || '').toLowerCase().trim() === userEmail);

    // Access Control Policy Check
    if (strictAuthRef.current && !isSenateAdmin && !isWhitelisted) {
      setAuthError(`Access Restricted: "${userEmail}" is not authorized by Union MEC to book college venues. Please contact senatemec@mec.ac.in to get your email approved.`);
      setIsLoading(false);
      return;
    }

    const matchedUser = currentAllowed.find(u => (u.email || '').toLowerCase().trim() === userEmail);

    const account = {
      name: userData.name || userEmail.split('@')[0],
      email: userEmail,
      avatar: userData.avatar || userData.picture || (isSenateAdmin ? '/union_mec_logo.png' : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'),
      isUnionAdmin: isSenateAdmin,
      society: matchedUser?.society || (isSenateAdmin ? 'Union Senate' : 'Authorized Organizer'),
      role: isSenateAdmin ? 'Union Senate Executive' : (matchedUser?.note || 'Authorized Organizer')
    };

    setIsLoading(false);
    onLoginSuccess(account);
    onClose();
  }, [onLoginSuccess, onClose]);

  // Initialize Google Identity Services (GIS)
  useEffect(() => {
    if (!isOpen) {
      setAuthError(null);
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const setupGoogleGsi = () => {
      if (!window.google?.accounts?.id || !googleBtnRef.current) return;

      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response) => {
            if (response.credential) {
              const payload = parseJwt(response.credential);
              if (payload && payload.email) {
                processUserLogin({
                  email: payload.email,
                  name: payload.name,
                  avatar: payload.picture
                });
              }
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
          use_fedcm_for_prompt: true,
          ux_mode: 'popup'
        });

        if (googleBtnRef.current) {
          googleBtnRef.current.innerHTML = '';
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            shape: 'pill',
            logo_alignment: 'left',
            width: 300
          });
        }
      } catch (err) {
        console.warn('Google Identity Services render warning:', err);
      }
    };

    const timer = setTimeout(setupGoogleGsi, 200);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [isOpen, processUserLogin]);

  // Trigger Google OAuth 2.0 Popup on Primary Button Click
  const handleGooglePopupLogin = async () => {
    setAuthError(null);
    setIsLoading(true);

    // Method 1: Google OAuth2 Token Client (High Reliability Popup)
    if (window.google?.accounts?.oauth2) {
      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'email profile openid',
          callback: async (tokenResponse) => {
            if (tokenResponse && tokenResponse.access_token) {
              try {
                const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                });
                const profile = await res.json();
                processUserLogin({
                  email: profile.email,
                  name: profile.name,
                  avatar: profile.picture
                });
              } catch (fetchErr) {
                console.error('Failed to fetch user info from Google:', fetchErr);
                fallbackFirebaseOrEmail();
              }
            } else {
              setIsLoading(false);
            }
          },
          error_callback: (err) => {
            console.warn('Google OAuth2 error:', err);
            fallbackFirebaseOrEmail();
          }
        });

        client.requestAccessToken({ prompt: 'select_account' });
        return;
      } catch (e) {
        console.warn('Token client init error:', e);
      }
    }

    // Fallback: Firebase Google Popup or Direct
    fallbackFirebaseOrEmail();
  };

  const fallbackFirebaseOrEmail = async () => {
    try {
      const firebaseUser = await signInWithFirebaseGoogle();
      if (firebaseUser && firebaseUser.email) {
        processUserLogin({
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          avatar: firebaseUser.photoURL
        });
        return;
      }
    } catch (fbErr) {
      console.warn('Firebase Google Auth popup skipped/cancelled:', fbErr);
    }

    setIsLoading(false);
    // If popup was closed or unavailable, switch tab to direct email
    setActiveMode('email');
  };

  // Direct / Manual Email Sign In
  const handleManualEmailSubmit = (e) => {
    if (e) e.preventDefault();
    if (!manualEmail.trim()) {
      setAuthError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    setAuthError(null);

    processUserLogin({
      email: manualEmail.trim(),
      name: manualEmail.trim().split('@')[0],
      avatar: null
    });
  };

  // Quick One-Click Login Presets
  const handleQuickLogin = (presetEmail, presetName) => {
    setIsLoading(true);
    setAuthError(null);
    processUserLogin({
      email: presetEmail,
      name: presetName,
      avatar: presetEmail.includes('senatemec') ? '/union_mec_logo.png' : null
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay animate-fade-in" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="glass-panel w-full max-w-md rounded-3xl border border-white/20 p-6 sm:p-7 relative bg-slate-950 shadow-2xl space-y-5">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-900 text-slate-400 hover:text-white flex items-center justify-center transition-colors border border-white/10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2 pt-1">
          <div className="flex items-center justify-center gap-2">
            <img src="/mec_college_logo.png" alt="MEC Logo" className="w-9 h-9 object-contain rounded-xl bg-white p-1 shadow-md" />
            <img src="/union_mec_logo.png" alt="Union MEC" className="w-9 h-9 object-contain rounded-xl bg-white p-1 shadow-md" />
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">Sign In to Venue Portal</h2>
            <p className="text-xs text-slate-400">
              Govt. Model Engineering College • Union MEC
            </p>
          </div>
        </div>

        {/* Action Prompt message */}
        {intendedActionMessage && (
          <div className="bg-indigo-500/10 border border-indigo-500/20 p-2.5 rounded-xl flex items-center gap-2 text-xs text-indigo-300">
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>{intendedActionMessage}</span>
          </div>
        )}

        {/* Error Notification */}
        {authError && (
          <div className="bg-rose-500/15 border border-rose-500/40 p-3 rounded-xl flex items-start gap-2.5 text-xs text-rose-300 animate-fade-in">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              <span className="leading-relaxed block">{authError}</span>
              <button 
                onClick={() => handleQuickLogin('senatemec@mec.ac.in', 'Union Senate Admin')}
                className="text-[11px] underline text-rose-200 font-semibold hover:text-white"
              >
                Sign in as Union Admin instead
              </button>
            </div>
          </div>
        )}

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 gap-1 bg-slate-900/90 p-1 rounded-xl border border-white/10 text-xs font-semibold">
          <button
            onClick={() => { setActiveMode('google'); setAuthError(null); }}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeMode === 'google'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
            </svg>
            <span>Google Account</span>
          </button>

          <button
            onClick={() => { setActiveMode('email'); setAuthError(null); }}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeMode === 'email'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Direct Email</span>
          </button>
        </div>

        {/* Tab 1: Google OAuth Sign In */}
        {activeMode === 'google' && (
          <div className="space-y-3.5 animate-fade-in">
            {/* Primary Custom Interactive Google Sign-In Button */}
            <button
              onClick={handleGooglePopupLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-lg hover:shadow-indigo-500/20 transition-all border border-slate-200 active:scale-[0.98] disabled:opacity-60"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
              )}
              <span>{isLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
            </button>

            {/* Official Google GIS Embedded Element */}
            <div className="flex flex-col items-center justify-center min-h-[44px]">
              <div ref={googleBtnRef} className="flex justify-center scale-95" />
            </div>
          </div>
        )}

        {/* Tab 2: Direct Email Sign In */}
        {activeMode === 'email' && (
          <form onSubmit={handleManualEmailSubmit} className="space-y-3 animate-fade-in">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
                <span>Enter Authorized Email:</span>
                <span className="text-slate-500 font-normal">Gmail or College ID</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={manualEmail}
                  onChange={(e) => setManualEmail(e.target.value)}
                  placeholder="e.g. mohdshaddaad2005@gmail.com"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary text-xs py-2.5 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <span>Sign In with Email</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Quick Fast-Pass Logins */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
            <span className="flex-1 h-[1px] bg-white/10" />
            <span>Fast Pass Logins</span>
            <span className="flex-1 h-[1px] bg-white/10" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Quick Senate Admin Button */}
            <button
              type="button"
              onClick={() => handleQuickLogin('senatemec@mec.ac.in', 'Union Senate Admin')}
              className="flex items-center gap-2 p-2 rounded-xl bg-red-950/30 border border-red-500/30 hover:border-red-500/60 text-left transition-colors group"
            >
              <div className="w-7 h-7 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Crown className="w-3.5 h-3.5" />
              </div>
              <div className="overflow-hidden">
                <p className="text-[11px] font-bold text-red-200 leading-tight truncate">Union Admin</p>
                <p className="text-[9px] text-red-400/80 font-mono truncate">senatemec@mec.ac.in</p>
              </div>
            </button>

            {/* Quick Developer / Organizer Button */}
            <button
              type="button"
              onClick={() => handleQuickLogin('mohdshaddaad2005@gmail.com', 'Mohammed Shaddaad')}
              className="flex items-center gap-2 p-2 rounded-xl bg-indigo-950/30 border border-indigo-500/30 hover:border-indigo-500/60 text-left transition-colors group"
            >
              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <UserCheck className="w-3.5 h-3.5" />
              </div>
              <div className="overflow-hidden">
                <p className="text-[11px] font-bold text-indigo-200 leading-tight truncate">Mohammed</p>
                <p className="text-[9px] text-indigo-400/80 font-mono truncate">mohdshaddaad2005@...</p>
              </div>
            </button>
          </div>
        </div>

        {/* Security Info & Notice */}
        <div className="text-[11px] text-slate-400 text-center space-y-1 bg-slate-900/60 p-2.5 rounded-xl border border-white/5">
          <p className="font-semibold text-slate-300 flex items-center justify-center gap-1.5">
            <Lock className="w-3 h-3 text-indigo-400" />
            <span>Authorized Access Policy</span>
          </p>
          <p className="text-[10px] text-slate-500">
            Union Senate accounts unlock admin controls. Organizer emails must be registered in the authorized list.
          </p>
        </div>

        {/* Modal Footer */}
        <div className="pt-1 text-center">
          <p className="text-[10px] text-slate-500">
            Protected by Google OAuth 2.0 • Admin: <span className="font-mono text-cyan-300">senatemec@mec.ac.in</span>
          </p>
        </div>

      </div>
    </div>
  );
}
