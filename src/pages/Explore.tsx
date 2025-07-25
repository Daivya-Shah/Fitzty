import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import useAuth from "@/hooks/useAuth";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

// TODO: Replace with real DB fetch
const mockUsers = [
  { id: 1, username: "alice", avatar_url: "" },
  { id: 2, username: "bob", avatar_url: "" },
  { id: 3, username: "charlie", avatar_url: "" },
  { id: 4, username: "diana", avatar_url: "" },
];

const Explore = () => {
  const { user, signOut } = useAuth();
  const [query, setQuery] = useState("");
  const filteredUsers = mockUsers.filter(user =>
    user.username.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        {/* Sidebar */}
        <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 shadow-sm flex flex-col pt-20 z-40">
          {/* Profile Section */}
          <div className="flex flex-col items-center pt-2 pb-6 border-b border-gray-100">
            <a href="/profile" aria-label="Profile">
              <Avatar className="w-20 h-20 mb-3 hover:scale-105 transition-transform">
                <AvatarImage src={user?.user_metadata?.avatar_url || undefined} alt="Profile" />
                <AvatarFallback className="text-2xl">{user?.user_metadata?.username?.[0]?.toUpperCase() || ""}</AvatarFallback>
              </Avatar>
            </a>
            <h3 className="font-semibold text-lg">@{user?.user_metadata?.username || "N/A"}</h3>
          </div>
          {/* Bottom Options */}
          <div className="p-4 border-t border-gray-100 space-y-3 mt-auto">
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
          <h1 className="text-3xl font-bold mb-6">Explore Accounts</h1>
          <input
            type="text"
            placeholder="Search users..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full max-w-md px-4 py-2 border rounded-full mb-8"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredUsers.length === 0 ? (
              <div className="col-span-full text-gray-400 text-lg">No users found.</div>
            ) : (
              filteredUsers.map(user => (
                <div key={user.id} className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-500">
                    {user.username[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-lg">@{user.username}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Explore; 