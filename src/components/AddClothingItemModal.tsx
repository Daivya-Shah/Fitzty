import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { X, Upload, Wand2, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface AddClothingItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemAdded: () => void;
}

const AddClothingItemModal: React.FC<AddClothingItemModalProps> = ({
  isOpen,
  onClose,
  onItemAdded
}) => {
  const [uploadMode, setUploadMode] = useState<'normal' | 'ai'>('normal');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [aiGeneratedUrl, setAiGeneratedUrl] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [clothingType, setClothingType] = useState('');
  const [brand, setBrand] = useState('');
  const [customBrand, setCustomBrand] = useState('');
  const [size, setSize] = useState('');
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [descriptionLoading, setDescriptionLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchBrands();
      resetForm();
    }
  }, [isOpen]);

  const fetchBrands = async () => {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('name')
        .order('name');
      
      if (error) throw error;
      setBrands(data.map(b => b.name));
    } catch (error) {
      console.error('Error fetching brands:', error);
    }
  };

  const resetForm = () => {
    setUploadMode('normal');
    setSelectedFile(null);
    setPreviewUrl(null);
    setAiGeneratedUrl(null);
    setDescription('');
    setClothingType('');
    setBrand('');
    setCustomBrand('');
    setSize('');
  };

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

  const generateAIImage = async () => {
    if (!selectedFile) return;

    setAiLoading(true);
    try {
      console.log('Starting AI image generation...');
      
      // Convert image to base64
      const base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(selectedFile);
      });

      console.log('Image converted to base64, calling analyze-clothing function...');
      // Generate AI replica
      const response = await supabase.functions.invoke('analyze-clothing', {
        body: { 
          imageUrl: base64Image,
          action: 'generate_replica'
        }
      });

      console.log('Analyze-clothing response:', response);

      if (response.error) {
        console.error('Analyze-clothing error:', response.error);
        throw new Error(response.error.message);
      }

      if (!response.data || !response.data.imageUrl) {
        console.error('No image URL in response:', response);
        throw new Error('No image URL received from AI function');
      }

      setAiGeneratedUrl(response.data.imageUrl);
      toast.success('AI replica generated successfully!');

    } catch (error: any) {
      console.error('Error generating AI image:', error);
      toast.error(`Failed to generate AI replica: ${error.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  const generateDescription = async () => {
    if (!selectedFile) return;

    setDescriptionLoading(true);
    try {
      console.log('Starting description generation...');
      
      // Convert image to base64
      const base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(selectedFile);
      });

      console.log('Image converted to base64, calling analyze-clothing functions...');
      // Generate description and detect clothing type
      const [descResponse, typeResponse] = await Promise.all([
        supabase.functions.invoke('analyze-clothing', {
          body: { 
            imageUrl: base64Image,
            action: 'analyze_description'
          }
        }),
        supabase.functions.invoke('analyze-clothing', {
          body: { 
            imageUrl: base64Image,
            action: 'detect_type'
          }
        })
      ]);

      console.log('Description response:', descResponse);
      console.log('Type response:', typeResponse);

      if (descResponse.error) {
        console.error('Description generation error:', descResponse.error);
        throw new Error(descResponse.error.message);
      }
      if (typeResponse.error) {
        console.error('Type detection error:', typeResponse.error);
        throw new Error(typeResponse.error.message);
      }

      if (!descResponse.data || !descResponse.data.result) {
        console.error('No description in response:', descResponse);
        throw new Error('No description received from AI function');
      }
      if (!typeResponse.data || !typeResponse.data.result) {
        console.error('No type in response:', typeResponse);
        throw new Error('No clothing type received from AI function');
      }

      setDescription(descResponse.data.result);
      setClothingType(typeResponse.data.result);
      toast.success('Description and clothing type generated!');

    } catch (error: any) {
      console.error('Error generating description:', error);
      toast.error(`Failed to generate description: ${error.message}`);
    } finally {
      setDescriptionLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedFile && !aiGeneratedUrl) {
      toast.error('Please select an image.');
      return;
    }

    if (!description || !clothingType || (!brand && !customBrand) || !size) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      let imageUrl = '';

      if (uploadMode === 'normal' && selectedFile) {
        // Upload original file
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `wardrobe-${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `wardrobe/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, selectedFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      } else if (uploadMode === 'ai' && aiGeneratedUrl) {
        // Convert AI generated image to blob and upload
        const base64Data = aiGeneratedUrl.split(',')[1];
        const binaryData = atob(base64Data);
        const array = new Uint8Array(binaryData.length);
        for (let i = 0; i < binaryData.length; i++) {
          array[i] = binaryData.charCodeAt(i);
        }
        const blob = new Blob([array], { type: 'image/png' });

        const fileName = `wardrobe-ai-${user.id}-${Date.now()}.png`;
        const filePath = `wardrobe/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, blob);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      // Add custom brand if provided
      const finalBrand = customBrand || brand;
      if (customBrand && !brands.includes(customBrand)) {
        await supabase.from('brands').insert({ name: customBrand });
      }

      // Save to wardrobe
      const { error } = await supabase
        .from('wardrobe_items')
        .insert({
          user_id: user.id,
          image_url: imageUrl,
          description,
          clothing_type: clothingType,
          brand: finalBrand,
          size,
          upload_type: uploadMode
        });

      if (error) throw error;

      toast.success('Item added to wardrobe!');
      onItemAdded();
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error saving item:', error);
      toast.error('Failed to save item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const sizeOptions = [
    'XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL',
    '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '36', '38', '40', '42',
    '4', '6', '8', '10', '12', '14', '16', '18', '20'
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Add Clothing Item</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Upload Mode Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Type
            </label>
            <div className="flex gap-4 mb-4">
              <button
                onClick={() => setUploadMode('normal')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                  uploadMode === 'normal' ? 'border-primary bg-primary/10' : 'border-gray-300'
                }`}
              >
                <Upload className="w-4 h-4" />
                Normal Upload
              </button>
              <button
                onClick={() => setUploadMode('ai')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                  uploadMode === 'ai' ? 'border-primary bg-primary/10' : 'border-gray-300'
                }`}
              >
                <Wand2 className="w-4 h-4" />
                AI Upload
              </button>
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {uploadMode === 'ai' ? 'Upload Image for AI Analysis' : 'Upload Clothing Image'}
            </label>
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

          {/* AI Upload Section */}
          {uploadMode === 'ai' && selectedFile && (
            <div>
              <button
                onClick={generateAIImage}
                disabled={aiLoading}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {aiLoading ? 'Generating AI Image...' : 'Generate AI Image'}
              </button>
            </div>
          )}

          {/* Preview Images */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {previewUrl && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Original Image
                </label>
                <div className="w-full h-48 border rounded-lg overflow-hidden">
                  <img 
                    src={previewUrl} 
                    alt="Original" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
            
            {aiGeneratedUrl && uploadMode === 'ai' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AI Generated Image
                </label>
                <div className="w-full h-48 border rounded-lg overflow-hidden">
                  <img 
                    src={aiGeneratedUrl} 
                    alt="AI Generated" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Description Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Description *
              </label>
              <button
                onClick={generateDescription}
                disabled={!selectedFile || descriptionLoading}
                className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
              >
                <FileText className="w-3 h-3" />
                {descriptionLoading ? 'Generating...' : 'Generate Description with AI'}
              </button>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Enter detailed description of the clothing item..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Clothing Type *
              </label>
              <input
                type="text"
                value={clothingType}
                onChange={(e) => setClothingType(e.target.value)}
                placeholder="e.g., shirt, jeans, jacket"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Size *
              </label>
              <select
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              >
                <option value="">Select size...</option>
                {sizeOptions.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Brand Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Brand *
            </label>
            <div className="space-y-2">
              <select
                value={brand}
                onChange={(e) => {
                  setBrand(e.target.value);
                  if (e.target.value !== 'Other') {
                    setCustomBrand('');
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Select brand...</option>
                {brands.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
              
              {brand === 'Other' && (
                <input
                  type="text"
                  value={customBrand}
                  onChange={(e) => setCustomBrand(e.target.value)}
                  placeholder="Enter custom brand name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              )}
            </div>
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
            disabled={loading || !selectedFile || !description || !clothingType || (!brand && !customBrand) || !size}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Uploading to Wardrobe...' : 'Upload to Wardrobe'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddClothingItemModal;