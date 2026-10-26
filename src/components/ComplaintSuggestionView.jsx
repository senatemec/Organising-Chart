import React, { useState } from 'react';
import { 
  MessageSquarePlus, 
  AlertCircle, 
  Lightbulb, 
  CheckCircle2, 
  Clock, 
  Send, 
  Search, 
  Filter, 
  ShieldCheck, 
  User, 
  Phone, 
  GraduationCap, 
  Globe, 
  Lock, 
  MessageSquare, 
  Edit3, 
  Trash2, 
  Eye, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  X,
  Share2
} from 'lucide-react';
import { mecClasses, mecYears } from '../data/mockData';

const STATUS_CONFIG = {
  'Pending': { label: 'Pending Review', color: '#D97706', bg: '#FEF3C7', border: '#FDE68A' },
  'Under Review': { label: 'Under Review', color: '#2563EB', bg: '#DBEAFE', border: '#BFDBFE' },
  'In Progress': { label: 'In Progress', color: '#7C3AED', bg: '#EDE9FE', border: '#DDD6FE' },
  'Resolved': { label: 'Resolved', color: '#059669', bg: '#D1FAE5', border: '#A7F3D0' }
};

export default function ComplaintSuggestionView({
  complaints = [],
  currentUser,
  onAddComplaint,
  onUpdateComment,
  onUpdateStatus,
  onDeleteComplaint,
  onOpenLoginModal
}) {
  const [subTab, setSubTab] = useState('submit'); // 'submit' | 'public' | 'admin' | 'my'
  
  // Form State
  const [formType, setFormType] = useState('complaint'); // 'complaint' | 'suggestion'
  const [formName, setFormName] = useState('');
  const [formClass, setFormClass] = useState('CSA');
  const [formYear, setFormYear] = useState('1');
  const [formContactNumber, setFormContactNumber] = useState('');
  const [formSubject, setFormSubject] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formIsPublic, setFormIsPublic] = useState(true);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccessItem, setSubmittedSuccessItem] = useState(null);

  // Public Board Filters
  const [publicTypeFilter, setPublicTypeFilter] = useState('All'); // 'All' | 'complaint' | 'suggestion'
  const [publicStatusFilter, setPublicStatusFilter] = useState('All');
  const [publicSearchTerm, setPublicSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  // Admin Desk Filters & Action State
  const [adminTypeFilter, setAdminTypeFilter] = useState('All');
  const [adminStatusFilter, setAdminStatusFilter] = useState('All');
  const [adminVisibilityFilter, setAdminVisibilityFilter] = useState('All');
  const [adminSearchTerm, setAdminSearchTerm] = useState('');
  
  // Comment Modal State (Admin)
  const [commentingItem, setCommentingItem] = useState(null);
  const [adminCommentText, setAdminCommentText] = useState('');
  const [adminStatusSelection, setAdminStatusSelection] = useState('Under Review');
  const [isSavingComment, setIsSavingComment] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const isAdmin = Boolean(currentUser?.isUnionAdmin);

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Strict validation of mandatory fields
    if (!formName.trim()) {
      setFormError('Name is mandatory. Please provide your name.');
      return;
    }
    if (!formClass) {
      setFormError('Class selection is mandatory.');
      return;
    }
    if (!formYear) {
      setFormError('Year selection is mandatory.');
      return;
    }
    if (!formSubject.trim()) {
      setFormError('Subject / Title is mandatory.');
      return;
    }
    if (!formDescription.trim()) {
      setFormError('Description is mandatory. Please explain the issue or suggestion.');
      return;
    }

    setIsSubmitting(true);

    try {
      const newEntry = {
        id: `CMP-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`,
        type: formType,
        name: formName.trim(),
        studentClass: formClass,
        year: String(formYear),
        contactNumber: formContactNumber.trim(),
        subject: formSubject.trim(),
        description: formDescription.trim(),
        isPublic: Boolean(formIsPublic),
        status: 'Pending',
        createdAt: new Date().toISOString(),
        adminComment: '',
        adminCommentedBy: '',
        adminCommentedAt: ''
      };

      await onAddComplaint(newEntry);

      // Save locally to user recent submissions list
      try {
        const existingRecent = JSON.parse(localStorage.getItem('cs_my_complaints_v1') || '[]');
        localStorage.setItem('cs_my_complaints_v1', JSON.stringify([newEntry.id, ...existingRecent]));
      } catch (err) {}

      // Reset form
      setSubmittedSuccessItem(newEntry);
      setFormSubject('');
      setFormDescription('');
      setFormContactNumber('');
    } catch (err) {
      setFormError(err.message || 'Failed to submit complaint/suggestion.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Admin Comment Modal
  const handleOpenCommentModal = (item) => {
    setCommentingItem(item);
    setAdminCommentText(item.adminComment || '');
    setAdminStatusSelection(item.status || 'Under Review');
  };

  // Save Admin Comment & Status
  const handleSaveAdminComment = async () => {
    if (!commentingItem) return;
    setIsSavingComment(true);

    try {
      const responder = currentUser?.name || currentUser?.society || 'Union Senate Chairman';
      await onUpdateComment(commentingItem.id, {
        adminComment: adminCommentText.trim(),
        adminCommentedBy: responder,
        adminCommentedAt: new Date().toISOString(),
        status: adminStatusSelection
      });

      setCommentingItem(null);
    } catch (err) {
      alert('Failed to save official comment: ' + err.message);
    } finally {
      setIsSavingComment(false);
    }
  };

  // Filter Public Board Items
  const publicItems = complaints.filter((item) => {
    if (!item.isPublic) return false;

    const matchesType = publicTypeFilter === 'All' || item.type === publicTypeFilter;
    const matchesStatus = publicStatusFilter === 'All' || item.status === publicStatusFilter;
    const matchesSearch = 
      (item.subject || '').toLowerCase().includes(publicSearchTerm.toLowerCase()) ||
      (item.description || '').toLowerCase().includes(publicSearchTerm.toLowerCase()) ||
      (item.name || '').toLowerCase().includes(publicSearchTerm.toLowerCase()) ||
      (item.studentClass || '').toLowerCase().includes(publicSearchTerm.toLowerCase());

    return matchesType && matchesStatus && matchesSearch;
  });

  // Filter Admin Items
  const adminItems = complaints.filter((item) => {
    const matchesType = adminTypeFilter === 'All' || item.type === adminTypeFilter;
    const matchesStatus = adminStatusFilter === 'All' || item.status === adminStatusFilter;
    const matchesVisibility = 
      adminVisibilityFilter === 'All' || 
      (adminVisibilityFilter === 'Public' && item.isPublic) ||
      (adminVisibilityFilter === 'Private' && !item.isPublic);

    const matchesSearch = 
      (item.subject || '').toLowerCase().includes(adminSearchTerm.toLowerCase()) ||
      (item.description || '').toLowerCase().includes(adminSearchTerm.toLowerCase()) ||
      (item.name || '').toLowerCase().includes(adminSearchTerm.toLowerCase()) ||
      (item.studentClass || '').toLowerCase().includes(adminSearchTerm.toLowerCase()) ||
      (item.contactNumber || '').toLowerCase().includes(adminSearchTerm.toLowerCase());

    return matchesType && matchesStatus && matchesVisibility && matchesSearch;
  });

  // Count stats
  const totalCount = complaints.length;
  const complaintCount = complaints.filter(c => c.type === 'complaint').length;
  const suggestionCount = complaints.filter(c => c.type === 'suggestion').length;
  const publicCount = complaints.filter(c => c.isPublic).length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;
  const pendingCount = complaints.filter(c => c.status === 'Pending').length;

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* 1. Header Banner */}
      <div className="hero-gradient-border p-5 sm:p-7 md:p-8 relative overflow-hidden rounded-2xl sm:rounded-3xl">
        <div 
          className="hero-glow-blob"
          style={{ background: 'rgba(239,68,68,0.08)', top: '-50px', right: '-50px' }}
        />

        <div className="relative z-10 max-w-4xl space-y-3 sm:space-y-4">
          <div className="inline-flex items-center gap-2 bg-white border border-gray-200 px-3 py-1 rounded-full text-xs shadow-xs">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            <span className="font-semibold text-gray-900">Student Grievances &amp; Suggestions Cell</span>
            <span className="text-gray-300">•</span>
            <span className="font-bold text-red-700">Union MEC</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight" style={{ color: '#000000' }}>
            Complaint &amp; Suggestion Portal
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 max-w-2xl leading-relaxed">
            Report facility issues or share campus suggestions directly with the College Student Union. Choose to publish your issue to the Public Board to view official Union Admin comments and tracking.
          </p>

          {/* Sub Navigation Bar */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-200/60">
            <button
              onClick={() => { setSubTab('submit'); setSubmittedSuccessItem(null); }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border"
              style={subTab === 'submit'
                ? { backgroundColor: '#B91C1C', color: '#FFFFFF', borderColor: '#B91C1C', boxShadow: '0 2px 6px rgba(185,28,28,0.25)' }
                : { backgroundColor: '#FFFFFF', color: '#374151', borderColor: '#E5E7EB' }
              }
            >
              <MessageSquarePlus className="w-3.5 h-3.5" />
              <span>Submit New</span>
            </button>

            <button
              onClick={() => setSubTab('public')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border"
              style={subTab === 'public'
                ? { backgroundColor: '#B91C1C', color: '#FFFFFF', borderColor: '#B91C1C', boxShadow: '0 2px 6px rgba(185,28,28,0.25)' }
                : { backgroundColor: '#FFFFFF', color: '#374151', borderColor: '#E5E7EB' }
              }
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Public Complaint Board</span>
              <span 
                className="text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-0.5"
                style={subTab === 'public'
                  ? { backgroundColor: 'rgba(255,255,255,0.25)', color: '#FFFFFF' }
                  : { backgroundColor: '#FEE2E2', color: '#991B1B' }
                }
              >
                {publicCount}
              </span>
            </button>

            {isAdmin && (
              <button
                onClick={() => setSubTab('admin')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border"
                style={subTab === 'admin'
                  ? { backgroundColor: '#B91C1C', color: '#FFFFFF', borderColor: '#B91C1C', boxShadow: '0 2px 6px rgba(185,28,28,0.25)' }
                  : { backgroundColor: '#FFF5F5', color: '#991B1B', borderColor: '#FCA5A5' }
                }
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Review Desk</span>
                <span 
                  className="text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-0.5"
                  style={subTab === 'admin'
                    ? { backgroundColor: 'rgba(255,255,255,0.25)', color: '#FFFFFF' }
                    : { backgroundColor: '#FEE2E2', color: '#991B1B' }
                  }
                >
                  {complaints.length}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. SUB-TAB 1: SUBMISSION FORM */}
      {subTab === 'submit' && (
        <div className="max-w-2xl mx-auto space-y-6">
          
          {submittedSuccessItem ? (
            <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-emerald-200 bg-white text-center space-y-4 shadow-sm animate-scaleIn">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              
              <div className="space-y-1">
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  Submission Successfully Recorded
                </span>
                <h2 className="text-xl font-extrabold text-gray-900">
                  Thank You, {submittedSuccessItem.name}!
                </h2>
                <p className="text-xs text-gray-600 max-w-md mx-auto leading-relaxed">
                  Your {submittedSuccessItem.type === 'complaint' ? 'complaint' : 'suggestion'} has been logged into the Union MEC portal under Reference ID <strong className="font-mono text-gray-900">{submittedSuccessItem.id}</strong>.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 text-left text-xs space-y-2 max-w-md mx-auto">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subject:</span>
                  <span className="font-bold text-gray-900">{submittedSuccessItem.subject}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Class &amp; Year:</span>
                  <span className="font-semibold text-gray-900">{submittedSuccessItem.studentClass} • Year {submittedSuccessItem.year}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Board Visibility:</span>
                  <span className="font-bold text-emerald-700">
                    {submittedSuccessItem.isPublic ? 'Publicly visible for admin comment' : 'Direct to Union Admin (Private)'}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                {submittedSuccessItem.isPublic && (
                  <button
                    onClick={() => setSubTab('public')}
                    className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>View on Public Board</span>
                  </button>
                )}
                <button
                  onClick={() => setSubmittedSuccessItem(null)}
                  className="btn-secondary text-xs py-2 px-4"
                >
                  Submit Another
                </button>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-5 sm:p-7 rounded-2xl border border-gray-200 bg-white shadow-sm space-y-5">
              
              <div className="border-b border-gray-100 pb-3">
                <h2 className="text-lg font-bold text-gray-900">
                  File a Grievance or Suggestion
                </h2>
                <p className="text-xs text-gray-500">
                  All fields marked with an asterisk (<span className="text-red-600 font-bold">*</span>) are mandatory.
                </p>
              </div>

              {formError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* 1. Category Selector: Complaint vs Suggestion */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-800">
                    Select Category <span className="text-red-600">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormType('complaint')}
                      className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${
                        formType === 'complaint'
                          ? 'border-red-600 bg-red-50/80 ring-2 ring-red-500/20 shadow-xs'
                          : 'border-gray-200 bg-gray-50/50 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`p-2 rounded-lg shrink-0 ${
                        formType === 'complaint' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        <AlertCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-gray-900">Complaint</div>
                        <div className="text-[11px] text-gray-500 leading-tight">
                          Report facility breakdown, maintenance, venue issues
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormType('suggestion')}
                      className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${
                        formType === 'suggestion'
                          ? 'border-indigo-600 bg-indigo-50/80 ring-2 ring-indigo-500/20 shadow-xs'
                          : 'border-gray-200 bg-gray-50/50 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`p-2 rounded-lg shrink-0 ${
                        formType === 'suggestion' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        <Lightbulb className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-gray-900">Suggestion</div>
                        <div className="text-[11px] text-gray-500 leading-tight">
                          Propose a campus improvement or new initiative
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* 2. Student Name (Mandatory) */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-800">
                    Your Full Name <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      required
                      placeholder="Your Full Name"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-white"
                    />
                  </div>
                </div>

                {/* 3. Class & Year (Mandatory Dropdowns) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-800">
                      Class / Branch <span className="text-red-600">*</span>
                    </label>
                    <select
                      required
                      value={formClass}
                      onChange={(e) => setFormClass(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-red-500 bg-white font-medium"
                    >
                      {mecClasses.map((cls) => (
                        <option key={cls} value={cls}>
                          {cls}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-800">
                      Year of Study <span className="text-red-600">*</span>
                    </label>
                    <select
                      required
                      value={formYear}
                      onChange={(e) => setFormYear(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-red-500 bg-white font-medium"
                    >
                      {mecYears.map((yr) => (
                        <option key={yr} value={yr}>
                          Year {yr}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 4. Contact Number (Optional - "if status needed") */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-800">
                    Contact Number <span className="text-gray-400 font-normal">(Optional - if status updates needed)</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      placeholder="e.g. +91 98470 12345"
                      value={formContactNumber}
                      onChange={(e) => setFormContactNumber(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-white"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400">
                    Provide your phone or WhatsApp number if you would like the Union Senate to contact you directly with status updates.
                  </p>
                </div>

                {/* 5. Subject (Mandatory) */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-800">
                    Subject / Title <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Brief summary of the issue or idea..."
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-white"
                  />
                </div>

                {/* 6. Description (Mandatory) */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-800">
                    Detailed Description <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Provide detailed facts, location, time, or specifics of what happened or what you propose..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-white resize-none"
                  />
                  <div className="text-right text-[10px] text-gray-400">
                    {formDescription.length} characters
                  </div>
                </div>

                {/* 7. Public Posting Option (Mandatory Prompt Feature) */}
                <div className="p-3.5 rounded-xl border border-red-200 bg-red-50/50 flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="publicOptionCheckbox"
                    checked={formIsPublic}
                    onChange={(e) => setFormIsPublic(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-red-600 focus:ring-red-500 border-gray-300 cursor-pointer"
                  />
                  <label htmlFor="publicOptionCheckbox" className="text-xs cursor-pointer select-none">
                    <span className="font-bold text-gray-900 block">
                      Post publicly on Complaint Page
                    </span>
                    <span className="text-gray-600 text-[11px] leading-relaxed block mt-0.5">
                      Enable this option to display your {formType} on the Public Board. This allows all fellow students to view the issue and read official Union Admin comments and resolution updates for public transparency.
                    </span>
                  </label>
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full btn-primary text-xs sm:text-sm py-2.5 font-bold shadow-md flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>
                      {isSubmitting
                        ? 'Submitting...'
                        : `Submit ${formType === 'complaint' ? 'Complaint' : 'Suggestion'}`}
                    </span>
                  </button>
                </div>

              </form>
            </div>
          )}

        </div>
      )}

      {/* 3. SUB-TAB 2: PUBLIC COMPLAINT BOARD */}
      {subTab === 'public' && (
        <div className="space-y-5">
          
          {/* Filter Bar */}
          <div className="glass-panel p-4 rounded-2xl border border-gray-200 bg-white space-y-3 shadow-xs">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              
              {/* Type Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                {['All', 'complaint', 'suggestion'].map((type) => {
                  const isSelected = publicTypeFilter === type;
                  const label = type === 'All' ? 'All Posts' : type === 'complaint' ? 'Complaints' : 'Suggestions';
                  return (
                    <button
                      key={type}
                      onClick={() => setPublicTypeFilter(type)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border"
                      style={isSelected
                        ? { backgroundColor: '#B91C1C', color: '#FFFFFF', borderColor: '#B91C1C', boxShadow: '0 1px 3px rgba(185,28,28,0.2)' }
                        : { backgroundColor: '#F3F4F6', color: '#374151', borderColor: '#E5E7EB' }
                      }
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Status Filter + Search */}
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={publicStatusFilter}
                  onChange={(e) => setPublicStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded-xl border border-gray-200 bg-white text-gray-700 font-medium"
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending Review</option>
                  <option value="Under Review">Under Review</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>

                <div className="relative flex-1 sm:w-60">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search public complaints..."
                    value={publicSearchTerm}
                    onChange={(e) => setPublicSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-red-500 bg-white"
                  />
                  {publicSearchTerm && (
                    <button
                      onClick={() => setPublicSearchTerm('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setSubTab('submit')}
                  className="btn-primary text-xs py-1.5 px-3 whitespace-nowrap"
                >
                  <MessageSquarePlus className="w-3.5 h-3.5" />
                  <span>+ File New</span>
                </button>
              </div>

            </div>
          </div>

          {/* Cards List */}
          {publicItems.length > 0 ? (
            <div className="space-y-4">
              {publicItems.map((item) => {
                const statusStyle = STATUS_CONFIG[item.status] || STATUS_CONFIG['Pending'];
                const isExpanded = expandedId === item.id;
                const isComplaint = item.type === 'complaint';

                return (
                  <div
                    key={item.id}
                    className="glass-panel p-4 sm:p-6 rounded-2xl border border-gray-200 bg-white hover:border-red-200 transition-all shadow-xs space-y-3"
                  >
                    {/* Header Row */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {/* Type badge */}
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                          isComplaint
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                        }`}>
                          {isComplaint ? 'Complaint' : 'Suggestion'}
                        </span>

                        {/* Status badge */}
                        <span
                          className="px-2.5 py-1 rounded-lg text-[10px] font-bold border"
                          style={{
                            background: statusStyle.bg,
                            color: statusStyle.color,
                            borderColor: statusStyle.border
                          }}
                        >
                          {statusStyle.label}
                        </span>

                        {/* Public Badge */}
                        <span className="text-[10px] text-gray-500 hidden sm:inline-flex items-center gap-1">
                          <Globe className="w-3 h-3 text-gray-400" />
                          <span>Public Post</span>
                        </span>
                      </div>

                      {/* Date */}
                      <span className="text-[11px] text-gray-400 font-mono">
                        {new Date(item.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>

                    {/* Subject & Description */}
                    <div>
                      <h3 className="font-extrabold text-sm sm:text-base text-gray-900 leading-snug">
                        {item.subject}
                      </h3>
                      <p className={`text-xs text-gray-600 mt-1 leading-relaxed ${
                        isExpanded ? '' : 'line-clamp-3'
                      }`}>
                        {item.description}
                      </p>
                      {item.description && item.description.length > 200 && (
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : item.id)}
                          className="text-[11px] font-bold text-red-700 hover:underline mt-1"
                        >
                          {isExpanded ? 'Show Less' : 'Read Full Description...'}
                        </button>
                      )}
                    </div>

                    {/* Attribution Row */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100 text-xs text-gray-500">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-700">{item.name}</span>
                        <span>•</span>
                        <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-[11px] text-gray-600">
                          {item.studentClass} • Year {item.year}
                        </span>
                      </div>

                      {isAdmin && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenCommentModal(item)}
                            className="btn-secondary text-xs py-1 px-2.5 font-semibold text-red-700 hover:bg-red-50 flex items-center gap-1.5"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>{item.adminComment ? 'Edit Admin Comment' : 'Add Admin Comment'}</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* OFFICIAL UNION ADMIN COMMENT SECTION (Key Prompt Requirement) */}
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      {item.adminComment ? (
                        <div className="p-3.5 rounded-xl bg-gray-50 border border-red-200/80 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <img src="/union_mec_logo.webp" alt="Union" className="w-4 h-4 object-contain rounded" />
                              <span className="text-xs font-bold text-red-800">
                                Official Union MEC Response
                              </span>
                              {item.adminCommentedBy && (
                                <span className="text-[10px] text-gray-500">
                                  by {item.adminCommentedBy}
                                </span>
                              )}
                            </div>
                            {item.adminCommentedAt && (
                              <span className="text-[10px] text-gray-400">
                                {new Date(item.adminCommentedAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-800 leading-relaxed font-normal bg-white p-2.5 rounded-lg border border-gray-200">
                            &ldquo;{item.adminComment}&rdquo;
                          </p>
                        </div>
                      ) : (
                        <div className="p-2.5 rounded-xl bg-gray-50 border border-dashed border-gray-200 flex items-center justify-between text-xs text-gray-400">
                          <span className="italic">
                            Awaiting official comment / action from Union MEC Senate...
                          </span>
                          {isAdmin && (
                            <button
                              onClick={() => handleOpenCommentModal(item)}
                              className="text-xs font-bold text-red-700 hover:underline"
                            >
                              Give Comment
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
              <Globe className="w-8 h-8 text-gray-400 mx-auto" />
              <h3 className="font-bold text-gray-700">No public posts match your filter</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Be the first to post a public grievance or suggestion for the College Student Union!
              </p>
              <button
                onClick={() => setSubTab('submit')}
                className="btn-primary text-xs py-1.5 px-3"
              >
                + Post to Public Board
              </button>
            </div>
          )}

        </div>
      )}

      {/* 4. SUB-TAB 3: UNION ADMIN REVIEW DESK (Admin Only) */}
      {subTab === 'admin' && isAdmin && (
        <div className="space-y-5">
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { label: 'Total Submissions', count: totalCount, color: '#B91C1C' },
              { label: 'Complaints', count: complaintCount, color: '#DC2626' },
              { label: 'Suggestions', count: suggestionCount, color: '#4F46E5' },
              { label: 'Pending Action', count: pendingCount, color: '#D97706' },
              { label: 'Resolved', count: resolvedCount, color: '#059669' },
            ].map(({ label, count, color }) => (
              <div key={label} className="bg-white p-3 rounded-xl border border-gray-200 shadow-xs">
                <div className="text-[10px] font-bold text-gray-500 uppercase">{label}</div>
                <div className="text-xl font-extrabold mt-0.5" style={{ color }}>{count}</div>
              </div>
            ))}
          </div>

          {/* Admin Controls & Filter Bar */}
          <div className="glass-panel p-4 rounded-2xl border border-gray-200 bg-white space-y-3 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3">
              
              <div className="flex items-center gap-2 flex-wrap">
                {/* Category Filter */}
                <select
                  value={adminTypeFilter}
                  onChange={(e) => setAdminTypeFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded-xl border border-gray-200 bg-white text-gray-700 font-medium"
                >
                  <option value="All">All Types</option>
                  <option value="complaint">Complaints Only</option>
                  <option value="suggestion">Suggestions Only</option>
                </select>

                {/* Status Filter */}
                <select
                  value={adminStatusFilter}
                  onChange={(e) => setAdminStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded-xl border border-gray-200 bg-white text-gray-700 font-medium"
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending Review</option>
                  <option value="Under Review">Under Review</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>

                {/* Visibility Filter */}
                <select
                  value={adminVisibilityFilter}
                  onChange={(e) => setAdminVisibilityFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded-xl border border-gray-200 bg-white text-gray-700 font-medium"
                >
                  <option value="All">All Visibilities</option>
                  <option value="Public">Public Board</option>
                  <option value="Private">Private Submissions</option>
                </select>
              </div>

              {/* Search */}
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search name, class, contact, topic..."
                  value={adminSearchTerm}
                  onChange={(e) => setAdminSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-red-500 bg-white"
                />
              </div>

            </div>
          </div>

          {/* Admin Items Table / Cards */}
          {adminItems.length > 0 ? (
            <div className="space-y-3">
              {adminItems.map((item) => {
                const statusStyle = STATUS_CONFIG[item.status] || STATUS_CONFIG['Pending'];
                const isComplaint = item.type === 'complaint';

                return (
                  <div
                    key={item.id}
                    className="glass-panel p-4 sm:p-5 rounded-2xl border border-gray-200 bg-white hover:border-red-300 transition-all space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                          isComplaint ? 'bg-red-100 text-red-800' : 'bg-indigo-100 text-indigo-800'
                        }`}>
                          {item.type}
                        </span>

                        <span
                          className="px-2 py-0.5 rounded-md text-[10px] font-bold border"
                          style={{
                            background: statusStyle.bg,
                            color: statusStyle.color,
                            borderColor: statusStyle.border
                          }}
                        >
                          {statusStyle.label}
                        </span>

                        {item.isPublic ? (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            <span>Public Board</span>
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200 flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            <span>Private to Union</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-gray-400">{item.id}</span>
                        <button
                          onClick={() => setDeleteConfirmId(item.id)}
                          className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-gray-100"
                          title="Delete entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <div>
                      <h4 className="font-extrabold text-sm text-gray-900">{item.subject}</h4>
                      <p className="text-xs text-gray-600 mt-1 leading-relaxed">{item.description}</p>
                    </div>

                    {/* Student Info & Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100 text-xs">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-gray-900">{item.name}</span>
                        <span className="text-gray-400">•</span>
                        <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-[11px] text-gray-700">
                          {item.studentClass} • Year {item.year}
                        </span>
                        {item.contactNumber && (
                          <a
                            href={`tel:${item.contactNumber}`}
                            className="inline-flex items-center gap-1 text-red-700 font-semibold hover:underline bg-red-50 px-2 py-0.5 rounded"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{item.contactNumber}</span>
                          </a>
                        )}
                      </div>

                      <button
                        onClick={() => handleOpenCommentModal(item)}
                        className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{item.adminComment ? 'Update Official Comment' : '+ Add Official Comment'}</span>
                      </button>
                    </div>

                    {/* Admin Comment Preview */}
                    {item.adminComment && (
                      <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-700 space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-gray-500 font-semibold">
                          <span>Official Comment by {item.adminCommentedBy || 'Union MEC'}</span>
                          <span>{new Date(item.adminCommentedAt).toLocaleDateString()}</span>
                        </div>
                        <p className="italic text-gray-900">&ldquo;{item.adminComment}&rdquo;</p>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
              <ShieldCheck className="w-8 h-8 text-gray-400 mx-auto" />
              <h3 className="font-bold text-gray-700">No submissions found</h3>
              <p className="text-xs text-gray-500">There are no complaints or suggestions matching your current admin filters.</p>
            </div>
          )}

        </div>
      )}

      {/* 5. ADMIN COMMENT & STATUS MODAL (Key Requirement) */}
      {commentingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-gray-200 space-y-4 max-h-[92vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900">
                    Official Union Admin Comment
                  </h3>
                  <p className="text-xs text-gray-500">
                    Respond to student submission for public transparency.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCommentingItem(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Submission Context Snippet */}
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900">{commentingItem.subject}</span>
                <span className="text-[10px] text-gray-500">{commentingItem.studentClass} • Year {commentingItem.year}</span>
              </div>
              <p className="text-gray-600 line-clamp-2">{commentingItem.description}</p>
            </div>

            {/* Status Selector */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-700">
                Update Resolution Status
              </label>
              <select
                value={adminStatusSelection}
                onChange={(e) => setAdminStatusSelection(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-red-500 bg-white font-semibold"
              >
                <option value="Pending">Pending Review</option>
                <option value="Under Review">Under Review</option>
                <option value="In Progress">In Progress (Action Initiated)</option>
                <option value="Resolved">Resolved / Action Completed</option>
              </select>
            </div>

            {/* Comment Textarea */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-700">
                Official Comment / Response (Visible to Public Viewers)
              </label>
              <textarea
                rows={4}
                required
                placeholder="State the official action taken, technician dispatch, maintenance status, or resolution..."
                value={adminCommentText}
                onChange={(e) => setAdminCommentText(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-red-500 resize-none font-normal"
              />
              <p className="text-[10px] text-gray-400">
                This response will be visible to all students on the public complaint board alongside your verified Union MEC designation.
              </p>
            </div>

            {/* Quick Templates */}
            <div className="space-y-1 pt-1">
              <span className="text-[10px] font-semibold text-gray-400 block">Quick Response Templates:</span>
              <div className="flex flex-wrap gap-1">
                {[
                  'Inspected by maintenance crew. Repair scheduled for Monday.',
                  'Matter forwarded to Principal and campus committee for approval.',
                  'Work completed and tested by college technician.',
                  'Issue resolved. Thank you for notifying the student union.'
                ].map((tmpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAdminCommentText(tmpl)}
                    className="text-[10px] px-2 py-0.5 rounded bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-700 border border-gray-200 text-left"
                  >
                    {tmpl}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setCommentingItem(null)}
                className="btn-secondary text-xs py-2 px-4"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSavingComment || !adminCommentText.trim()}
                onClick={handleSaveAdminComment}
                className="btn-primary text-xs py-2 px-5 font-bold"
              >
                {isSavingComment ? 'Publishing...' : 'Publish Official Comment'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 6. Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-gray-200 space-y-4">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-bold text-gray-900">Delete Submission?</h3>
              <p className="text-xs text-gray-500">
                Are you sure you want to permanently delete this complaint or suggestion from the portal?
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="btn-secondary text-xs py-2 px-4"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await onDeleteComplaint(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="btn-primary text-xs py-2 px-4 bg-red-700 hover:bg-red-800"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
