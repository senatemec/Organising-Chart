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
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  isActive
                    ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30'
                    : 'bg-slate-900/80 text-slate-400 border-white/10 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <span>{cat.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Toolbar Header Card */}
        <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 border border-white/10">
          
          {/* Section Summary */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Campus Venues & Facilities
              </h2>
              <p className="text-xs text-slate-400">
                Displaying <strong>{filteredVenues.length}</strong> of {venues.length} locations
              </p>
            </div>
          </div>

          {/* Right Inputs: Search, Capacity, View Toggle */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            
            {/* Search Input Box */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
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
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Capacity Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-900/90 px-3 py-2 rounded-xl border border-white/10 text-xs">
              <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <select
                value={minCapacity}
                onChange={(e) => setMinCapacity(Number(e.target.value))}
                className="bg-transparent text-slate-200 focus:outline-none font-medium cursor-pointer text-xs"
              >
                <option value={0} className="bg-slate-900 text-white">Capacity: Any</option>
                <option value={75} className="bg-slate-900 text-white">75+ seats</option>
                <option value={150} className="bg-slate-900 text-white">150+ seats</option>
                <option value={500} className="bg-slate-900 text-white">500+ seats</option>
                <option value={1000} className="bg-slate-900 text-white">1000+ seats</option>
              </select>
            </div>

            {/* View Mode Toggle (Grid vs Table List) */}
            <div className="hidden sm:flex items-center bg-slate-950 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white'
                }`}
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
            /* Dense Table / List View */
            <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950 border-b border-white/10 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="p-3.5">Venue & Location</th>
                      <th className="p-3.5">Division</th>
                      <th className="p-3.5">Capacity</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredVenues.map((venue) => (
                      <tr key={venue.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <img 
                              src={venue.image} 
                              alt={venue.name} 
                              className="w-12 h-12 rounded-xl object-cover border border-white/10 shrink-0" 
                            />
                            <div>
                              <div className="font-bold text-white text-sm">{venue.name}</div>
                              <div className="text-slate-400 flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3 text-cyan-400" />
                                <span>{venue.location}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span className="badge bg-slate-900 border-white/10 text-indigo-300 font-semibold">
                            {venue.type}
                          </span>
                        </td>
                        <td className="p-3.5 font-bold text-white font-mono">
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
                            <button
                              onClick={() => onViewDetails(venue)}
                              className="btn-secondary text-xs py-1.5 px-2.5"
                            >
                              Details
                            </button>
                            <button
                              onClick={() => onBookClick(venue)}
                              disabled={venue.status === 'Maintenance'}
                              className="btn-primary text-xs py-1.5 px-3"
                            >
                              Book
                            </button>
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
          /* Empty Search State */
          <div className="glass-panel p-12 text-center rounded-2xl border border-white/10 space-y-3 bg-slate-950">
            <Building2 className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No Matching Venues Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              We couldn't find any campus venues matching "<strong className="text-slate-200">{searchTerm}</strong>".
            </p>
            <button
              onClick={handleResetFilters}
              className="btn-secondary text-xs mt-2"
            >
              Reset All Filters
            </button>
          </div>
        )}

      </div>

    </div>
  );
}
