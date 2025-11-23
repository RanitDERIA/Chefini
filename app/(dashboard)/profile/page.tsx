'use client';

import { useEffect, useState } from 'react';
import { User, Lock, Mail, ImageIcon, Save, Key } from 'lucide-react';
import { useSession } from 'next-auth/react';
import ChefiniButton from '@/components/ui/ChefiniButton';
import Toast from '@/components/ui/Toast';
import { useToast } from '@/app/hooks/useToast';
import { avatarOptions, getAvatarDisplay } from '@/lib/avatars';

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const { toasts, showToast, removeToast } = useToast();

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    avatar: '',
    image: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile');
      const data = await res.json();
      setProfile(data.user);
      setSelectedAvatar(data.user.avatar || '');
    } catch (error) {
      showToast('Failed to load profile', 'error');
    }
  };

  const updateProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profile.name,
          avatar: selectedAvatar
        })
      });

      if (!res.ok) throw new Error('Failed to update');

      const data = await res.json();
      setProfile(data.user);

      await update({
        ...session,
        user: {
          ...session?.user,
          name: data.user.name,
          avatar: data.user.avatar
        }
      });

      showToast('Profile updated successfully!', 'success');
    } catch (error) {
      showToast('Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    setPasswordLoading(true);

    try {
      const res = await fetch('/api/profile/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to change password');

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      showToast('Password changed successfully!', 'success');
    } catch (error: any) {
      showToast(error.message, 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  const avatarDisplay = getAvatarDisplay({
    avatar: selectedAvatar,
    image: profile.image,
    name: profile.name
  });

  const isGoogleUser = !!profile.image && !profile.avatar;

  return (
    <div>
      {/* Toast Notifications */}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}

      {/* Header */}
      <div className="mb-8 bg-black border-4 border-chefini-yellow p-6">
        <h1 className="text-4xl font-black flex items-center gap-3">
          <User className="text-chefini-yellow" size={40} />
          MY PROFILE
        </h1>
        <p className="text-gray-400 mt-2">Manage your account settings and preferences</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Left — Profile Preview */}
        <div className="lg:col-span-1">
          <div className="bg-black border-4 border-chefini-yellow p-6 sticky top-6">
            <h2 className="text-2xl font-black mb-6 text-center">PROFILE PREVIEW</h2>

            <div className="flex flex-col items-center">
              <div className="w-32 h-32 mb-4 border-4 border-white shadow-brutal-lg flex items-center justify-center text-6xl bg-white">
                {avatarDisplay.type === 'emoji' && avatarDisplay.value}

                {avatarDisplay.type === 'image' && (
                  <img
                    src={avatarDisplay.value}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                )}

                {avatarDisplay.type === 'initial' && (
                  <span className="text-black font-black">{avatarDisplay.value}</span>
                )}
              </div>

              <h3 className="text-2xl font-black text-chefini-yellow mb-2">{profile.name}</h3>
              <p className="text-gray-400 text-sm mb-4">{profile.email}</p>

              {isGoogleUser && (
                <div className="px-3 py-1 bg-blue-500 text-white text-xs font-bold border-2 border-black">
                  Google Account
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right — Settings */}
        <div className="lg:col-span-2 space-y-6">

          {/* Basic Info */}
          <div className="bg-white border-4 border-black shadow-brutal p-6 text-black">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
              <User size={24} />
              BASIC INFORMATION
            </h2>

            <div className="space-y-4">
              
              <div>
                <label className="block font-bold mb-2">NAME</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-black focus:ring-2 focus:ring-chefini-yellow"
                />
              </div>

              <div>
                <label className="block font-bold mb-2">EMAIL</label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full px-4 py-3 border-2 border-gray-400 bg-gray-100 text-gray-600"
                />
                <p className="text-xs text-gray-600 mt-1">Email cannot be changed</p>
              </div>

              <ChefiniButton
                onClick={updateProfile}
                icon={Save}
                disabled={loading}
                className="w-full justify-center"
              >
                {loading ? 'SAVING...' : 'SAVE CHANGES'}
              </ChefiniButton>
            </div>
          </div>

          {/* Avatar Selection */}
          <div className="bg-white border-4 border-black shadow-brutal p-6 text-black">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
              <ImageIcon size={24} />
              CHOOSE AVATAR
            </h2>

            <div className="space-y-4">
              
              {/* Google Profile Image Option */}
              {profile.image && (
                <div>
                  <p className="font-bold mb-2">GOOGLE PROFILE IMAGE</p>
                  <button
                    onClick={() => setSelectedAvatar('')}
                    className={`p-4 border-4 transition-all ${
                      selectedAvatar === ''
                        ? 'border-chefini-yellow bg-chefini-yellow bg-opacity-20'
                        : 'border-black bg-white hover:border-chefini-yellow'
                    }`}
                  >
                    <img
                      src={profile.image}
                      alt="Google profile"
                      className="w-16 h-16 object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                </div>
              )}

              {/* Name Initial Option */}
              <div>
                <p className="font-bold mb-2">NAME INITIAL</p>
                <button
                  onClick={() => setSelectedAvatar('initial')}
                  className={`p-4 border-4 transition-all ${
                    selectedAvatar === 'initial'
                      ? 'border-chefini-yellow bg-chefini-yellow'
                      : 'border-black bg-white hover:border-chefini-yellow'
                  }`}
                >
                  <div className="w-16 h-16 flex items-center justify-center text-4xl font-black">
                    {profile.name?.[0]?.toUpperCase() || 'C'}
                  </div>
                </button>
              </div>

              {/* Emoji Avatars */}
              <div>
                <p className="font-bold mb-2">EMOJI AVATARS</p>
                <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                  {avatarOptions.map(avatar => (
                    <button
                      key={avatar.id}
                      onClick={() => setSelectedAvatar(avatar.id)}
                      className={`p-3 border-4 transition-all hover:scale-110 ${
                        selectedAvatar === avatar.id
                          ? 'border-chefini-yellow bg-chefini-yellow'
                          : 'border-black bg-white hover:border-chefini-yellow'
                      }`}
                      title={avatar.label}
                    >
                      <span className="text-3xl">{avatar.emoji}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Change Password */}
          {!isGoogleUser && (
            <div className="bg-white border-4 border-black shadow-brutal p-6 text-black">
              <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
                <Lock size={24} />
                CHANGE PASSWORD
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block font-bold mb-2">CURRENT PASSWORD</label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-black focus:ring-2 focus:ring-chefini-yellow"
                    placeholder="Enter current password"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-2">NEW PASSWORD</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-black focus:ring-2 focus:ring-chefini-yellow"
                    placeholder="Min. 6 characters"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-2">CONFIRM NEW PASSWORD</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-black focus:ring-2 focus:ring-chefini-yellow"
                    placeholder="Re-enter new password"
                  />
                </div>

                <ChefiniButton
                  onClick={changePassword}
                  icon={Key}
                  disabled={
                    passwordLoading ||
                    !passwordForm.currentPassword ||
                    !passwordForm.newPassword
                  }
                  className="w-full justify-center"
                  variant="secondary"
                >
                  {passwordLoading ? 'CHANGING...' : 'CHANGE PASSWORD'}
                </ChefiniButton>
              </div>
            </div>
          )}

          {/* Google User Info */}
          {isGoogleUser && (
            <div className="bg-blue-100 border-4 border-blue-500 p-6 text-black">
              <h2 className="text-xl font-black mb-3 flex items-center gap-2">
                <Lock size={24} />
                GOOGLE ACCOUNT
              </h2>
              <p className="text-sm">
                You signed in using Google. Password management is handled by your Google
                account. You cannot change your password here.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
