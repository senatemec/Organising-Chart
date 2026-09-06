import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  AlertCircle, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  UserCheck, 
  RefreshCw, 
  ChevronDown, 
  KeyRound,
  Mail,
  ArrowRight
} from 'lucide-react';

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
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualEmail, setManualEmail] = useState('');
  const [manualName, setManualName] = useState('');
  const [isSwitching, setIsSwitching] = useState(false);
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

  // Centralized authentication processor with role & whitelist verification
  const processUserLogin = (userEmail, userName, userAvatar) => {
    const cleanEmail = (userEmail || '').toLowerCase().trim();
    if (!cleanEmail) {
      setAuthError('Please provide a valid Gmail address.');
      return false;
    }

    // senatemec@mec.ac.in and senate prefixes receive Union Admin controls
    const isSenateAdmin = 
      cleanEmail === 'senatemec@mec.ac.in' || 
      cleanEmail === 'senate@mec.ac.in' || 
      cleanEmail.startsWith('senatemec@') ||
      cleanEmail.startsWith('senate@') || 
      cleanEmail === 'union@mec.ac.in';

    const matchedUser = allowedUsers.find(u => (u.email || '').toLowerCase().trim() === cleanEmail);
    const isWhitelisted = Boolean(matchedUser);

    // Access Control Policy:
    if (strictAuthEnabled && !isSenateAdmin && !isWhitelisted) {
      setAuthError(
        `Access Restricted: "${cleanEmail}" is not authorized by Union MEC to book college venues. Please switch to an authorized Gmail or contact senatemec@mec.ac.in.`
      );
      return false;
    }

    const account = {
      name: userName || matchedUser?.name || (isSenateAdmin ? 'Union Senate Executive' : cleanEmail.split('@')[0]),
      email: cleanEmail,
      avatar: userAvatar || (isSenateAdmin ? '/union_mec_logo.png' : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'),
      isUnionAdmin: isSenateAdmin,
      society: matchedUser?.society || (isSenateAdmin ? 'Union Senate' : 'Authorized Organizer'),
      role: isSenateAdmin ? 'Union Senate Executive' : (matchedUser?.note || 'Authorized Organizer')
    };

    onLoginSuccess(account);
    onClose();
    return true;
  };

  // Check if Google SDK script is ready
  useEffect(() => {
    if (!isOpen) return;

    // Clear auto-select when opening modal to allow account switching
    if (window.google?.accounts?.id?.disableAutoSelect) {
      window.google.accounts.id.disableAutoSelect();
    }

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
      
      // Disable auto-select cache so user has control
      if (window.google?.accounts?.id?.disableAutoSelect) {
        window.google.accounts.id.disableAutoSelect();
      }

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => {
          if (response.credential) {
            const payload = parseJwt(response.credential);
            if (payload && payload.email) {
              processUserLogin(payload.email, payload.name, payload.picture);
            } else {
              setAuthError('Could not read Google account details. Please try switching accounts.');
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
        width: 300
      });
    } catch (err) {
      console.error('Google Auth Init Error:', err);
    }
  }, [isOpen, sdkReady, allowedUsers, strictAuthEnabled]);

  // Explicit Google Account Switcher / Chooser Popup using Google OAuth2
  const handleSwitchGoogleAccount = () => {
    setAuthError(null);
    setIsSwitching(true);

    if (window.google?.accounts?.id?.disableAutoSelect) {
      window.google.accounts.id.disableAutoSelect();
    }

    if (window.google?.accounts?.oauth2) {
      try {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'email profile openid',
          prompt: 'select_account',
          callback: async (tokenResponse) => {
            setIsSwitching(false);
            if (tokenResponse && tokenResponse.access_token) {
              try {
                const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                });
                if (res.ok) {
                  const profile = await res.json();
                  processUserLogin(profile.email, profile.name, profile.picture);
                } else {
                  setAuthError('Failed to fetch profile from Google. Please try again.');
                }
              } catch (err) {
                console.error('Error fetching Google user profile:', err);
                setAuthError('Network error while verifying Google account.');
              }
            } else if (tokenResponse?.error) {
              setAuthError(`Sign-in was not completed (${tokenResponse.error}).`);
            }
          }
        });
        tokenClient.requestAccessToken({ prompt: 'select_account' });
      } catch (e) {
        console.error('OAuth2 init error:', e);
        setIsSwitching(false);
        setAuthError('Could not launch account chooser popup. Please use the direct login options below.');
      }
    } else {
      setIsSwitching(false);
      setAuthError('Google Identity Services is loading. Please try again in a moment.');
    }
  };

  // Direct Senate Admin One-Click Login
  const handleSenateAdminQuickLogin = () => {
    processUserLogin('senatemec@mec.ac.in', 'Union Senate Executive', '/union_mec_logo.png');
  };

  // Manual Email Submission
  const handleManualEmailSubmit = (e) => {
    e.preventDefault();
    if (!manualEmail.trim()) {
      setAuthError('Please enter your authorized email address.');
      return;
    }
    processUserLogin(manualEmail.trim(), manualName.trim(), null);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay animate-fade-in" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="glass-panel w-full max-w-md rounded-3xl border border-white/20 p-6 sm:p-7 relative bg-slate-950 shadow-2xl space-y-5">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-900 text-slate-400 hover:text-white flex items-center justify-center transition-colors border border-white/10 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2.5">
          <div className="flex items-center justify-center gap-2">
            <img src="/mec_college_logo.png" alt="MEC Logo" className="w-10 h-10 object-contain rounded-xl bg-white p-1 shadow-md" />
            <img src="/union_mec_logo.png" alt="Union MEC" className="w-10 h-10 object-contain rounded-xl bg-white p-1 shadow-md" />
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">Sign In to Venue Portal</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Govt. Model Engineering College
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

        {/* Error Notification Banner */}
        {authError && (
          <div className="bg-rose-500/15 border border-rose-500/40 p-3.5 rounded-xl flex items-start gap-2.5 text-xs text-rose-300 animate-fade-in">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="leading-relaxed font-medium">{authError}</span>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleSwitchGoogleAccount}
                  className="text-white bg-rose-600/60 hover:bg-rose-600 px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Switch to Another Google Account</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Google Sign-In Actions */}
        <div className="space-y-3">
          
          {/* Primary: Google One-Tap / Standard Button */}
          <div className="flex flex-col items-center justify-center p-3 bg-slate-900/50 rounded-2xl border border-white/10 gap-2.5">
            <div ref={googleBtnRef} className="flex justify-center" />
            
            {/* Switch Account Button */}
            <button
              type="button"
              onClick={handleSwitchGoogleAccount}
              disabled={isSwitching}
              className="w-full flex items-center justify-center gap-2 text-xs text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 py-2 px-3 rounded-xl font-medium transition-all cursor-pointer shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${isSwitching ? 'animate-spin' : ''}`} />
              <span>{isSwitching ? 'Opening Account Chooser...' : 'Switch / Choose Different Google Account'}</span>
            </button>
          </div>

          {/* Quick Senate Admin One-Click Bypass */}
          <button
            type="button"
            onClick={handleSenateAdminQuickLogin}
            className="w-full bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white p-3 rounded-2xl font-bold text-xs flex items-center justify-between shadow-lg shadow-red-600/20 border border-red-400/30 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <div className="leading-tight">Sign In as Union Admin</div>
                <div className="text-[10px] text-red-200 font-mono font-normal">senatemec@mec.ac.in</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-white/80 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Authorized Society Account Switcher / Direct Form */}
          <div className="border border-white/10 rounded-2xl bg-slate-900/40 p-3 space-y-2">
            <button
              type="button"
              onClick={() => setShowManualInput(!showManualInput)}
              className="w-full flex items-center justify-between text-xs text-slate-300 hover:text-white font-medium cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Authorized Society Login / Manual Email</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showManualInput ? 'rotate-180' : ''}`} />
            </button>

            {showManualInput && (
              <form onSubmit={handleManualEmailSubmit} className="pt-2 border-t border-white/5 space-y-2.5 animate-fade-in">
                {/* Whitelist Quick Selection Dropdown */}
                {allowedUsers && allowedUsers.length > 0 && (
                  <div>
                    <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                      Quick Pick Approved Account:
                    </label>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          setManualEmail(e.target.value);
                          const matched = allowedUsers.find(u => u.email.toLowerCase() === e.target.value.toLowerCase());
                          if (matched) setManualName(matched.name || '');
                        }
                      }}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="">-- Choose Whitelisted Society --</option>
                      {allowedUsers.map((u, idx) => (
                        <option key={idx} value={u.email}>
                          {u.society || u.name} ({u.email})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                    Gmail Address:
                  </label>
                  <input
                    type="email"
                    value={manualEmail}
                    onChange={(e) => setManualEmail(e.target.value)}
                    placeholder="e.g. society@mec.ac.in or organizer@gmail.com"
                    required
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                    Organizer Name (Optional):
                  </label>
                  <input
                    type="text"
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    placeholder="e.g. EMF Coordinator"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-indigo-600/30"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Authenticate Authorized Account</span>
                </button>
              </form>
            )}
          </div>

          {/* Access Policy Info */}
          <div className="text-[11px] text-slate-400 text-center space-y-1 bg-slate-900/60 p-2.5 rounded-xl border border-white/5">
            <p className="font-semibold text-slate-300 flex items-center justify-center gap-1.5">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>{strictAuthEnabled ? 'Strict Access Whitelist Active' : 'Open Access Mode'}</span>
            </p>
            <p className="text-slate-500 text-[10px]">
              {strictAuthEnabled 
                ? 'Only verified student bodies approved by Union MEC can book venues.'
                : 'All accounts can book venues in open access mode.'}
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
