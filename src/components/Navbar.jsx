import React from 'react';
import { 
  Building2, 
  CalendarDays, 
  Ticket, 
  ShieldCheck, 
  Plus,
  LogOut,
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
  const baseNavItems = [
    { id: 'venues', label: 'Venues', icon: Building2 },
    { id: 'availability', label: 'Live Schedule Matrix', icon: CalendarDays },
    { id: 'my-bookings', label: 'My Bookings', icon: Ticket },
  ];

  const navItems = currentUser?.isUnionAdmin
    ? [
        ...baseNavItems,
        { id: 'admin', label: 'Union Admin', icon: ShieldCheck, isSpecialAdmin: true },
        { id: 'access-control', label: 'Authorized Gmails', icon: UserCheck, isSpecialAdmin: true },
      ]
    : baseNavItems;

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md border-b px-4 lg:px-8 py-2.5 mb-6 shadow-sm"
      style={{
        background: 'rgba(255,255,255,0.97)',
        borderColor: '#E5E7EB',
        boxShadow: '0 1px 12px rgba(0,0,0,0.07)'
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Left: Brand Identity */}
        <div 
          onClick={() => setActiveTab('venues')} 
          className="flex items-center gap-3 cursor-pointer group select-none shrink-0"
        >
          {/* Official Logos */}
          <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl border border-gray-200 group-hover:border-red-200 transition-colors">
            <img 
              src="/mec_college_logo.png" 
              alt="Govt. Model Engineering College" 
              className="w-8 h-8 object-contain rounded-lg bg-white p-0.5" 
            />
            <img 
              src="/union_mec_logo.png" 
              alt="Union MEC" 
              className="w-8 h-8 object-contain rounded-lg bg-white p-0.5" 
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight transition-colors"
                style={{color:'#000000'}}
              >
                Organizing Chart
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border tracking-wider"
                style={{color:'#7F1D1D', background:'#FEE2E2', borderColor:'#FCA5A5'}}
              >
                UNION MEC
              </span>
            </div>
            <p className="text-[10px] font-medium hidden sm:block" style={{color:'#555555'}}>
              Govt. Model Engineering College
            </p>
          </div>
        </div>

        {/* Center: Segmented Navigation */}
        <nav className="hidden md:flex items-center bg-gray-50 p-1 rounded-xl border border-gray-200 shadow-inner">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-semibold text-xs transition-all`}
                style={isActive
                  ? {
                      background: '#B91C1C',
                      color: '#FFFFFF',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.18)'
                    }
                  : {
                      color: item.isSpecialAdmin ? '#7F1D1D' : '#000000',
                      background: 'transparent'
                    }
                }
              >
                <Icon className="w-3.5 h-3.5" style={{color: isActive ? '#fff' : item.isSpecialAdmin ? '#EF4444' : '#9CA3AF'}} />
                <span>{item.label}</span>
                {item.isSpecialAdmin && (
                  <span className="text-[9px] px-1.5 rounded font-bold border"
                    style={isActive
                      ? {background:'rgba(255,255,255,0.2)', color:'#fff', borderColor:'rgba(255,255,255,0.3)'}
                      : {background:'#FEE2E2', color:'#7F1D1D', borderColor:'#FCA5A5'}
                    }
                  >
                    ADMIN
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Auth + CTA */}
        <div className="flex items-center gap-3 shrink-0">
          
          {currentUser ? (
            <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-200 p-1 pr-2.5 rounded-2xl shadow-xs">
              <div 
                className={`w-7 h-7 rounded-xl overflow-hidden shrink-0 flex items-center justify-center border ${
                  currentUser.isUnionAdmin ? 'bg-white p-0.5' : 'bg-white'
                }`}
                style={{borderColor: currentUser.isUnionAdmin ? '#FCA5A5' : '#E5E7EB'}}
              >
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.name} 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="hidden sm:block text-left text-xs">
                <div className="font-bold leading-tight flex items-center gap-1.5" style={{color:'#000000'}}>
                  <span className="truncate max-w-[110px]">{currentUser.name}</span>
                  {currentUser.isUnionAdmin && (
                    <span className="text-[9px] px-1.5 rounded font-bold border"
                      style={{background:'#FEE2E2', color:'#7F1D1D', borderColor:'#FCA5A5'}}
                    >
                      UNION
                    </span>
                  )}
                </div>
                <div className="text-[10px] truncate max-w-[110px] font-mono" style={{color:'#555555'}}>
                  {currentUser.email}
                </div>
              </div>
              <button
                onClick={onLogout}
                className="p-1 rounded-lg transition-colors ml-1"
                style={{color:'#9CA3AF'}}
                onMouseEnter={e => e.currentTarget.style.color='#DC2626'}
                onMouseLeave={e => e.currentTarget.style.color='#9CA3AF'}
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onOpenLoginModal('Sign in with your Google account to access bookings and Union admin portal')}
              className="btn-secondary text-xs py-1.5 px-3 font-bold"
              style={{ color: '#000000', backgroundColor: '#FFFFFF', borderColor: '#D1D5DB' }}
            >
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <span style={{ color: '#000000', fontWeight: 'bold' }}>Sign In</span>
            </button>
          )}

          {/* Book Venue CTA */}
          <button
            onClick={onNewBookingClick}
            className="btn-primary text-xs py-2 px-4 whitespace-nowrap flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 shrink-0" /> 
            <span>Book Venue</span>
          </button>
        </div>

      </div>

      {/* Mobile Sub-Navigation */}
      <div className="md:hidden flex items-center justify-between pt-2.5 mt-2.5 border-t border-gray-100 overflow-x-auto gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all`}
              style={isActive
                ? { background: '#B91C1C', color: '#FFFFFF', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }
                : { color: item.isSpecialAdmin ? '#7F1D1D' : '#000000', background: 'transparent' }
              }
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
