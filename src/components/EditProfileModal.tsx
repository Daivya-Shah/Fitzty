import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { X, Upload, Camera } from 'lucide-react';
import { toast } from 'sonner';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: {
    first_name?: string;
    last_name?: string;
    username?: string;
    bio?: string;
    avatar_url?: string;
  };
  onProfileUpdate: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  onProfileUpdate
}) => {
  const [firstName, setFirstName] = useState(currentProfile.first_name || '');
  const [lastName, setLastName] = useState(currentProfile.last_name || '');
  const [username, setUsername] = useState(currentProfile.username || '');
  const [bio, setBio] = useState(currentProfile.bio || '');
  const [loading, setLoading] = useState(false);
  const [avatarMode, setAvatarMode] = useState<'upload' | 'ai'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [aiAvatarLoading, setAiAvatarLoading] = useState(false);
  const [bodyDetails, setBodyDetails] = useState({
    gender: '',
    skinTone: '',
    faceShape: '',
    hairType: '',
    hairLength: '',
    hairColor: '',
    eyeShape: '',
    eyeColor: '',
    bodyBuild: '',
    height: '',
    weight: ''
  });

  useEffect(() => {
    if (isOpen) {
      setFirstName(currentProfile.first_name || '');
      setLastName(currentProfile.last_name || '');
      setUsername(currentProfile.username || '');
      setBio(currentProfile.bio || '');
    }
  }, [isOpen, currentProfile]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const generateAIAvatar = async () => {
    setAiAvatarLoading(true);
    try {
      const response = await supabase.functions.invoke('generate-ai-avatar', {
        body: { bodyDetails }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      // Convert the URL to a blob and then to a file for upload
      const imageResponse = await fetch(response.data.imageUrl);
      const imageBlob = await imageResponse.blob();
      const aiFile = new File([imageBlob], 'ai-avatar.png', { type: 'image/png' });
      setSelectedFile(aiFile);
      toast.success('AI avatar generated successfully!');
    } catch (error) {
      console.error('Error generating AI avatar:', error);
      toast.error('Failed to generate AI avatar. Please try again.');
    } finally {
      setAiAvatarLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      let avatarUrl = currentProfile.avatar_url;

      // Upload avatar if selected
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, selectedFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        avatarUrl = publicUrl;
      }

      // Update profile
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          username,
          bio,
          avatar_url: avatarUrl
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Profile updated successfully!');
      onProfileUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const bodyDetailOptions = {
    gender: ['Male', 'Female', 'Non-binary'],
    skinTone: ['Fair', 'Light', 'Medium', 'Olive', 'Brown', 'Dark'],
    faceShape: ['Round', 'Oval', 'Square', 'Heart', 'Long', 'Diamond'],
    hairType: ['Straight', 'Wavy', 'Curly', 'Coily'],
    hairLength: ['Bald', 'Very Short', 'Short', 'Medium', 'Long', 'Very Long'],
    hairColor: ['Black', 'Brown', 'Blonde', 'Red', 'Gray', 'White', 'Other'],
    eyeShape: ['Almond', 'Round', 'Hooded', 'Monolid', 'Upturned', 'Downturned'],
    eyeColor: ['Brown', 'Blue', 'Green', 'Hazel', 'Gray', 'Amber'],
    bodyBuild: ['Slim', 'Athletic', 'Average', 'Heavy', 'Muscular'],
    height: ['Under 5\'0"', '5\'0"-5\'3"', '5\'4"-5\'7"', '5\'8"-5\'11"', '6\'0"-6\'3"', 'Over 6\'3"'],
    weight: ['Under 120 lbs', '120-150 lbs', '151-180 lbs', '181-220 lbs', 'Over 220 lbs']
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Edit Profile</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="Tell others about yourself..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Avatar Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Picture
            </label>
            <div className="flex gap-4 mb-4">
              <button
                onClick={() => setAvatarMode('upload')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                  avatarMode === 'upload' ? 'border-primary bg-primary/10' : 'border-gray-300'
                }`}
              >
                <Upload className="w-4 h-4" />
                Upload Photo
              </button>
              <button
                onClick={() => setAvatarMode('ai')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                  avatarMode === 'ai' ? 'border-primary bg-primary/10' : 'border-gray-300'
                }`}
              >
                <Camera className="w-4 h-4" />
                AI Avatar
              </button>
            </div>

            {avatarMode === 'upload' && (
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
                {selectedFile && (
                  <p className="text-sm text-green-600 mt-2">
                    Selected: {selectedFile.name}
                  </p>
                )}
              </div>
            )}

            {avatarMode === 'ai' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(bodyDetailOptions).map(([key, options]) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </label>
                      <select
                        value={bodyDetails[key as keyof typeof bodyDetails]}
                        onChange={(e) => setBodyDetails(prev => ({ ...prev, [key]: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                      >
                        <option value="">Select...</option>
                        {options.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
                <button
                  onClick={generateAIAvatar}
                  disabled={aiAvatarLoading || Object.values(bodyDetails).some(v => !v)}
                  className="w-full py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {aiAvatarLoading ? 'Generating Avatar...' : 'Generate AI Avatar'}
                </button>
                {selectedFile && avatarMode === 'ai' && (
                  <p className="text-sm text-green-600">
                    AI avatar generated and ready to upload!
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;