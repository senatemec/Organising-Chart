import React, { useState } from 'react';
import VenueCard from './VenueCard';
import LandingHero from './LandingHero';
import { 
  Search, 
  Filter, 
  Building2, 
  SlidersHorizontal, 
  LayoutGrid, 
  List, 
  X, 
  Users, 
  MapPin, 
  Calendar,
  Sparkles,
  CheckCircle2,
  Trees,
  DoorClosed,
  Zap
} from 'lucide-react';

export default function VenueGrid({ venues, onBookClick, onViewDetails, onScheduleClick }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [minCapacity, setMinCapacity] = useState(0);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  const venueDivisions = [
    { id: 'All', label: 'All Facilities' },
    { id: 'Auditorium', label: 'Auditoriums' },
    { id: 'Activity Division', label: 'Activity Division (Casa, Elga, Ground, Amphitheatre)' },
    { id: 'Computer Lab', label: 'Computing Labs (CL1, CL2, CCF, CCC)' },
    { id: 'Classrooms', label: 'Classrooms' },
    { id: 'Seminar Hall', label: 'Seminar Halls & Media' },
  ];

  const filteredVenues = venues.filter((venue) => {
    const matchesSearch = 
      venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venue.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venue.type.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = selectedType === 'All' || venue.type === selectedType;
    const matchesCapacity = minCapacity === 0 || (!isNaN(Number(venue.capacity)) && Number(venue.capacity) >= minCapacity);

    return matchesSearch && matchesType && matchesCapacity;
  });

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedType('All');
    setMinCapacity(0);
  };

  return (
    <div className="space-y-8">
      
      {/* 1. Hero Showcase on Landing Page */}
      <LandingHero
        totalVenues={venues.length}
        onExploreClick={() => {
          const el = document.getElementById('venues-showcase');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onScheduleClick={onScheduleClick}
        onBookClick={() => onBookClick(venues[0])}
      />

      {/* 2. Venue Directory & Filter Toolbar */}
      <div id="venues-showcase" className="space-y-4 pt-2">
        
        {/* Division Filter Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {venueDivisions.map((cat) => {
            const isActive = selectedType === cat.id;
            const count = cat.id === 'All' 
              ? venues.length 
              : venues.filter(v => v.type === cat.id).length;

            if (cat.id !== 'All' && count === 0) return null;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedType(cat.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border`}
                style={isActive
                  ? { background:'#B91C1C', color:'#FFFFFF', borderColor:'#7F1D1D', boxShadow:'0 1px 4px rgba(0,0,0,0.15)' }
                  : { background:'#FFFFFF', color:'#000000', borderColor:'#E5E7EB' }
                }
              >
                <span>{cat.label}</span>
                <span className={`px-1.5 rounded-full text-[10px] font-bold`}
                  style={isActive
                    ? { background:'rgba(255,255,255,0.25)', color:'#fff' }
                    : { background:'#F3F4F6', color:'#6B7280' }
                  }
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Toolbar Header Card */}
        <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4" style={{border:'1px solid #E5E7EB'}}>
          
          {/* Section Summary */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{background:'#FEE2E2', border:'1px solid #FCA5A5'}}>
              <Building2 className="w-5 h-5" style={{color:'#DC2626'}} />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight" style={{color:'#000000'}}>
                Campus Venues &amp; Facilities
              </h2>
              <p className="text-xs" style={{color:'#555555'}}>
                Displaying <strong style={{color:'#000000'}}>{filteredVenues.length}</strong> of {venues.length} locations
              </p>
            </div>
          </div>

          {/* Right Inputs: Search, Capacity, View Toggle */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            
            {/* Search Input Box */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2" style={{color:'#9CA3AF'}} />
              <input
                type="text"
                placeholder="Search Casa, Elga, Ground, CL2, Classrooms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-9 pr-7 py-2 text-xs"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2"
                  style={{color:'#9CA3AF'}}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Capacity Dropdown */}
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs"
              style={{background:'#F9FAFB', borderColor:'#E5E7EB'}}>
              <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" style={{color:'#DC2626'}} />
              <select
                value={minCapacity}
                onChange={(e) => setMinCapacity(Number(e.target.value))}
                className="bg-transparent focus:outline-none font-medium cursor-pointer text-xs"
                style={{color:'#374151'}}
              >
                <option value={0}>Capacity: Any</option>
                <option value={75}>75+ seats</option>
                <option value={150}>150+ seats</option>
                <option value={500}>500+ seats</option>
                <option value={1000}>1000+ seats</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center p-1 rounded-xl border" style={{background:'#F3F4F6', borderColor:'#E5E7EB'}}>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors`}
                style={viewMode === 'grid'
                  ? { background:'#B91C1C', color:'#fff', boxShadow:'0 1px 3px rgba(0,0,0,0.15)' }
                  : { color:'#555555' }
                }
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors`}
                style={viewMode === 'list'
                  ? { background:'#B91C1C', color:'#fff', boxShadow:'0 1px 3px rgba(0,0,0,0.15)' }
                  : { color:'#555555' }
                }
                title="Dense List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

        {/* 3. Venue Display (Grid vs List) */}
        {filteredVenues.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVenues.map((venue) => (
                <VenueCard
                  key={venue.id}
                  venue={venue}
                  onBookClick={onBookClick}
                  onViewDetails={onViewDetails}
                />
              ))}
            </div>
          ) : (
          /* Dense Table/List View */
          <div className="glass-panel rounded-2xl border overflow-hidden shadow-md" style={{borderColor:'#E5E7EB'}}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b font-bold uppercase tracking-wider" style={{background:'#F9FAFB', borderColor:'#E5E7EB', color:'#9CA3AF'}}>
                    <th className="p-3.5">Venue &amp; Location</th>
                    <th className="p-3.5">Division</th>
                    <th className="p-3.5">Capacity</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVenues.map((venue) => (
                    <tr key={venue.id} className="border-b transition-colors hover:bg-gray-50" style={{borderColor:'#F3F4F6'}}>
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <img 
                            src={venue.image} 
                            alt={venue.name} 
                            className="w-12 h-12 rounded-xl object-cover border shrink-0" 
                            style={{borderColor:'#E5E7EB'}}
                          />
                          <div>
                            <div className="font-bold text-sm" style={{color:'#111827'}}>{venue.name}</div>
                            <div className="flex items-center gap-1 mt-0.5" style={{color:'#9CA3AF'}}>
                              <MapPin className="w-3 h-3" style={{color:'#DC2626'}} />
                              <span>{venue.location}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className="badge" style={{background:'#FEE2E2', color:'#B91C1C', border:'1px solid #FCA5A5'}}>
                          {venue.type}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold font-mono" style={{color:'#111827'}}>
                        {venue.capacity === 'NA' ? 'NA' : `${venue.capacity} seats`}
                      </td>
                      <td className="p-3.5">
                        {venue.status === 'Available' ? (
                          <span className="badge badge-available">Available</span>
                        ) : (
                          <span className="badge badge-maintenance">Maintenance</span>
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button onClick={() => onViewDetails(venue)} className="btn-secondary text-xs py-1.5 px-2.5">Details</button>
                          <button onClick={() => onBookClick(venue)} disabled={venue.status === 'Maintenance'} className="btn-primary text-xs py-1.5 px-3">Book</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          )
        ) : (
          /* Empty State */
          <div className="glass-panel p-12 text-center rounded-2xl space-y-3" style={{border:'1px solid #E5E7EB'}}>
            <Building2 className="w-12 h-12 mx-auto" style={{color:'#D1D5DB'}} />
            <h3 className="text-base font-bold" style={{color:'#111827'}}>No Matching Venues Found</h3>
            <p className="text-xs max-w-sm mx-auto" style={{color:'#6B7280'}}>
              We couldn't find any campus venues matching "<strong style={{color:'#374151'}}>{searchTerm}</strong>".
            </p>
            <button onClick={handleResetFilters} className="btn-secondary text-xs mt-2">
              Reset All Filters
            </button>
          </div>
        )}

      </div>

    </div>
  );
}
