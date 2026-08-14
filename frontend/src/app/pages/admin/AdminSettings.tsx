import { motion } from "motion/react";
import { useState } from "react";
import { User, Lock, Shield, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "sonner";
import { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { userService } from "../../../services/userService";
import { supabase } from "../../../lib/supabase";
import { Camera, Loader2 } from "lucide-react";

export function AdminSettings() {
  const { userId } = useAuth();
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    role: "",
    memberId: "",
    position: "",
    profileKey: ""
  });

  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  const fetchUserProfile = async () => {
    setIsLoading(true);
    try {
      const data = await userService.getUserById(userId!);
      const member = data.members;
      setProfileData({
        name: member?.member_name || data.user_name,
        email: member?.member_email || "",
        role: data.user_role,
        memberId: member?.member_id || "",
        position: member?.member_postion || "",
        profileKey: member?.member_profile_picture_key || ""
      });
      if (member?.member_profile_picture_key) {
        const { data: urlData } = supabase.storage.from('profile_pictures').getPublicUrl(member.member_profile_picture_key);
        setProfilePreview(urlData.publicUrl);
      }
    } catch (error) {
      toast.error("Failed to fetch profile data");
    } finally {
      setIsLoading(false);
    }
  };

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileFile(file);
      setProfilePreview(URL.createObjectURL(file));
    }
  };

  const uploadProfilePhoto = async (file: File) => {
    const ext = (file.name.split('.').pop() || 'png').toLowerCase();
    const nameSlug = profileData.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || 'user';
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const fileName = `${nameSlug}-profile-${uniqueId}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('profile_pictures')
      .upload(fileName, file, {
        upsert: false,
        contentType: file.type
      });

    if (uploadError) throw uploadError;
    return fileName;
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    
    setIsUploading(true);
    try {
      let newProfileKey = profileData.profileKey;
      if (profileFile) {
        newProfileKey = await uploadProfilePhoto(profileFile);
      }

      // Update users table
      const userPayload = {
        user_name: profileData.name,
      };
      await userService.updateUser(userId, userPayload);

      // Update members table for profile picture
      if (profileData.memberId) {
        const { error: memberError } = await supabase
          .from('members')
          .update({ member_profile_picture_key: newProfileKey })
          .eq('member_id', profileData.memberId);
        
        if (memberError) throw memberError;
      }

      toast.success("Profile updated successfully!");
      fetchUserProfile();
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsUploading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
      await userService.updatePassword(userId, {
        oldPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success("Password changed successfully!");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      toast.error(error.message || "Failed to change password");
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl text-gray-900 dark:text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400" style={{ fontFamily: 'Open Sans, sans-serif' }}>
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-900 to-purple-700">
                <User className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl text-gray-900 dark:text-white" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                Profile Settings
              </h2>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
              </div>
            ) : (
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="flex flex-col items-center gap-4 mb-4">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-purple-500/20 bg-gray-100 dark:bg-gray-800">
                      {profilePreview ? (
                        <img src={profilePreview} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <User className="w-12 h-12" />
                        </div>
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 p-2 rounded-full bg-gradient-to-br from-blue-900 to-purple-700 text-white shadow-lg cursor-pointer hover:scale-110 transition-all group-hover:ring-4 group-hover:ring-purple-500/20">
                      <Camera className="w-5 h-5" />
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">Change Profile Photo</p>
                </div>

                <div>
                <label htmlFor="name" className="block text-sm text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  style={{ fontFamily: 'Open Sans, sans-serif' }}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  style={{ fontFamily: 'Open Sans, sans-serif' }}
                />
              </div>



              <button
                type="submit"
                className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-blue-900 to-purple-700 text-white hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}
              >
                {isUploading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </div>
                ) : (
                  "Save Profile"
                )}
              </button>
            </form>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-900 to-purple-700">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl text-gray-900 dark:text-white" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                Change Password
              </h2>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    id="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all pr-12"
                    style={{ fontFamily: 'Open Sans, sans-serif' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-500 transition-colors"
                  >
                    {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    id="newPassword"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all pr-12"
                    style={{ fontFamily: 'Open Sans, sans-serif' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-500 transition-colors"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all pr-12"
                    style={{ fontFamily: 'Open Sans, sans-serif' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-500 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-blue-900 to-purple-700 text-white hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}
              >
                Update Password
              </button>
            </form>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-900 to-purple-700">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl text-gray-900 dark:text-white" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
              Security & Permissions
            </h2>
          </div>

          <div className="flex flex-col items-center justify-center py-12 px-4 text-center border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-3xl">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-purple-500 blur-2xl opacity-20 animate-pulse"></div>
              <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-900 to-purple-700 flex items-center justify-center shadow-2xl shadow-purple-500/20">
                <Shield className="w-10 h-10 text-white" />
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <h3 className="text-3xl dark:text-white" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800 }}>
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent italic">Don't worry!</span>
              </h3>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-4" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 500 }}>
                You ain't getting hacked homie :)
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 text-purple-500 text-sm font-bold uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping"></span>
              Feature Coming Soon
            </div>
          </div>
          {/* 
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-sm text-gray-900 dark:text-white mb-1" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                    Two-Factor Authentication
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                    Add an extra layer of security to your account
                  </p>
                </div>
                <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-900 to-purple-700 text-white hover:shadow-lg transition-all text-sm" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                  Enable
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-sm text-gray-900 dark:text-white mb-1" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                    Login Activity
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                    View recent login history and active sessions
                  </p>
                </div>
                <button className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all text-sm" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                  View
                </button>
              </div>
            </div>
          </div>
          */}
        </motion.div>
      </div>
    </>
  );
}
