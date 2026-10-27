import React, { useState, useEffect } from 'react';
import { 
  X, 
  Upload, 
  Instagram, 
  Users, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Image as ImageIcon,
  Building2,
  Phone,
  User,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export default function ClubProfileModal({ 
  isOpen, 
  onClose, 
  club, 
  onSaveProfile 
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [logo, setLogo] = useState('');
  const [instagram, setInstagram] = useState('');
  const [coreMembers, setCoreMembers] = useState([
    { id: '1', name: '', designation: '', phone: '' }
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Sync state when club changes or modal opens
  useEffect(() => {
    if (club) {
      setName(club.name || '');
      setDescription(club.description || '');
      setLogo(club.logo || '');
      setInstagram(club.instagram || '');
      if (Array.isArray(club.coreMembers) && club.coreMembers.length > 0) {
        setCoreMembers(club.coreMembers.map((m, idx) => ({
          id: m.id || String(idx + 1),
          name: m.name || '',
          designation: m.designation || '',
          phone: m.phone || ''
        })));
      } else {
        setCoreMembers([
          { id: '1', name: '', designation: 'Lead / Executive', phone: '' }
        ]);
      }
      setFormError('');
    }
  }, [club, isOpen]);

  if (!isOpen || !club) return null;

  // Handle local image file upload, enforce fixed 1:1 square crop filled to maximum size, convert to Data URL
  const handleLogoFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFormError('Please select a valid image file (PNG, JPG, WEBP, SVG).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormError('Image size exceeds 5MB. Please upload a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const rawDataUrl = event.target.result;
      const img = new Image();
      img.onload = () => {
        try {
          // Crop to largest center square and fill 1:1 canvas to maximum size
          const minDim = Math.min(img.width, img.height);
          const sx = (img.width - minDim) / 2;
          const sy = (img.height - minDim) / 2;

          // Target resolution for crisp logo (up to 800x800)
          const targetSize = Math.min(Math.max(minDim, 512), 800);
          const canvas = document.createElement('canvas');
          canvas.width = targetSize;
          canvas.height = targetSize;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            setLogo(rawDataUrl);
            setFormError('');
            return;
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Draw center square crop filling full square canvas to maximum size
          ctx.drawImage(
            img,
            sx, sy, minDim, minDim, // source: max center square
            0, 0, targetSize, targetSize // destination: full 1:1 canvas
          );

          let squareDataUrl = canvas.toDataURL('image/webp', 0.92);
          if (!squareDataUrl || squareDataUrl === 'data:,') {
            squareDataUrl = canvas.toDataURL('image/png');
          }
          setLogo(squareDataUrl);
          setFormError('');
        } catch (err) {
          setLogo(rawDataUrl);
          setFormError('');
        }
      };
      img.onerror = () => {
        setLogo(rawDataUrl);
        setFormError('');
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
    // Reset input value so re-selecting same file triggers change
    e.target.value = '';
  };

  // Add core member
  const handleAddMember = () => {
    const newId = `member-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setCoreMembers([
      ...coreMembers,
      { id: newId, name: '', designation: '', phone: '' }
    ]);
  };

  // Update core member field
  const handleUpdateMember = (id, field, value) => {
    setCoreMembers(coreMembers.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  // Remove core member (maintains at least 1)
  const handleRemoveMember = (id) => {
    if (coreMembers.length <= 1) {
      setFormError('At least one core committee member is required.');
      return;
    }
    setCoreMembers(coreMembers.filter(m => m.id !== id));
    setFormError('');
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Club name cannot be empty.');
      return;
    }

    // Filter valid members
    const validMembers = coreMembers
      .map(m => ({
        ...m,
        name: m.name.trim(),
        designation: m.designation.trim() || 'Core Member',
        phone: m.phone.trim()
      }))
      .filter(m => m.name.length > 0);

    if (validMembers.length === 0) {
      setFormError('Please add at least one core member name.');
      return;
    }

    setIsSaving(true);
    setFormError('');

    try {
      const updatedData = {
        ...club,
        name: name.trim(),
        description: description.trim(),
        logo: logo.trim(),
        instagram: instagram.trim(),
        coreMembers: validMembers,
        updatedAt: new Date().toISOString()
      };

      await onSaveProfile(club.id, updatedData);
      onClose();
    } catch (err) {
      setFormError('Failed to save profile changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div 
      className="modal-overlay animate-fade-in" 
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="glass-panel w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl border border-gray-200 p-6 sm:p-8 relative bg-white shadow-2xl space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:text-gray-900 hover:bg-gray-200 flex items-center justify-center transition-colors border border-gray-200"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center shrink-0 shadow-2xs">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
              Edit Club Profile
            </h2>
            <p className="text-xs text-gray-600 mt-0.5">
              Update logo, Instagram link, about section, and core team member contacts
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {formError && (
          <div className="p-3.5 rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs flex items-center gap-2 font-medium animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* SECTION 1: BASIC INFORMATION & LOGO */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-100 pb-2">
              <Sparkles className="w-3.5 h-3.5 text-red-600" />
              <span>General Details</span>
            </h3>

            {/* Club Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">Club / Organization Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. IEEE MEC Student Branch"
                className="input-field text-xs w-full rounded-xl"
              />
            </div>

            {/* Logo Preview & Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 flex items-center justify-between">
                <span>Club Logo</span>
                <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
                  Fixed 1:1 Square Ratio • Fills to Max
                </span>
              </label>

              <div className="flex items-start sm:items-center gap-4">
                {/* Fixed Square Logo Preview (fills to maximum size) */}
                <div 
                  className="w-20 h-20 sm:w-24 sm:h-24 aspect-square rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center shrink-0 overflow-hidden shadow-xs relative group"
                  style={{ aspectRatio: '1 / 1' }}
                >
                  {logo ? (
                    <>
                      <img 
                        src={logo} 
                        alt="Logo preview" 
                        className="w-full h-full object-cover"
                        style={{ aspectRatio: '1 / 1', objectFit: 'cover' }}
                        onError={() => {
                          setLogo('');
                          setFormError('Invalid image URL. Please upload a file or provide a direct image link.');
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setLogo('')}
                        className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-[10px] font-bold gap-1 cursor-pointer"
                        title="Remove Logo"
                      >
                        <Trash2 className="w-4 h-4 text-red-300" />
                        <span>Remove</span>
                      </button>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-2 text-center">
                      <ImageIcon className="w-6 h-6 stroke-[1.5]" />
                      <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mt-1">1:1 Square</span>
                    </div>
                  )}
                </div>

                {/* Input URL or File Upload */}
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={logo}
                    onChange={(e) => setLogo(e.target.value)}
                    placeholder="Paste image URL (e.g. https://... or /logo.png)"
                    className="input-field text-xs w-full rounded-xl"
                  />

                  <div className="flex items-center gap-2 flex-wrap">
                    <label className="btn-secondary text-[11px] py-1.5 px-3 rounded-lg flex items-center gap-1.5 cursor-pointer font-bold border border-gray-200 hover:border-red-300">
                      <Upload className="w-3.5 h-3.5 text-gray-600" />
                      <span>Upload Logo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoFileUpload}
                        className="hidden"
                      />
                    </label>
                    <span className="text-[10px] text-gray-500 font-medium">
                      Auto-crops to fixed 1:1 square &amp; fills to maximum size
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Instagram Link */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <Instagram className="w-3.5 h-3.5 text-pink-600" />
                <span>Instagram Profile Link / Handle</span>
              </label>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="e.g. https://instagram.com/ieee_mec or @ieee_mec"
                className="input-field text-xs w-full rounded-xl"
              />
            </div>

            {/* Description / Bio */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">About / Description</label>
              <textarea
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of your club's missions, activities, and campus presence..."
                className="input-field text-xs w-full resize-none rounded-xl"
              />
            </div>
          </div>

          {/* SECTION 2: CORE COMMITTEE MEMBERS */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-red-600" />
                <span>Core Committee Members (Starts with 1, add as needed)</span>
              </h3>
              <button
                type="button"
                onClick={handleAddMember}
                className="btn-secondary text-[11px] py-1 px-2.5 flex items-center gap-1 font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Member</span>
              </button>
            </div>

            <div className="space-y-3">
              {coreMembers.map((member, index) => (
                <div 
                  key={member.id} 
                  className="p-3.5 rounded-2xl border border-gray-200 bg-gray-50/70 space-y-2.5 relative group shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[11px] text-gray-600 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-red-600" />
                      <span>Member #{index + 1}</span>
                    </span>

                    {coreMembers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(member.id)}
                        className="p-1 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Remove member"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {/* Name */}
                    <div>
                      <input
                        type="text"
                        required
                        value={member.name}
                        onChange={(e) => handleUpdateMember(member.id, 'name', e.target.value)}
                        placeholder="Full Name *"
                        className="input-field text-xs w-full rounded-xl bg-white"
                      />
                    </div>

                    {/* Designation */}
                    <div>
                      <input
                        type="text"
                        required
                        value={member.designation}
                        onChange={(e) => handleUpdateMember(member.id, 'designation', e.target.value)}
                        placeholder="Designation (e.g. Chair) *"
                        className="input-field text-xs w-full rounded-xl bg-white"
                      />
                    </div>

                    {/* Phone Number */}
                    <div>
                      <input
                        type="tel"
                        value={member.phone}
                        onChange={(e) => handleUpdateMember(member.id, 'phone', e.target.value)}
                        placeholder="Phone Number (e.g. +91 9876543210)"
                        className="input-field text-xs w-full rounded-xl bg-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddMember}
              className="w-full py-2 border-2 border-dashed border-gray-200 hover:border-red-400 hover:bg-red-50/30 rounded-2xl text-xs text-gray-600 hover:text-red-700 font-bold transition-all flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Another Core Member</span>
            </button>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="btn-secondary text-xs py-2 px-4"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="btn-primary text-xs py-2 px-6 font-bold flex items-center gap-2 shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSaving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
