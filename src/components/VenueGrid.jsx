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
    const matchesCapacity = venue.capacity >= minCapacity;

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
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span>{cat.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Toolbar Header Card */}
        <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 border border-slate-200 bg-white shadow-xs">
          
          {/* Section Summary */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Campus Venues & Facilities
              </h2>
              <p className="text-xs text-slate-500">
                Displaying <strong className="text-slate-700">{filteredVenues.length}</strong> of {venues.length} locations
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
                className="input-field pl-9 pr-7 py-2 text-xs bg-white border-slate-300"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Capacity Dropdown */}
            <div className="flex items-center gap-1.5 bg-white px-3 py-2 rounded-xl border border-slate-300 text-xs shadow-xs">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <select
                value={minCapacity}
                onChange={(e) => setMinCapacity(Number(e.target.value))}
                className="bg-transparent text-slate-800 focus:outline-none font-medium cursor-pointer text-xs"
              >
                <option value={0}>Capacity: Any</option>
                <option value={75}>75+ seats</option>
                <option value={150}>150+ seats</option>
                <option value={500}>500+ seats</option>
                <option value={1000}>1000+ seats</option>
              </select>
            </div>

            {/* View Mode Toggle (Grid vs Table List) */}
            <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-white text-slate-900 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-white text-slate-900 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-900'
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
            <div className="glass-panel rounded-2xl border border-slate-200 overflow-hidden shadow-xs bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                      <th className="p-3.5">Venue & Location</th>
                      <th className="p-3.5">Division</th>
                      <th className="p-3.5">Capacity</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredVenues.map((venue) => (
                      <tr key={venue.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <img 
                              src={venue.image} 
                              alt={venue.name} 
                              className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0" 
                            />
                            <div>
                              <div className="font-bold text-slate-900 text-sm">{venue.name}</div>
                              <div className="text-slate-500 flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3 text-blue-600" />
                                <span>{venue.location}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span className="badge bg-slate-100 border-slate-200 text-slate-700 font-semibold">
                            {venue.type}
                          </span>
                        </td>
                        <td className="p-3.5 font-bold text-slate-900 font-mono">
                          {venue.capacity} seats
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
                              className="btn-secondary text-xs py-1.5 px-2.5 bg-white border-slate-300"
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
          <div className="glass-panel p-12 text-center rounded-2xl border border-slate-200 space-y-3 bg-white">
            <Building2 className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">No Matching Venues Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              We couldn't find any campus venues matching "<strong className="text-slate-700">{searchTerm}</strong>".
            </p>
            <button
              onClick={handleResetFilters}
              className="btn-secondary text-xs mt-2 border-slate-300"
            >
              Reset All Filters
            </button>
          </div>
        )}

      </div>

    </div>
  );
}
