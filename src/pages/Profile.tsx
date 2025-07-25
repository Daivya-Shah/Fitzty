import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import fitztyProfile from "@/assets/fitzty-hero.jpg";
import fitztyWardrobe from "@/assets/fitzty.jpg";
import useAuth from "@/hooks/useAuth";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const wardrobe = [
  { id: 1, name: "Blue Jeans", image: fitztyWardrobe, type: "pants" },
  { id: 2, name: "White Tee", image: fitztyProfile, type: "top" },
  { id: 3, name: "Sneakers", image: fitztyWardrobe, type: "shoes" },
  { id: 4, name: "Yellow Hoodie", image: fitztyProfile, type: "outerwear" },
  { id: 5, name: "Bucket Hat", image: fitztyWardrobe, type: "accessory" },
];

const Profile = () => {
  const { user, signOut } = useAuth();
  const [tab, setTab] = useState("wardrobe");
  const [showModal, setShowModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [postName, setPostName] = useState("");
  const [posts, setPosts] = useState([]); // No dummy posts
  const [fits, setFits] = useState([]); // No dummy fits
  const [avatarReady, setAvatarReady] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedFitId, setSelectedFitId] = useState(null);
  const selectedItems = selectedIds.map(id => wardrobe.find(w => w.id === id)).filter(Boolean);
  const toggleSelect = (id) => {
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
    <div className="min-h-screen bg-gray-50 pb-24">
      <Navbar />
      <main className="container mx-auto px-4 py-12 mt-8 pt-20">
        {/* Profile Header */}
        <div className="relative flex flex-col md:flex-row items-center md:items-end gap-8 mb-12">
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-primary shadow-lg bg-white">
            <Avatar className="w-32 h-32">
              <AvatarImage src={user?.user_metadata?.avatar_url || undefined} alt="Profile" />
              <AvatarFallback className="text-4xl">{user?.user_metadata?.username?.[0]?.toUpperCase() || ""}</AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-1 flex flex-col md:flex-row md:items-end gap-6 md:gap-12">
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-bold font-display mb-1">@{user?.user_metadata?.username || "N/A"}</h2>
              <div className="flex gap-6 justify-center md:justify-start text-aqua-600 font-semibold text-lg">
                <span className="flex flex-col items-center">
                  <span className="mb-1 text-xl font-bold">0</span>
                  <span className="text-xs font-normal text-gray-500">Followers</span>
                </span>
                <span className="flex flex-col items-center">
                  <span className="mb-1 text-xl font-bold">0</span>
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
            <div className="flex justify-center md:justify-end">
              <button
                onClick={signOut}
                className="px-6 py-2 rounded-full font-semibold text-base transition-colors duration-200 bg-red-100 text-red-600 hover:bg-red-200"
              >
                Log Out
              </button>
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {wardrobe.map((item) => (
                <div key={item.id} className="rounded-2xl overflow-hidden shadow-elegant bg-white flex flex-col items-center p-4">
                  <img src={item.image} alt={item.name} className="w-full h-32 object-cover rounded-xl mb-2" />
                  <div className="text-base font-semibold text-gray-800">{item.name}</div>
                  <div className="text-xs text-gray-400 capitalize">{item.type}</div>
                </div>
              ))}
            </div>
          </div>
        ) : tab === "saved" ? (
          <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="col-span-full flex flex-col items-center justify-center text-gray-400 text-lg font-semibold min-h-[200px]">
              <span>Fits will appear here.</span>
            </div>
          </div>
        ) : null}
      </main>
      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 py-4 flex justify-center shadow-lg">
        <button
          className="button-primary px-8 py-3 rounded-full text-lg font-bold shadow-md hover:scale-105 transition-transform mr-4"
          onClick={() => setShowModal(true)}
        >
          + Create Fit
        </button>
        <button
          className="button-primary px-8 py-3 rounded-full text-lg font-bold shadow-md hover:scale-105 transition-transform"
          onClick={() => setShowPostModal(true)}
          disabled={fits.length === 0}
        >
          + Create Post
        </button>
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
                  <img src={item.image} alt={item.name} className="w-full h-20 object-cover rounded-lg" />
                  <div className="text-xs text-center mt-1">{item.name}</div>
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
                    <img key={item.id} src={item.image} className="w-12 h-12 rounded-xl border" alt={item.name} />
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
                        {otherItems.map((item, idx) => (
                          <img key={item.id} src={item.image} className="w-10 h-10 rounded-xl border" alt={item.name} />
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
    </div>
  );
};

export default Profile; 