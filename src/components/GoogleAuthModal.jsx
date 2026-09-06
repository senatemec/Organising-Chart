import React, { useState, useEffect, useRef } from 'react';
import { X, ShieldCheck, Lock, AlertCircle, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';

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
      <div className="glass-panel w-full max-w-md rounded-3xl border border-white/20 p-6 sm:p-8 relative bg-slate-950 shadow-2xl space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-900 text-slate-400 hover:text-white flex items-center justify-center transition-colors border border-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <img src="/mec_college_logo.png" alt="MEC Logo" className="w-10 h-10 object-contain rounded-xl bg-white p-1 shadow-md" />
            <img src="/union_mec_logo.png" alt="Union MEC" className="w-10 h-10 object-contain rounded-xl bg-white p-1 shadow-md" />
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">Sign In with Google</h2>
            <p className="text-xs text-slate-400 mt-1">
              Govt. Model Engineering College Venue Portal
            </p>
          </div>
        </div>

        {/* Action Prompt message */}
        {intendedActionMessage && (
          <div className="bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-xl flex items-center gap-2 text-xs text-indigo-300">
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>{intendedActionMessage}</span>
          </div>
        )}

        {/* Error Notification */}
        {authError && (
          <div className="bg-rose-500/15 border border-rose-500/40 p-3.5 rounded-xl flex items-start gap-2.5 text-xs text-rose-300 animate-fade-in">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{authError}</span>
          </div>
        )}

        {/* Official Google GIS Button Container */}
        <div className="space-y-4">
          <div className="flex flex-col items-center justify-center min-h-[50px]">
            <div ref={googleBtnRef} className="flex justify-center" />
          </div>

          <div className="text-[11px] text-slate-400 text-center space-y-1 bg-slate-900/60 p-3 rounded-xl border border-white/5">
            <p className="font-semibold text-slate-300">🔒 Authorized Access Control</p>
            <p className="text-slate-500">
              Only authorized Gmail accounts approved by <strong className="text-red-400">Union MEC</strong> can book campus venues.
            </p>
          </div>
        </div>

        {/* Security Footer */}
        <div className="pt-2 border-t border-white/10 text-center">
          <p className="text-[10px] text-slate-500">
            Protected by Google OAuth 2.0 • Admin: <span className="font-mono text-cyan-300">senatemec@mec.ac.in</span>
          </p>
        </div>

      </div>
    </div>
  );
}
