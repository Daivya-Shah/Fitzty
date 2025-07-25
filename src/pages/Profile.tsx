import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import useAuth from "@/hooks/useAuth";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import EditProfileModal from "@/components/EditProfileModal";
import AddClothingItemModal from "@/components/AddClothingItemModal";
import WardrobeItemDetailModal from "@/components/WardrobeItemDetailModal";
import { Edit, UserPlus } from "lucide-react";

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

const Profile = () => {
  const { user, signOut } = useAuth();
  const [tab, setTab] = useState("wardrobe");
  const [showModal, setShowModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [postName, setPostName] = useState("");
  const [posts, setPosts] = useState([]);
  const [fits, setFits] = useState([]);
  const [avatarReady, setAvatarReady] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedFitId, setSelectedFitId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddClothingModal, setShowAddClothingModal] = useState(false);
  const [showWardrobeDetailModal, setShowWardrobeDetailModal] = useState(false);
  const [selectedWardrobeItem, setSelectedWardrobeItem] = useState<WardrobeItem | null>(null);
  const [wardrobe, setWardrobe] = useState<WardrobeItem[]>([]);
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    bio: '',
    avatar_url: '',
    followers_count: 0,
    following_count: 0,
    gender: '',
    skin_tone: '',
    face_shape: '',
    hair_type: '',
    hair_length: '',
    hair_color: '',
    eye_shape: '',
    eye_color: '',
    body_build: '',
    height: '',
    weight: '',
    profile_picture_type: ''
  });

  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (error) throw error;
        
        if (data) {
          setProfileData(data);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfileData();
  }, [user]);

  // Fetch wardrobe items
  useEffect(() => {
    const fetchWardrobe = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('wardrobe_items')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        setWardrobe(data || []);
      } catch (error) {
        console.error('Error fetching wardrobe:', error);
      }
    };

    fetchWardrobe();
  }, [user]);

  const handleProfileUpdate = () => {
    // Refresh profile data after update
    if (user) {
      supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()
        .then(({ data }) => {
          if (data) setProfileData(data);
        });
    }
  };

  const handleWardrobeUpdate = () => {
    // Refresh wardrobe after adding/updating items
    if (user) {
      supabase
        .from('wardrobe_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .then(({ data }) => {
          setWardrobe(data || []);
        });
    }
  };

  const handleWardrobeItemClick = (item: WardrobeItem) => {
    setSelectedWardrobeItem(item);
    setShowWardrobeDetailModal(true);
  };

  const selectedItems = selectedIds.map(id => wardrobe.find(w => w.id === id)).filter(Boolean);
  
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    setAvatarReady(false);
  };
  
  const handleCreateAvatar = () => {
    setAvatarReady(true);
  };
  
  const handleCreateFit = () => {
    if (selectedIds.length < 2) return;
    setFits([
      ...fits,
      {
        id: fits.length + 1,
        name: postName || `Fit ${fits.length + 1}`,
        wardrobeItemIds: selectedIds,
      },
    ]);
    setShowModal(false);
    setSelectedIds([]);
    setPostName("");
    setAvatarReady(false);
  };
  
  const handlePostFit = () => {
    if (!selectedFitId) return;
    const fit = fits.find(f => f.id === selectedFitId);
    if (!fit) return;
    setPosts([
      ...posts,
      {
        id: posts.length + 1,
        name: fit.name,
        wardrobeItemIds: fit.wardrobeItemIds,
      },
    ]);
    setShowPostModal(false);
    setSelectedFitId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        {/* Sidebar */}
        <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 shadow-sm flex flex-col pt-20 z-40">
          {/* Edit Profile Button */}
          <div className="flex flex-col items-center pt-2 pb-4 border-b border-gray-100">
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit Profile
            </button>
          </div>
          {/* Action Buttons */}
          <div className="flex-1 p-4 space-y-3">
            <button
              onClick={() => setShowAddClothingModal(true)}
              className="w-full button-primary py-3 rounded-full text-base font-semibold"
            >
              + Add Clothing Item
            </button>
            <button
              className="w-full button-primary py-3 rounded-full text-base font-semibold"
              onClick={() => setShowModal(true)}
            >
              + Create Fit
            </button>
            <button
              className="w-full button-primary py-3 rounded-full text-base font-semibold"
              onClick={() => setShowPostModal(true)}
              disabled={fits.length === 0}
            >
              + Create Post
            </button>
          </div>

          {/* Bottom Options */}
          <div className="p-4 border-t border-gray-100 space-y-3">
            <button className="w-full flex items-center justify-start px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
              <span className="text-base font-medium">Settings</span>
            </button>
            <button
              onClick={signOut}
              className="w-full flex items-center justify-start px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <span className="text-base font-medium">Log Out</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 ml-64 px-4 pt-20">
        {/* Profile Header */}
        <div className="relative flex flex-col md:flex-row items-center md:items-start gap-8 mb-12">
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-primary shadow-lg bg-white mt-2">
            <Avatar className="w-32 h-32">
              <AvatarImage src={profileData.avatar_url || undefined} alt="Profile" />
              <AvatarFallback className="text-4xl">{profileData.username?.[0]?.toUpperCase() || user?.user_metadata?.username?.[0]?.toUpperCase() || ""}</AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-1 flex flex-col gap-4">
            <div className="text-center md:text-left">
              <div className="flex items-center gap-4 justify-center md:justify-start mb-2">
                <h2 className="text-3xl font-bold font-display">@{profileData.username || user?.user_metadata?.username || "N/A"}</h2>
                <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                  <UserPlus className="w-4 h-4" />
                  Follow
                </button>
              </div>
              {(profileData.first_name || profileData.last_name) && (
                <h3 className="text-xl text-gray-700 mb-2 text-center md:text-left">
                  {profileData.first_name} {profileData.last_name}
                </h3>
              )}
              {profileData.bio && (
                <p className="text-gray-600 mb-4 text-center md:text-left max-w-md">
                  {profileData.bio}
                </p>
              )}
              <div className="flex gap-6 justify-center md:justify-start text-aqua-600 font-semibold text-lg">
                <span className="flex flex-col items-center">
                  <span className="mb-1 text-xl font-bold">{profileData.followers_count}</span>
                  <span className="text-xs font-normal text-gray-500">Followers</span>
                </span>
                <span className="flex flex-col items-center">
                  <span className="mb-1 text-xl font-bold">{profileData.following_count}</span>
                  <span className="text-xs font-normal text-gray-500">Following</span>
                </span>
                <span className="flex flex-col items-center">
                  <span className="mb-1 text-xl font-bold">{posts.length}</span>
                  <span className="text-xs font-normal text-gray-500">Posts</span>
                </span>
                <span className="flex flex-col items-center">
                  <span className="mb-1 text-xl font-bold">{wardrobe.length}</span>
                  <span className="text-xs font-normal text-gray-500">Wardrobe</span>
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* Tabs */}
        <div className="flex justify-center mb-8 gap-2">
          <button
            className={`px-6 py-2 rounded-full font-semibold text-base transition-colors duration-200 ${tab === "wardrobe" ? "bg-primary text-white shadow" : "bg-gray-100 text-primary hover:bg-primary/10"}`}
            onClick={() => setTab("wardrobe")}
          >
            Wardrobe
          </button>
          <button
            className={`px-6 py-2 rounded-full font-semibold text-base transition-colors duration-200 ${tab === "saved" ? "bg-primary text-white shadow" : "bg-gray-100 text-primary hover:bg-primary/10"}`}
            onClick={() => setTab("saved")}
          >
            Fits
          </button>
          <button
            className={`px-6 py-2 rounded-full font-semibold text-base transition-colors duration-200 ${tab === "posts" ? "bg-primary text-white shadow" : "bg-gray-100 text-primary hover:bg-primary/10"}`}
            onClick={() => setTab("posts")}
          >
            Posts
          </button>
        </div>
        {/* Content Grid */}
        {tab === "posts" ? (
          <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="col-span-full flex flex-col items-center justify-center text-gray-400 text-lg font-semibold min-h-[200px]">
              <span>No posts yet.</span>
            </div>
          </div>
        ) : tab === "wardrobe" ? (
          <div className="mb-8">
            {wardrobe.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-gray-400 text-lg font-semibold min-h-[200px]">
                <span>No items in wardrobe yet.</span>
                <span className="text-sm text-gray-500 mt-2">Add your first clothing item to get started!</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {wardrobe.map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => handleWardrobeItemClick(item)}
                    className="rounded-2xl overflow-hidden shadow-elegant bg-white flex items-center justify-center aspect-square w-48 h-48 sm:w-64 sm:h-64 mx-auto p-1 cursor-pointer hover:shadow-lg transition-shadow"
                  >
                    <img src={item.image_url} alt={item.description} className="w-full h-full object-cover rounded-2xl" />
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : tab === "saved" ? (
          <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="col-span-full flex flex-col items-center justify-center text-gray-400 text-lg font-semibold min-h-[200px]">
              <span>Fits will appear here.</span>
            </div>
          </div>
        ) : null}
        </main>
      </div>
      {/* Create Post Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-lg relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold"
              onClick={() => setShowModal(false)}
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-4">Create a Post</h2>
            <div className="grid grid-cols-3 gap-4 mb-4">
              {wardrobe.map(item => (
                <button
                  key={item.id}
                  onClick={() => toggleSelect(item.id)}
                  className={`rounded-xl border-2 ${selectedIds.includes(item.id) ? 'border-primary' : 'border-gray-200'} p-1 transition-all`}
                >
                  <img src={item.image_url} alt={item.description} className="w-full h-20 object-cover rounded-lg" />
                  <div className="text-xs text-center mt-1">{item.clothing_type}</div>
                </button>
              ))}
            </div>
            <button
              className="button-primary w-full py-3 rounded-full text-lg font-bold mb-4"
              disabled={selectedItems.length < 2}
              onClick={handleCreateAvatar}
            >
              Create Avatar
            </button>
            {/* Post Preview (only after Create Avatar) */}
            {avatarReady && (
              <div className="flex items-center gap-4 mb-4">
                <div className="w-20 h-20 rounded-xl border flex items-center justify-center bg-gray-100 text-base text-gray-500 font-semibold">
                  AI Avatar
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {selectedItems.map(item => (
                    <img key={item.id} src={item.image_url} className="w-12 h-12 rounded-xl border" alt={item.description} />
                  ))}
                </div>
              </div>
            )}
            <input
              type="text"
              placeholder="Post name (optional)"
              className="w-full mb-4 px-4 py-2 border rounded-full"
              value={postName}
              onChange={e => setPostName(e.target.value)}
            />
            <button
              className="button-primary w-full py-3 rounded-full text-lg font-bold"
              disabled={!avatarReady || selectedItems.length < 2}
              onClick={handleCreateFit}
            >
              Create Fit
            </button>
          </div>
        </div>
      )}
      {/* Create Post from Fit Modal */}
      {showPostModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-lg relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold"
              onClick={() => setShowPostModal(false)}
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-4">Select a Fit to Post</h2>
            <div className="grid grid-cols-1 gap-4 mb-4 max-h-64 overflow-y-auto">
              {fits.length === 0 ? (
                <div className="text-gray-400 text-center">No fits available. Create a fit first.</div>
              ) : (
                fits.map(fit => {
                  const otherItems = fit.wardrobeItemIds.map((wid) => wardrobe.find((w) => w.id === wid)).filter(Boolean);
                  return (
                    <button
                      key={fit.id}
                      onClick={() => setSelectedFitId(fit.id)}
                      className={`w-full flex items-center gap-4 p-3 rounded-xl border-2 transition-all ${selectedFitId === fit.id ? 'border-primary bg-primary/10' : 'border-gray-200 bg-white'}`}
                    >
                      <div className="w-16 h-16 rounded-xl border flex items-center justify-center bg-gray-100 text-base text-gray-500 font-semibold">
                        AI Avatar
                      </div>
                      <div className="flex gap-2">
                        {otherItems.map((item) => (
                          <img key={item.id} src={item.image_url} className="w-10 h-10 rounded-xl border" alt={item.description} />
                        ))}
                      </div>
                      <div className="ml-auto font-semibold">{fit.name}</div>
                    </button>
                  );
                })
              )}
            </div>
            <button
              className="button-primary w-full py-3 rounded-full text-lg font-bold"
              disabled={!selectedFitId}
              onClick={handlePostFit}
            >
              Post Fit
            </button>
          </div>
        </div>
      )}
      
      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        currentProfile={profileData}
        onProfileUpdate={handleProfileUpdate}
      />

      {/* Add Clothing Item Modal */}
      <AddClothingItemModal
        isOpen={showAddClothingModal}
        onClose={() => setShowAddClothingModal(false)}
        onItemAdded={handleWardrobeUpdate}
      />

      {/* Wardrobe Item Detail Modal */}
      <WardrobeItemDetailModal
        isOpen={showWardrobeDetailModal}
        onClose={() => setShowWardrobeDetailModal(false)}
        item={selectedWardrobeItem}
        onItemUpdated={handleWardrobeUpdate}
        onItemDeleted={handleWardrobeUpdate}
      />
    </div>
  );
};

export default Profile;