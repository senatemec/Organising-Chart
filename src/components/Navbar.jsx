import React from 'react';
import { 
  Building2, 
  CalendarDays, 
  Ticket, 
  ShieldCheck, 
  BarChart3, 
  Plus,
  Sparkles,
  LogIn,
  LogOut,
  User,
  UserCheck
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  currentUser,
  onOpenLoginModal,
  onLogout,
  onNewBookingClick 
}) {
  // Base navigation items available to regular users and guests
  const baseNavItems = [
    { id: 'venues', label: 'Venues', icon: Building2 },
    { id: 'availability', label: 'Live Schedule Matrix', icon: CalendarDays },
    { id: 'my-bookings', label: 'My Bookings', icon: Ticket },
  ];

  // Admin and Analytics tabs are strictly and exclusively rendered if logged in as Union Admin
  const navItems = currentUser?.isUnionAdmin
    ? [
        ...baseNavItems,
        { id: 'admin', label: 'Union Admin', icon: ShieldCheck, isSpecialAdmin: true },
        { id: 'access-control', label: 'Authorized Gmails', icon: UserCheck, isSpecialAdmin: true },
        { id: 'analytics', label: 'Analytics', icon: BarChart3, isSpecialAdmin: true },
      ]
    : baseNavItems;

  return (
    <header className="sticky top-0 z-50 bg-[#0B101D]/90 backdrop-blur-md border-b border-white/10 px-4 lg:px-8 py-2.5 mb-6 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Left: Brand Identity with MEC & Union MEC Logos */}
        <div 
          onClick={() => setActiveTab('venues')} 
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          {/* Official Logos Group */}
          <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10 group-hover:border-indigo-500/40 transition-colors">
            <img 
              src="/mec_college_logo.png" 
              alt="Govt. Model Engineering College" 
              className="w-8 h-8 object-contain rounded-lg bg-white/95 p-0.5" 
            />
            <img 
              src="/union_mec_logo.png" 
              alt="Union MEC" 
              className="w-8 h-8 object-contain rounded-lg bg-white/95 p-0.5" 
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base text-white tracking-tight group-hover:text-indigo-300 transition-colors">
                Organizing Chart
              </span>
              <span className="text-[10px] font-bold text-red-300 bg-red-500/20 px-2 py-0.5 rounded-full border border-red-500/40 tracking-wider">
                UNION MEC
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
              Govt. Model Engineering College
            </p>
          </div>
        </div>

        {/* Center: Segmented Navigation */}
        <nav className="hidden md:flex items-center bg-slate-950/80 p-1 rounded-xl border border-white/10 shadow-inner">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-semibold text-xs transition-all ${
                  isActive
                    ? item.isSpecialAdmin
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                      : 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : item.isSpecialAdmin
                    ? 'text-red-300 hover:text-white hover:bg-red-500/10'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.04]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : item.isSpecialAdmin ? 'text-red-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.isSpecialAdmin && (
                  <span className="text-[9px] bg-red-500/30 text-red-200 px-1.5 py-0.2 rounded font-bold border border-red-500/40">
                    ADMIN
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Auth Profile / Google Sign In & Book CTA */}
        <div className="flex items-center gap-3">
          
          {/* User Account / Google Sign In Status */}
          {currentUser ? (
            <div className="flex items-center gap-2.5 bg-slate-950/90 border border-white/10 p-1 pr-2.5 rounded-2xl shadow-sm">
              <div 
                className={`w-7 h-7 rounded-xl overflow-hidden shrink-0 flex items-center justify-center border ${
                  currentUser.isUnionAdmin ? 'border-red-500/50 bg-white p-0.5' : 'border-indigo-500/40 bg-slate-900'
                }`}
                style={{ width: '28px', height: '28px', minWidth: '28px', maxWidth: '28px' }}
              >
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.name} 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="hidden sm:block text-left text-xs">
                <div className="font-bold text-white leading-tight flex items-center gap-1.5">
                  <span className="truncate max-w-[110px]">{currentUser.name}</span>
                  {currentUser.isUnionAdmin && (
                    <span className="text-[9px] bg-red-500/20 text-red-300 px-1.5 py-0.2 rounded font-bold border border-red-500/40">
                      UNION
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-400 truncate max-w-[110px] font-mono">
                  {currentUser.email}
                </div>
              </div>
              <button
                onClick={onLogout}
                className="p-1 text-slate-400 hover:text-rose-400 hover:bg-white/5 rounded-lg transition-colors ml-1"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onOpenLoginModal('Sign in with your Google account to access bookings and Union admin portal')}
              className="btn-secondary text-xs py-1.5 px-3 bg-slate-900 border-white/10 hover:border-white/30"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <span>Sign In</span>
            </button>
          )}

          {/* Book CTA */}
          <button
            onClick={onNewBookingClick}
            className="btn-primary text-xs py-2 px-4 shadow-indigo-500/30"
          >
            <Plus className="w-3.5 h-3.5" /> 
            <span className="hidden sm:inline">Book Venue</span>
            <span className="sm:hidden">Book</span>
          </button>
        </div>

      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden flex items-center justify-between pt-2.5 mt-2.5 border-t border-white/10 overflow-x-auto gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap ${
                isActive 
                  ? item.isSpecialAdmin
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'bg-indigo-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
