import React, { useState } from 'react';
import { 
  Award, 
  Plus, 
  Edit3, 
  Trash2, 
  Mail, 
  Phone, 
  Sparkles, 
  ShieldCheck, 
  Users, 
  Upload, 
  X, 
  Trophy,
  Palette,
  Compass,
  UserCheck,
  CheckCircle2,
  GraduationCap,
  Crown
} from 'lucide-react';
import { mecClasses, mecYears } from '../data/mockData';

const COMMON_POSTS = [
  'Chairperson',
  'Vice Chairperson',
  'General Secretary',
  'Magazine Editor',
  'Arts Secretary',
  'University Union Councillor (UUC)',
  'Women Representative',
  'Sports Secretary',
  'CS UG Representative',
  'CU UG Representative',
  'EC UG Representative',
  'EB UG Representative',
  'EEE UG Representative',
  'EV UG Representative',
  'MECH UG Representative',
  'PG Representative',
  'Joint Secretary'
];

const PRESET_AVATARS = [
  '/union_mec_logo.webp',
  '/mec_college_logo.webp',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80'
];

export default function AboutView({
  members = [],
  classRepresentatives = [],
  currentUser,
  onAddMember,
  onUpdateMember,
  onDeleteMember,
  onAddClassRep,
  onUpdateClassRep,
  onDeleteClassRep,
  onOpenLoginModal
}) {
  // Member modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Class Rep modal state
  const [isClassRepModalOpen, setIsClassRepModalOpen] = useState(false);
  const [editingClassRep, setEditingClassRep] = useState(null);
  const [deleteClassRepConfirmId, setDeleteClassRepConfirmId] = useState(null);

  // Member form state
  const [formName, setFormName] = useState('');
  const [formPost, setFormPost] = useState('');
  const [formPicture, setFormPicture] = useState('');
  const [formDepartment, setFormDepartment] = useState('CSB');
  const [formYear, setFormYear] = useState('4');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formBio, setFormBio] = useState('');
  const [formOrder, setFormOrder] = useState('1');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Class rep form state
  const [formCRName, setFormCRName] = useState('');
  const [formCRClass, setFormCRClass] = useState('CSA');
  const [formCRYear, setFormCRYear] = useState('4');
  const [crError, setCrError] = useState('');
  const [isSubmittingCR, setIsSubmittingCR] = useState(false);

  const isAdmin = Boolean(currentUser?.isUnionAdmin);

  // Open Add Member Modal
  const handleOpenAddModal = (presetPost = '') => {
    setEditingMember(null);
    setFormName('');
    setFormPost(presetPost || '');
    setFormPicture('/union_mec_logo.webp');
    setFormDepartment('CSB');
    setFormYear('4');
    setFormPhone('');
    setFormEmail('');
    setFormBio('');
    setFormOrder(String(members.length + 1));
    setFormError('');
    setIsModalOpen(true);
  };

  // Open Edit Member Modal
  const handleOpenEditModal = (member) => {
    setEditingMember(member);
    setFormName(member.name || '');
    setFormPost(member.post || '');
    setFormPicture(member.picture || '/union_mec_logo.webp');
    setFormDepartment(member.department || 'CSB');
    setFormYear(member.year ? String(member.year) : '4');
    setFormPhone(member.phone || '');
    setFormEmail(member.email || '');
    setFormBio(member.bio || '');
    setFormOrder(String(member.order || 1));
    setFormError('');
    setIsModalOpen(true);
  };

  // Handle image upload from file system
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFormError('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setFormError('Image size exceeds 2MB limit. Please choose a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setFormPicture(event.target.result);
      setFormError('');
    };
    reader.readAsDataURL(file);
  };

  // Handle Save Member
  const handleSubmitMember = async (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Member Name is mandatory.');
      return;
    }
    if (!formPost.trim()) {
      setFormError('Post / Designation is mandatory.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      const payload = {
        name: formName.trim(),
        post: formPost.trim(),
        picture: formPicture.trim() || '/union_mec_logo.webp',
        department: formDepartment,
        year: formYear,
        phone: formPhone.trim(),
        email: formEmail.trim(),
        bio: formBio.trim(),
        order: Number(formOrder) || members.length + 1
      };

      if (editingMember) {
        await onUpdateMember(editingMember.id, payload);
      } else {
        await onAddMember({
          id: `mem-${Date.now()}`,
          ...payload
        });
      }

      setIsModalOpen(false);
      setEditingMember(null);
    } catch (err) {
      setFormError(err.message || 'Failed to save member details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Class Rep Modal
  const handleOpenAddCRModal = () => {
    setEditingClassRep(null);
    setFormCRName('');
    setFormCRClass('CSA');
    setFormCRYear('4');
    setCrError('');
    setIsClassRepModalOpen(true);
  };

  const handleOpenEditCRModal = (rep) => {
    setEditingClassRep(rep);
    setFormCRName(rep.name || '');
    setFormCRClass(rep.className || 'CSA');
    setFormCRYear(rep.year ? String(rep.year) : '4');
    setCrError('');
    setIsClassRepModalOpen(true);
  };

  const handleSubmitCR = async (e) => {
    e.preventDefault();
    if (!formCRName.trim()) {
      setCrError('Name is mandatory.');
      return;
    }

    setIsSubmittingCR(true);
    setCrError('');

    try {
      const payload = {
        name: formCRName.trim(),
        className: formCRClass,
        year: formCRYear
      };

      if (editingClassRep) {
        if (onUpdateClassRep) await onUpdateClassRep(editingClassRep.id, payload);
      } else {
        if (onAddClassRep) {
          await onAddClassRep({
            id: `cr-${Date.now()}`,
            ...payload
          });
        }
      }

      setIsClassRepModalOpen(false);
      setEditingClassRep(null);
    } catch (err) {
      setCrError(err.message || 'Failed to save class representative.');
    } finally {
      setIsSubmittingCR(false);
    }
  };

  // Helper to find member by post or keywords reliably
  const findMemberByPost = (postKeyword) => {
    const key = postKeyword.toLowerCase().trim();
    // 1. Try exact match first
    const exact = members.find(m => (m.post || '').toLowerCase().trim() === key);
    if (exact) return exact;

    // 2. Specific guard: chairperson shouldn't match vice chairperson
    if (key === 'chairperson') {
      return members.find(m => {
        const p = (m.post || '').toLowerCase().trim();
        return (p.includes('chairperson') || p.includes('chairman') || p.includes('president')) && !p.includes('vice');
      });
    }

    // 3. Fallback partial includes
    return members.find(m => {
      const p = (m.post || '').toLowerCase().trim();
      return p.includes(key);
    });
  };

  // Categorize members for exact requested grid:
  // 1. Chairperson FIRST, then Vice Chairperson
  const chairperson = members.find(m => {
    const p = (m.post || '').toLowerCase().trim();
    return (p === 'chairperson' || p === 'chairman' || p.includes('chairperson') || p.includes('chairman')) && !p.includes('vice');
  }) || members.find(m => m.order === 1 || m.id === 'mem-1');

  const viceChairperson = members.find(m => {
    const p = (m.post || '').toLowerCase().trim();
    return p.includes('vice') && (p.includes('chair') || p.includes('chairperson') || p.includes('chairman'));
  }) || members.find(m => m.order === 2 || m.id === 'mem-2');

  // 2. Line 2: General Secretary, Magazine Editor, Arts Secretary
  const generalSecretary = findMemberByPost('general secretary');
  const magazineEditor = findMemberByPost('magazine editor');
  const artsSecretary = findMemberByPost('arts secretary') || findMemberByPost('arts club secretary');

  const officeBearerIds = new Set([
    chairperson?.id,
    viceChairperson?.id,
    generalSecretary?.id,
    magazineEditor?.id,
    artsSecretary?.id
  ].filter(Boolean));

  // 3. Executive Council: 2 UUCs, 2 Women Reps, Sports Secretary, 7 UG Reps (CS, CU, EC, EB, EEE, EV, MECH), and any other council members
  const executiveCouncilMembers = members.filter(m => !officeBearerIds.has(m.id));

  // Render Member Card helper with tiered spotlight
  const renderMemberCard = (member, fallbackPostTitle = '', highlightVariant = 'executive') => {
    const isLead = highlightVariant === 'spotlight-lead';
    const isCore = highlightVariant === 'spotlight-core';
    const isOfficeBearer = isLead || isCore;

    if (!member) {
      return (
        <div className={`glass-panel p-5 rounded-2xl border-2 border-dashed bg-gray-50/50 flex flex-col items-center justify-center text-center min-h-[220px] space-y-2 ${
          isOfficeBearer ? 'border-red-200 bg-red-50/20' : 'border-gray-200'
        }`}>
          <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div className="text-xs font-bold text-gray-600 uppercase tracking-wider">{fallbackPostTitle}</div>
          <p className="text-[11px] text-gray-400">Position Open</p>
          {isAdmin && (
            <button
              onClick={() => handleOpenAddModal(fallbackPostTitle)}
              className="btn-secondary text-[11px] py-1 px-3 mt-1 font-semibold"
            >
              + Add {fallbackPostTitle}
            </button>
          )}
        </div>
      );
    }

    // Determine container styles based on spotlight hierarchy
    let containerClass = 'group glass-panel rounded-xl border border-gray-200 hover:border-red-200 bg-white shadow-2xs hover:shadow-xs transition-all duration-200 flex flex-col overflow-hidden h-full';
    if (isLead) {
      containerClass = 'group glass-panel rounded-2xl sm:rounded-3xl border-2 border-red-300 hover:border-red-600 bg-white shadow-md hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden ring-4 ring-red-500/10 h-full';
    } else if (isCore) {
      containerClass = 'group glass-panel rounded-2xl border-2 border-red-200 hover:border-red-500 bg-white shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden ring-2 ring-red-500/10 h-full';
    }

    return (
      <div key={member.id} className={containerClass}>
        {/* Raw Photo (100% natural picture, no overlay, perfect 3:4 aspect ratio) */}
        <div 
          className="relative w-full aspect-portrait bg-gray-50 overflow-hidden shrink-0"
          style={{ aspectRatio: '3 / 4' }}
        >
          <img
            src={member.picture || '/union_mec_logo.webp'}
            alt={member.name}
            className={`w-full h-full object-cover object-top transition-transform duration-300 ${
              isOfficeBearer ? 'group-hover:scale-105' : 'group-hover:scale-103'
            }`}
            style={{ objectFit: 'cover', objectPosition: 'top center' }}
            onError={(e) => {
              const src = e.target.src || '';
              if (src.includes('/council/') && src.endsWith('.webp')) {
                e.target.src = src.replace('.webp', '.jpg');
              } else if (src.includes('/council/') && src.endsWith('.jpg')) {
                e.target.src = src.replace('.jpg', '.png');
              } else {
                e.target.onerror = null;
                e.target.src = '/union_mec_logo.webp';
              }
            }}
          />
        </div>

        {/* Card Body with prominent post spotlight */}
        <div className={`flex-1 flex flex-col justify-between bg-white ${
          isLead 
            ? 'p-4 sm:p-5 space-y-3' 
            : isCore 
              ? 'p-3.5 sm:p-4 space-y-2.5' 
              : 'p-2.5 sm:p-3 space-y-1.5'
        }`}>
          <div>
            {/* Post Badge Spotlight */}
            <div className="flex items-center justify-between gap-1.5 mb-1.5 flex-wrap">
              {isLead ? (
                <div 
                  className="inline-flex items-center px-3.5 py-1.5 rounded-xl font-black text-xs sm:text-sm tracking-wider uppercase shadow-md"
                  style={{ backgroundColor: '#991B1B', color: '#FFFFFF', paddingLeft: '14px', paddingRight: '14px' }}
                >
                  <span className="truncate">{member.post}</span>
                </div>
              ) : isCore ? (
                <div 
                  className="inline-flex items-center px-3 py-1 rounded-lg font-extrabold text-xs tracking-wide uppercase shadow-xs"
                  style={{ backgroundColor: '#B91C1C', color: '#FFFFFF', paddingLeft: '12px', paddingRight: '12px' }}
                >
                  <span className="truncate">{member.post}</span>
                </div>
              ) : (
                <span 
                  className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-gray-100 text-gray-700 border border-gray-200/80 truncate max-w-[75%]"
                  style={{ paddingLeft: '8px', paddingRight: '8px' }}
                >
                  <span className="truncate">{member.post}</span>
                </span>
              )}

              {member.department && (
                <span className={`font-semibold whitespace-nowrap ${
                  isLead 
                    ? 'text-xs text-gray-500 bg-gray-100/90 px-2 py-0.5 rounded-md border border-gray-200/70 font-bold' 
                    : isCore 
                      ? 'text-[11px] text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-200/60' 
                      : 'text-[10px] text-gray-400'
                }`}>
                  {member.department} {member.year ? `• Y${member.year}` : ''}
                </span>
              )}
            </div>

            {/* Member Name */}
            <h3 className={`font-black text-gray-900 group-hover:text-red-700 transition-colors tracking-tight truncate ${
              isLead 
                ? 'text-base sm:text-xl md:text-2xl mt-1' 
                : isCore 
                  ? 'text-sm sm:text-base md:text-lg mt-0.5' 
                  : 'text-xs sm:text-sm mt-0.5 font-bold'
            }`}>
              {member.name}
            </h3>
          </div>

          {/* Contact Links & Admin Actions */}
          <div className={`border-t border-gray-100 flex items-center justify-between gap-1.5 ${
            isLead ? 'pt-3 text-xs text-gray-500' : isCore ? 'pt-2 text-xs text-gray-500' : 'pt-1.5 text-[11px] text-gray-400'
          }`}>
            <div className="flex items-center gap-2 truncate">
              {member.email && (
                <a
                  href={`mailto:${member.email}`}
                  className="hover:text-red-600 transition-colors p-0.5"
                  title={`Email ${member.email}`}
                >
                  <Mail className={isLead ? 'w-4 h-4' : isCore ? 'w-3.5 h-3.5' : 'w-3 h-3'} />
                </a>
              )}
              {member.phone && (
                <a
                  href={`tel:${member.phone}`}
                  className="hover:text-red-600 transition-colors p-0.5"
                  title={`Call ${member.phone}`}
                >
                  <Phone className={isLead ? 'w-4 h-4' : isCore ? 'w-3.5 h-3.5' : 'w-3 h-3'} />
                </a>
              )}
            </div>

            {isAdmin && (
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleOpenEditModal(member)}
                  className="p-1 rounded text-gray-400 hover:text-red-700 hover:bg-red-50 transition-colors"
                  title="Edit Member"
                >
                  <Edit3 className={isLead ? 'w-4 h-4' : 'w-3 h-3'} />
                </button>
                <button
                  onClick={() => setDeleteConfirmId(member.id)}
                  className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Delete Member"
                >
                  <Trash2 className={isLead ? 'w-4 h-4' : 'w-3 h-3'} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* 1. Hero Banner */}
      <div className="hero-gradient-border p-5 sm:p-8 md:p-10 relative overflow-hidden rounded-2xl sm:rounded-3xl">
        <div 
          className="hero-glow-blob"
          style={{ background: 'rgba(239,68,68,0.08)', top: '-60px', right: '-60px' }}
        />
        <div 
          className="hero-glow-blob"
          style={{ background: 'rgba(220,38,38,0.05)', bottom: '-60px', left: '-60px' }}
        />

        <div className="relative z-10 max-w-4xl space-y-4 sm:space-y-5">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white border border-gray-200 px-3 py-1.5 rounded-full text-xs shadow-xs">
            <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
              <img src="/mec_college_logo.webp" alt="MEC" className="w-4 h-4 object-contain" />
              <img src="/union_mec_logo.webp" alt="Union MEC" className="w-4 h-4 object-contain" />
            </div>
            <span className="font-semibold text-gray-900">Govt. Model Engineering College</span>
            <span className="text-gray-300">•</span>
            <span className="font-bold text-red-700">Union MEC</span>
          </div>

          {/* Heading & Cleaned Paragraph */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight" style={{ color: '#000000' }}>
              College Student Union <span style={{ color: '#B91C1C' }}>• Union MEC</span>
            </h1>
            <p className="text-xs sm:text-sm md:text-base max-w-2xl leading-relaxed" style={{ color: '#4B5563' }}>
              The democratically elected apex student body representing all engineering scholars of Govt. Model Engineering College.
            </p>
          </div>

          {/* Key Union Highlights (Exact requested values) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 pt-2">
            {[
              { label: 'Executive Council', value: '18 Members', icon: Users, color: '#B91C1C' },
              { label: 'College Senate', value: 'Est. 1989', icon: Compass, color: '#059669' },
              { label: 'Annual Sports Fest', value: 'Chakravyuh', icon: Trophy, color: '#D97706' },
              { label: 'Annual Arts Fest', value: 'Layatharang', icon: Palette, color: '#7C3AED' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-white/80 backdrop-blur-sm p-3 rounded-xl border border-gray-200/80 shadow-xs">
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className="w-3.5 h-3.5" style={{ color }} />
                  <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{label}</span>
                </div>
                <div className="text-sm sm:text-base font-extrabold text-gray-900">{value}</div>
              </div>
            ))}
          </div>

          {/* Admin Action Bar */}
          {isAdmin && (
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => handleOpenAddModal()}
                className="btn-primary text-xs sm:text-sm py-2 px-4 shadow-sm flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Council Member</span>
              </button>
              <button
                onClick={handleOpenAddCRModal}
                className="btn-secondary text-xs sm:text-sm py-2 px-4 shadow-sm flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Class Representative</span>
              </button>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-xs font-semibold text-red-800">
                <ShieldCheck className="w-3.5 h-3.5 text-red-600" />
                <span>Admin Editing Access Enabled</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. SECTION 1: OFFICE BEARERS (SPOTLIGHT) */}
      <section className="space-y-5">
        <div className="border-b border-red-200/80 pb-3 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Office Bearers
            </h2>
          </div>
          {isAdmin && (
            <button
              onClick={() => handleOpenAddModal('Office Bearer')}
              className="btn-primary text-xs py-1.5 px-3 self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Office Bearer</span>
            </button>
          )}
        </div>

        {/* Office Bearers Spotlight Grid:
            Line 1: Chairperson & Vice Chairperson parallel (2 columns, large spotlight cards)
            Line 2: General Secretary, Magazine Editor, Arts Secretary parallel (3 columns, spotlight cards) */}
        <div className="space-y-4 sm:space-y-5">
          {/* Line 1: Chairperson & Vice Chairperson Parallel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {renderMemberCard(chairperson, 'Chairperson', 'spotlight-lead')}
            {renderMemberCard(viceChairperson, 'Vice Chairperson', 'spotlight-lead')}
          </div>

          {/* Line 2: General Secretary, Magazine Editor, Arts Secretary Parallel */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
            {renderMemberCard(generalSecretary, 'General Secretary', 'spotlight-core')}
            {renderMemberCard(magazineEditor, 'Magazine Editor', 'spotlight-core')}
            {renderMemberCard(artsSecretary, 'Arts Secretary', 'spotlight-core')}
          </div>
        </div>
      </section>

      {/* 3. SECTION 2: EXECUTIVE COUNCIL (13 Members, Compact Grid) */}
      <section className="space-y-4 pt-4">
        <div className="border-b border-gray-200 pb-2.5 flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900">
              Executive Council
            </h2>
          </div>
          {isAdmin && (
            <button
              onClick={() => handleOpenAddModal('Executive Council')}
              className="btn-primary text-xs py-1.5 px-3"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Council Member</span>
            </button>
          )}
        </div>

        {/* Executive Council in clean, compact 5-column grid */}
        {executiveCouncilMembers.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-3.5">
            {executiveCouncilMembers.map((member) => renderMemberCard(member, member.post, 'executive'))}
          </div>
        ) : (
          <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-200 text-xs text-gray-500">
            No additional executive council members found.
          </div>
        )}
      </section>

      {/* 4. SECTION 3: CLASS REPRESENTATIVES (Only Names) */}
      <section className="glass-panel p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-gray-200 bg-white space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-gray-900">
              Class Representatives
            </h2>
          </div>

          {isAdmin && (
            <button
              onClick={handleOpenAddCRModal}
              className="btn-primary text-xs py-1.5 px-3 whitespace-nowrap flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Class Rep</span>
            </button>
          )}
        </div>

        {/* Clean, Elegant Names Grid (ONLY NAMES with clean styling) */}
        {classRepresentatives.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3">
            {classRepresentatives.map((cr) => (
              <div
                key={cr.id}
                className="group relative p-2.5 sm:p-3 rounded-xl border border-gray-200/80 bg-gray-50/70 hover:bg-white hover:border-red-300 hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="font-extrabold text-xs sm:text-sm text-gray-900 group-hover:text-red-700 transition-colors truncate">
                    {cr.name}
                  </div>
                  {cr.className && (
                    <div className="text-[10px] font-mono text-gray-500 font-semibold mt-0.5">
                      {cr.className} {cr.year ? `• Year ${cr.year}` : ''}
                    </div>
                  )}
                </div>

                {/* Admin Quick Action */}
                {isAdmin && (
                  <div className="flex items-center justify-end gap-1 mt-1.5 pt-1.5 border-t border-gray-100 opacity-60 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenEditCRModal(cr)}
                      className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50"
                      title="Edit Name"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setDeleteClassRepConfirmId(cr.id)}
                      className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-gray-500 bg-gray-50 rounded-xl">
            No class representatives listed yet.
          </div>
        )}
      </section>



      {/* 6. MODAL: Add / Edit Union Member (Admin Only) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-gray-200 max-h-[92vh] overflow-y-auto space-y-4">
            
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900">
                    {editingMember ? 'Edit Union Member' : 'Add Union Member'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Picture, Name, and Post designation to display on About page.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitMember} className="space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                  {formError}
                </div>
              )}

              {/* Photo Upload & Preview */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700">
                  Member Picture / Photo *
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl border-2 border-red-200 overflow-hidden bg-gray-50 shrink-0 relative">
                    <img
                      src={formPicture || '/union_mec_logo.webp'}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/union_mec_logo.webp';
                      }}
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="btn-secondary text-xs py-1.5 px-3 cursor-pointer inline-flex items-center gap-1.5 font-semibold">
                      <Upload className="w-3.5 h-3.5 text-red-700" />
                      <span>Upload Photo File</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                    <input
                      type="text"
                      placeholder="Or paste photo path / URL (/council/... or https://...)"
                      value={formPicture}
                      onChange={(e) => setFormPicture(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                {/* Preset Avatars */}
                <div className="pt-1">
                  <span className="text-[10px] font-semibold text-gray-400 block mb-1">Preset avatar options:</span>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {PRESET_AVATARS.map((av, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFormPicture(av)}
                        className={`w-7 h-7 rounded-lg overflow-hidden border shrink-0 transition-transform ${
                          formPicture === av ? 'ring-2 ring-red-600 scale-105' : 'opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={av} alt="Preset" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Name (Mandatory) */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700">
                  Full Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mohammed Shaddaad"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-red-500 font-medium"
                />
              </div>

              {/* Post / Designation (Mandatory) */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700">
                  Post / Official Role <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chairperson, General Secretary, CS UG Representative"
                  value={formPost}
                  onChange={(e) => setFormPost(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-red-500 font-medium"
                />
                {/* Quick Chips */}
                <div className="flex flex-wrap gap-1 pt-1 max-h-24 overflow-y-auto">
                  {COMMON_POSTS.map((postOption) => (
                    <button
                      key={postOption}
                      type="button"
                      onClick={() => setFormPost(postOption)}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 hover:bg-red-50 hover:text-red-700 text-gray-600 border border-gray-200 transition-colors"
                    >
                      {postOption}
                    </button>
                  ))}
                </div>
              </div>

              {/* Class & Year */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-700">
                    Branch / Department
                  </label>
                  <select
                    value={formDepartment}
                    onChange={(e) => setFormDepartment(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-red-500 bg-white"
                  >
                    {mecClasses.map((cls) => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-700">
                    Year of Study
                  </label>
                  <select
                    value={formYear}
                    onChange={(e) => setFormYear(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-red-500 bg-white"
                  >
                    {mecYears.map((yr) => (
                      <option key={yr} value={yr}>Year {yr}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Contact Information (Optional) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-700">
                    Contact Email <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="email"
                    placeholder="student@mec.ac.in"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-700">
                    Phone Number <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98470 12345"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Bio (Optional) */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700">
                  Brief Bio / Message <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Key responsibilities or message..."
                  value={formBio}
                  onChange={(e) => setFormBio(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-red-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary text-xs py-2 px-5 font-bold"
                >
                  {isSubmitting ? 'Saving...' : editingMember ? 'Update Member' : 'Save Member'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* 7. MODAL: Add / Edit Class Representative (Admin Only) */}
      {isClassRepModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-gray-200 space-y-4">
            
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900">
                    {editingClassRep ? 'Edit Class Representative' : 'Add Class Representative'}
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Displayed with only name in the class representatives section.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsClassRepModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitCR} className="space-y-3">
              {crError && (
                <div className="p-2.5 rounded-xl bg-red-50 text-red-700 text-xs">
                  {crError}
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700">
                  Student Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Arjun Nair"
                  value={formCRName}
                  onChange={(e) => setFormCRName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-red-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-700">
                    Class
                  </label>
                  <select
                    value={formCRClass}
                    onChange={(e) => setFormCRClass(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-gray-200 bg-white"
                  >
                    {mecClasses.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-700">
                    Year
                  </label>
                  <select
                    value={formCRYear}
                    onChange={(e) => setFormCRYear(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-gray-200 bg-white"
                  >
                    {mecYears.map(yr => (
                      <option key={yr} value={yr}>Year {yr}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsClassRepModalOpen(false)}
                  className="btn-secondary text-xs py-2 px-3.5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCR}
                  className="btn-primary text-xs py-2 px-4 font-bold"
                >
                  {isSubmittingCR ? 'Saving...' : editingClassRep ? 'Update Name' : 'Add Name'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* 8. MODAL: Delete Union Member Confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-gray-200 space-y-4">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-bold text-gray-900">Remove Union Member?</h3>
              <p className="text-xs text-gray-500">
                Are you sure you want to remove this member from the About Union page?
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
                  await onDeleteMember(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="btn-primary text-xs py-2 px-4 bg-red-700 hover:bg-red-800"
              >
                Delete Member
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. MODAL: Delete Class Rep Confirmation */}
      {deleteClassRepConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-gray-200 space-y-4">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-bold text-gray-900">Remove Class Representative?</h3>
              <p className="text-xs text-gray-500">
                Are you sure you want to remove this class representative?
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setDeleteClassRepConfirmId(null)}
                className="btn-secondary text-xs py-2 px-4"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (onDeleteClassRep) await onDeleteClassRep(deleteClassRepConfirmId);
                  setDeleteClassRepConfirmId(null);
                }}
                className="btn-primary text-xs py-2 px-4 bg-red-700 hover:bg-red-800"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
