import React, { useState, useEffect, useRef } from 'react';
import { X, ShieldCheck, Lock, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '339715089734-il7f8qb0mrpg7nlm35edqutdnu7761ov.apps.googleusercontent.com';

export default function GoogleAuthModal({ isOpen, onClose, onLoginSuccess, intendedActionMessage }) {
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
        callback: (response) => {
          if (response.credential) {
            const payload = parseJwt(response.credential);
            if (payload && payload.email) {
              const userEmail = payload.email.toLowerCase().trim();
              
              // senatemec@mec.ac.in receives Union Admin controls!
              const isSenateAdmin = userEmail === 'senatemec@mec.ac.in' || 
                                   userEmail === 'senate@mec.ac.in' || 
                                   userEmail.startsWith('senatemec@') ||
                                   userEmail.startsWith('senate@') || 
                                   userEmail === 'union@mec.ac.in';

              const account = {
                name: payload.name || userEmail.split('@')[0],
                email: userEmail,
                avatar: payload.picture || (isSenateAdmin ? '/union_mec_logo.png' : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'),
                isUnionAdmin: isSenateAdmin,
                role: isSenateAdmin ? 'Union Senate Executive' : 'MEC Student'
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
  }, [isOpen, sdkReady]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay animate-fade-in" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="glass-panel w-full max-w-md rounded-3xl border border-white/20 p-6 sm:p-8 relative bg-slate-950 shadow-2xl space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-900/90 text-slate-400 hover:text-white flex items-center justify-center transition-colors border border-white/10 z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Google Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mx-auto shadow-lg shadow-white/10 p-2.5">
            <svg viewBox="0 0 24 24" className="w-full h-full">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              Sign in with Google
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {intendedActionMessage || 'Sign in with your Google account to book a venue at MEC'}
            </p>
          </div>
        </div>

        {/* Role Permissions Notice */}
        <div className="bg-slate-900/90 border border-white/10 p-3.5 rounded-2xl space-y-1.5 text-xs text-slate-300">
          <div className="flex items-center gap-2 font-bold text-white">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Google Account Roles at MEC:</span>
          </div>
          <ul className="space-y-1 text-[11px] text-slate-400 pl-6 list-disc">
            <li>
              <strong className="text-red-300 font-mono">senatemec@mec.ac.in</strong>: Unlocks <strong>Union Admin Panel & Controls</strong>.
            </li>
            <li>
              <span className="text-slate-300">All other Google accounts</span>: Regular booking access (Admin tab stays hidden).
            </li>
          </ul>
        </div>

        {/* Real Google GIS Button Direct Rendering */}
        <div className="space-y-4 text-center py-2">
          <div className="flex justify-center min-h-[46px] items-center">
            <div ref={googleBtnRef} className="flex justify-center" />
          </div>

          {authError && (
            <div className="bg-rose-500/15 border border-rose-500/30 p-2.5 rounded-xl text-xs text-rose-300 flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{authError}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 pt-3 flex items-center justify-center gap-2 text-[11px] text-slate-500">
          <Lock className="w-3.5 h-3.5 text-slate-500" />
          <span>Official Google Identity Services (GIS) OAuth 2.0</span>
        </div>

      </div>
    </div>
  );
}
