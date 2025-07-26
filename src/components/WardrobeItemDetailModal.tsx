import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { X, Edit, Trash2, Save } from 'lucide-react';
import { toast } from 'sonner';

interface WardrobeItem {
  id: string;
  image_url: string;
  description: string;
  clothing_type: string;
  brand: string;
  size: string;
  upload_type: string;
  created_at: string;
}

interface WardrobeItemDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: WardrobeItem | null;
  onItemUpdated: () => void;
  onItemDeleted: () => void;
}

const WardrobeItemDetailModal: React.FC<WardrobeItemDetailModalProps> = ({
  isOpen,
  onClose,
  item,
  onItemUpdated,
  onItemDeleted
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(item?.description || '');
  const [clothingType, setClothingType] = useState(item?.clothing_type || '');
  const [brand, setBrand] = useState(item?.brand || '');
  const [size, setSize] = useState(item?.size || '');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (item) {
      setDescription(item.description || '');
      setClothingType(item.clothing_type || '');
      setBrand(item.brand || '');
      setSize(item.size || '');
      setIsEditing(false);
    }
  }, [item]);

  const handleSave = async () => {
    if (!item) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('wardrobe_items')
        .update({
          description,
          clothing_type: clothingType,
          brand,
          size
        })
        .eq('id', item.id);

      if (error) throw error;

      toast.success('Item updated successfully!');
      setIsEditing(false);
      onItemUpdated();
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error('Failed to update item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!item) return;
    
    if (!confirm('Are you sure you want to delete this item from your wardrobe?')) {
      return;
    }

    setLoading(true);
    try {
      // Delete the image from storage
      if (item.image_url) {
        const urlPath = new URL(item.image_url).pathname;
        const filePath = urlPath.split('/').slice(-2).join('/'); // Get the last two parts of the path
        
        await supabase.storage
          .from('avatars')
          .remove([filePath]);
      }

      // Delete the record
      const { error } = await supabase
        .from('wardrobe_items')
        .delete()
        .eq('id', item.id);

      if (error) throw error;

      toast.success('Item deleted from wardrobe!');
      onItemDeleted();
      onClose();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !item) return null;

  const sizeOptions = [
    'XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL',
    '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '36', '38', '40', '42',
    '4', '6', '8', '10', '12', '14', '16', '18', '20'
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Wardrobe Item Details</h2>
          <div className="flex items-center gap-2">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 hover:bg-gray-100 rounded-full"
                title="Edit item"
              >
                <Edit className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={handleDelete}
              disabled={loading}
              className="p-2 hover:bg-red-100 rounded-full text-red-600"
              title="Delete item"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Item Image */}
          <div className="flex justify-center">
            <div className="w-64 h-64 border rounded-lg overflow-hidden">
              <img 
                src={item.image_url} 
                alt="Wardrobe item" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Item Details */}
          <div className="space-y-4">
            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              {isEditing ? (
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              ) : (
                <p className="px-4 py-2 bg-gray-50 rounded-lg min-h-[80px]">
                  {description || 'No description available'}
                </p>
              )}
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Clothing Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Clothing Type
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={clothingType}
                    onChange={(e) => setClothingType(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                ) : (
                  <p className="px-4 py-2 bg-gray-50 rounded-lg">
                    {clothingType || 'Not specified'}
                  </p>
                )}
              </div>

              {/* Brand */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                ) : (
                  <p className="px-4 py-2 bg-gray-50 rounded-lg">
                    {brand || 'Not specified'}
                  </p>
                )}
              </div>

              {/* Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Size
                </label>
                {isEditing ? (
                  <select
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Select size...</option>
                    {sizeOptions.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                ) : (
                  <p className="px-4 py-2 bg-gray-50 rounded-lg">
                    {size || 'Not specified'}
                  </p>
                )}
              </div>

              {/* Upload Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Type
                </label>
                <p className="px-4 py-2 bg-gray-50 rounded-lg capitalize">
                  {item.upload_type === 'ai' ? 'AI Generated' : 'Normal Upload'}
                </p>
              </div>
            </div>

            {/* Created Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Added to Wardrobe
              </label>
              <p className="px-4 py-2 bg-gray-50 rounded-lg">
                {new Date(item.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
          {isEditing ? (
            <>
              <button
                onClick={() => {
                  setIsEditing(false);
                  // Reset to original values
                  setDescription(item.description || '');
                  setClothingType(item.clothing_type || '');
                  setBrand(item.brand || '');
                  setSize(item.size || '');
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WardrobeItemDetailModal;