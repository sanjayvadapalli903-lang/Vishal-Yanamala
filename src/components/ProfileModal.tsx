import React, { useState } from 'react';
import {
  User as UserIcon,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  ShieldCheck,
  Building2,
  Mail,
  Calendar,
  KeyRound,
  Edit2,
  GraduationCap,
  BookOpen,
  Camera,
  Upload,
  Image as ImageIcon,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'profile' | 'picture' | 'password';
}

// Preset campus avatars
const PRESET_AVATARS = [
  { id: 'av_1', label: 'Student Male', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80' },
  { id: 'av_2', label: 'Student Female', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80' },
  { id: 'av_3', label: 'Student Tech', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80' },
  { id: 'av_4', label: 'Faculty Female', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80' },
  { id: 'av_5', label: 'Faculty Male', url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80' },
  { id: 'av_6', label: 'Dean / Principal', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80' },
  { id: 'av_7', label: 'Scholar Glasses', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80' },
  { id: 'av_8', label: 'Researcher', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80' },
  { id: 'av_9', label: 'Creative Designer', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80' },
  { id: 'av_10', label: 'Engineering Lead', url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop&q=80' },
];

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, initialTab = 'profile' }) => {
  const { user, changePassword, updateProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<'profile' | 'picture' | 'password'>(initialTab);

  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      if (user) {
        setSelectedAvatarUrl(user.avatarUrl || '');
        setEditName(user.name || '');
        setEditDepartment(user.department || '');
      }
    }
  }, [isOpen, initialTab, user]);

  // Change Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passFeedback, setPassFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

  // Edit Profile State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editDepartment, setEditDepartment] = useState(user?.department || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

  // Profile Picture State
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState(user?.avatarUrl || '');
  const [customAvatarInput, setCustomAvatarInput] = useState('');
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
  const [avatarFeedback, setAvatarFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

  if (!isOpen || !user) return null;

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassFeedback(null);

    if (!currentPassword.trim()) {
      setPassFeedback({ type: 'error', message: 'Please enter your current password.' });
      return;
    }

    if (newPassword.length < 6) {
      setPassFeedback({ type: 'error', message: 'New password must be at least 6 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassFeedback({ type: 'error', message: 'New passwords do not match. Please verify.' });
      return;
    }

    setIsChangingPass(true);
    const result = await changePassword(currentPassword, newPassword);
    setIsChangingPass(false);

    if (result.success) {
      setPassFeedback({ type: 'success', message: 'Password updated successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setPassFeedback(null);
      }, 3500);
    } else {
      setPassFeedback({ type: 'error', message: result.message || 'Failed to update password.' });
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setProfileFeedback(null);

    const result = await updateProfile({
      name: editName,
      department: editDepartment,
    });

    setIsUpdatingProfile(false);
    if (result.success) {
      setProfileFeedback({ type: 'success', message: 'Profile details updated!' });
      setIsEditingProfile(false);
      setTimeout(() => setProfileFeedback(null), 3000);
    } else {
      setProfileFeedback({ type: 'error', message: result.message || 'Failed to update profile.' });
    }
  };

  // Handle Local File Upload for Avatar
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setAvatarFeedback({ type: 'error', message: 'Image size should be less than 2MB.' });
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setSelectedAvatarUrl(uploadEvent.target.result as string);
          setAvatarFeedback({ type: 'success', message: 'Photo loaded! Click "Save Profile Picture" to apply.' });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Save Profile Picture
  const handleSaveAvatar = async () => {
    if (!selectedAvatarUrl) return;
    setIsUpdatingAvatar(true);
    setAvatarFeedback(null);

    const result = await updateProfile({
      avatarUrl: selectedAvatarUrl,
    });

    setIsUpdatingAvatar(false);
    if (result.success) {
      setAvatarFeedback({ type: 'success', message: 'Profile picture updated successfully!' });
      setTimeout(() => {
        setAvatarFeedback(null);
      }, 3000);
    } else {
      setAvatarFeedback({ type: 'error', message: result.message || 'Failed to update profile picture.' });
    }
  };

  const roleBadgeColor =
    user.role === 'STUDENT'
      ? 'bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
      : user.role === 'TEACHER'
      ? 'bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
      : 'bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';

  const RoleIcon =
    user.role === 'STUDENT' ? GraduationCap : user.role === 'TEACHER' ? BookOpen : Building2;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs font-sans">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Account & Profile Settings</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Manage identity, photo, and security credentials</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card Top Summary with Quick Change Photo Button */}
        <div className="p-4 sm:p-6 bg-linear-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 dark:from-blue-950/40 dark:via-indigo-950/40 dark:to-purple-950/40 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="relative group cursor-pointer" onClick={() => setActiveTab('picture')}>
              <img
                src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={user.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-white dark:ring-slate-800 shadow-md group-hover:opacity-90 transition"
              />
              <button
                type="button"
                className="absolute inset-0 bg-slate-900/40 rounded-2xl flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition"
                title="Change Photo"
              >
                <Camera className="w-5 h-5" />
                <span className="text-[10px] font-bold mt-0.5">Edit</span>
              </button>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 flex items-center justify-center text-white" title="Active Account">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="overflow-hidden flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-bold text-lg text-slate-900 dark:text-white truncate">{user.name}</h4>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1 ${roleBadgeColor}`}>
                  <RoleIcon className="w-3 h-3" />
                  <span>{user.role}</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">ID: {user.collegeId}</p>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium truncate mt-0.5">{user.department}</p>
            </div>
          </div>
        </div>

        {/* 3 Tab Switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 px-4 sm:px-6 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-3 sm:px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'profile'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>Profile Details</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('picture')}
            className={`py-3 px-3 sm:px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'picture'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Change Photo</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('password')}
            className={`py-3 px-3 sm:px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'password'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Change Password</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          
          {/* TAB 1: PROFILE DETAILS */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              {profileFeedback && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    profileFeedback.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{profileFeedback.message}</span>
                </div>
              )}

              {isEditingProfile ? (
                <form onSubmit={handleProfileSubmit} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Department</label>
                    <input
                      type="text"
                      required
                      value={editDepartment}
                      onChange={(e) => setEditDepartment(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="w-1/2 py-2 rounded-xl font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isUpdatingProfile}
                      className="w-1/2 py-2 rounded-xl font-semibold bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center gap-1.5"
                    >
                      {isUpdatingProfile && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <span>Save Changes</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                      <span className="text-[11px] text-slate-400 block mb-0.5">College ID</span>
                      <span className="font-bold font-mono text-slate-900 dark:text-white">{user.collegeId}</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                      <span className="text-[11px] text-slate-400 block mb-0.5">Assigned Role</span>
                      <span className="font-bold text-slate-900 dark:text-white">{user.role}</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                      <span className="text-[11px] text-slate-400 block mb-0.5">Institutional Email</span>
                      <span className="font-semibold text-slate-900 dark:text-white truncate block">{user.email}</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                      <span className="text-[11px] text-slate-400 block mb-0.5">Enrolled / Joined</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{user.joinedDate}</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-slate-400 block">Department & Faculty Division</span>
                        <span className="font-bold text-slate-900 dark:text-white">{user.department}</span>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Status: ACTIVE
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditName(user.name);
                        setEditDepartment(user.department);
                        setIsEditingProfile(true);
                      }}
                      className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center justify-center gap-1.5"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit Info</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('picture')}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-xs font-semibold text-blue-700 dark:text-blue-300 hover:bg-blue-100 transition flex items-center justify-center gap-1.5"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Change Picture</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CHANGE PROFILE PICTURE */}
          {activeTab === 'picture' && (
            <div className="space-y-4">
              <div className="p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-300 leading-relaxed">
                <span className="font-bold block mb-0.5">Update Your Profile Picture</span>
                Choose an avatar from campus presets, upload an image from your computer, or paste a photo link.
              </div>

              {avatarFeedback && (
                <div
                  className={`p-3.5 rounded-2xl text-xs flex items-center gap-2 ${
                    avatarFeedback.type === 'success'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                  }`}
                >
                  {avatarFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  )}
                  <span>{avatarFeedback.message}</span>
                </div>
              )}

              {/* Live Preview Container */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <img
                  src={selectedAvatarUrl || user.avatarUrl}
                  alt="Selected Preview"
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-blue-500 shadow-sm"
                />
                <div className="flex-1">
                  <span className="font-bold text-xs text-slate-900 dark:text-white block">Active Preview</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">Click &apos;Save Profile Picture&apos; below to apply across all portals.</p>
                </div>
              </div>

              {/* Upload Option */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  1. Upload Image from Device
                </label>
                <div className="relative border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-500 rounded-2xl p-4 text-center cursor-pointer transition bg-slate-50/50 dark:bg-slate-800/40">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="flex flex-col items-center justify-center gap-1.5 text-xs text-slate-500">
                    <Upload className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Click to choose image or drag & drop</span>
                    <span className="text-[10px] text-slate-400">PNG, JPG, or WEBP (Max 2MB)</span>
                  </div>
                </div>
              </div>

              {/* Campus Presets */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  2. Or Select Campus Preset Avatar
                </label>
                <div className="grid grid-cols-4 gap-2.5">
                  {PRESET_AVATARS.map((av) => (
                    <div
                      key={av.id}
                      onClick={() => setSelectedAvatarUrl(av.url)}
                      className={`relative cursor-pointer rounded-2xl p-1.5 border transition text-center group ${
                        selectedAvatarUrl === av.url
                          ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 ring-2 ring-blue-500/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <img
                        src={av.url}
                        alt={av.label}
                        className="w-12 h-12 rounded-xl object-cover mx-auto"
                      />
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-1 truncate">
                        {av.label}
                      </span>
                      {selectedAvatarUrl === av.url && (
                        <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center">
                          <Check className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom URL Option */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  3. Or Enter Web Image Link
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customAvatarInput}
                    onChange={(e) => setCustomAvatarInput(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customAvatarInput.trim()) {
                        setSelectedAvatarUrl(customAvatarInput.trim());
                      }
                    }}
                    className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                  >
                    Load URL
                  </button>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSaveAvatar}
                  disabled={isUpdatingAvatar || selectedAvatarUrl === user.avatarUrl}
                  className="w-full py-2.5 px-4 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.99] transition flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-xs"
                >
                  {isUpdatingAvatar ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Updating Profile Photo...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Save Profile Picture</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: CHANGE PASSWORD */}
          {activeTab === 'password' && (
            <div className="space-y-4">
              <div className="p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-300 leading-relaxed">
                <span className="font-bold block mb-0.5">Change Your Account Password</span>
                Protect your institutional account by creating a secure password with at least 6 characters.
              </div>

              {passFeedback && (
                <div
                  className={`p-3.5 rounded-2xl text-xs flex items-center gap-2 ${
                    passFeedback.type === 'success'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                  }`}
                >
                  {passFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  )}
                  <span>{passFeedback.message}</span>
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-3.5 text-xs">
                {/* Current Password */}
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showCurrent ? 'text' : 'password'}
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password (demo: student123 / teacher123 / principal123)"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    New Password (min 6 characters)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <input
                      type={showNew ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter your new password"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your new password"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isChangingPass}
                    className="w-full py-2.5 px-4 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.99] transition flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 disabled:opacity-70"
                  >
                    {isChangingPass ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Update Password</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between text-xs text-slate-400">
          <span>QIS Autonomous College Security Portal</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-300 cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
