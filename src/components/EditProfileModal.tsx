import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { X, Upload, Camera, RotateCcw } from 'lucide-react';
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
    gender?: string;
    skin_tone?: string;
    face_shape?: string;
    hair_type?: string;
    hair_length?: string;
    hair_color?: string;
    eye_shape?: string;
    eye_color?: string;
    body_build?: string;
    height?: string;
    weight?: string;
    profile_picture_type?: string;
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
  const [avatarMode, setAvatarMode] = useState<'upload' | 'ai'>(currentProfile.profile_picture_type as 'upload' | 'ai' || 'upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [aiAvatarLoading, setAiAvatarLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentProfile.avatar_url || null);
  const [bodyDetails, setBodyDetails] = useState({
    gender: currentProfile.gender || '',
    skinTone: currentProfile.skin_tone || '',
    faceShape: currentProfile.face_shape || '',
    hairType: currentProfile.hair_type || '',
    hairLength: currentProfile.hair_length || '',
    hairColor: currentProfile.hair_color || '',
    eyeShape: currentProfile.eye_shape || '',
    eyeColor: currentProfile.eye_color || '',
    bodyBuild: currentProfile.body_build || '',
    height: currentProfile.height || '',
    weight: currentProfile.weight || ''
  });

  useEffect(() => {
    if (isOpen) {
      setFirstName(currentProfile.first_name || '');
      setLastName(currentProfile.last_name || '');
      setUsername(currentProfile.username || '');
      setBio(currentProfile.bio || '');
      setPreviewUrl(currentProfile.avatar_url || null);
      setAvatarMode(currentProfile.profile_picture_type as 'upload' | 'ai' || 'upload');
      setBodyDetails({
        gender: currentProfile.gender || '',
        skinTone: currentProfile.skin_tone || '',
        faceShape: currentProfile.face_shape || '',
        hairType: currentProfile.hair_type || '',
        hairLength: currentProfile.hair_length || '',
        hairColor: currentProfile.hair_color || '',
        eyeShape: currentProfile.eye_shape || '',
        eyeColor: currentProfile.eye_color || '',
        bodyBuild: currentProfile.body_build || '',
        height: currentProfile.height || '',
        weight: currentProfile.weight || ''
      });
    }
  }, [isOpen, currentProfile]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
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

      // Convert the data URL to a blob and then to a file for upload
      const base64Data = response.data.imageUrl.split(',')[1];
      const binaryData = atob(base64Data);
      const array = new Uint8Array(binaryData.length);
      for (let i = 0; i < binaryData.length; i++) {
        array[i] = binaryData.charCodeAt(i);
      }
      const blob = new Blob([array], { type: 'image/png' });
      const aiFile = new File([blob], 'ai-avatar.png', { type: 'image/png' });
      
      setSelectedFile(aiFile);
      setPreviewUrl(response.data.imageUrl);
      toast.success('AI avatar generated successfully!');
    } catch (error) {
      console.error('Error generating AI avatar:', error);
      toast.error('Failed to generate AI avatar. Please try again.');
    } finally {
      setAiAvatarLoading(false);
    }
  };

  const handleSave = async () => {
    // Check if body details are complete
    const incompleteFields = Object.entries(bodyDetails).filter(([_, value]) => !value);
    if (incompleteFields.length > 0) {
      toast.error('Please complete all body details fields before saving.');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      let avatarUrl = currentProfile.avatar_url;

      // Check if body details changed and user had AI avatar
      const bodyDetailsChanged = Object.entries(bodyDetails).some(
        ([key, value]) => currentProfile[key as keyof typeof currentProfile] !== value
      );

      // If body details changed and user had AI avatar, regenerate it
      if (bodyDetailsChanged && currentProfile.profile_picture_type === 'ai' && avatarMode === 'ai') {
        await generateAIAvatar();
      }

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

      // Update profile with all new fields
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          username,
          bio,
          avatar_url: avatarUrl,
          profile_picture_type: avatarMode,
          gender: bodyDetails.gender,
          skin_tone: bodyDetails.skinTone,
          face_shape: bodyDetails.faceShape,
          hair_type: bodyDetails.hairType,
          hair_length: bodyDetails.hairLength,
          hair_color: bodyDetails.hairColor,
          eye_shape: bodyDetails.eyeShape,
          eye_color: bodyDetails.eyeColor,
          body_build: bodyDetails.bodyBuild,
          height: bodyDetails.height,
          weight: bodyDetails.weight
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
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
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

          {/* Body Details Section - Mandatory */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Body Details (Required)</h3>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(bodyDetailOptions).map(([key, options]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()} *
                  </label>
                  <select
                    value={bodyDetails[key as keyof typeof bodyDetails]}
                    onChange={(e) => setBodyDetails(prev => ({ ...prev, [key]: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                    required
                  >
                    <option value="">Select...</option>
                    {options.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Avatar Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h3>
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
                <div className="flex gap-4">
                  <button
                    onClick={generateAIAvatar}
                    disabled={aiAvatarLoading || Object.values(bodyDetails).some(v => !v)}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {aiAvatarLoading ? 'Generating Avatar...' : 'Generate AI Avatar'}
                  </button>
                  {previewUrl && avatarMode === 'ai' && (
                    <button
                      onClick={generateAIAvatar}
                      disabled={aiAvatarLoading || Object.values(bodyDetails).some(v => !v)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Regenerate AI Avatar
                    </button>
                  )}
                </div>
                {Object.values(bodyDetails).some(v => !v) && (
                  <p className="text-sm text-amber-600">
                    Please complete all body details to generate an AI avatar.
                  </p>
                )}
              </div>
            )}

            {/* Preview */}
            {previewUrl && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preview
                </label>
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200">
                  <img 
                    src={previewUrl} 
                    alt="Profile preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
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
            disabled={loading || Object.values(bodyDetails).some(v => !v)}
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