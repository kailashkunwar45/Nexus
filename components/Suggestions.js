import { useState, useEffect } from "react";
import axios from "axios";
import Avatar from "./Avatar";
import Link from "next/link";

export default function Suggestions() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    axios.get('/api/suggestions').then(res => {
      setSuggestions(res.data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      setIsSearching(true);
      const delayDebounceFn = setTimeout(() => {
        axios.get(`/api/search?q=${searchQuery}`).then(res => {
          setSearchResults(res.data);
          setIsSearching(false);
        });
      }, 500);
      return () => clearTimeout(delayDebounceFn);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [searchQuery]);

  return (
    <div className="sticky top-0 p-4 h-screen border-l border-nexusBorder hidden md:block overflow-y-auto">
      
      {/* Search Bar */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-nexusLightGray" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input 
          type="text" 
          placeholder="Search Nexus..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-nexusBorder text-white rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-nexusAccent focus:bg-nexusDarkGray transition-all"
        />
        
        {/* Search Results Dropdown */}
        {searchQuery && (
          <div className="absolute mt-2 w-full bg-nexusDarkGray border border-nexusBorder rounded-2xl shadow-2xl overflow-hidden z-50">
            {isSearching ? (
              <div className="p-4 text-center text-nexusLightGray text-sm">Searching...</div>
            ) : searchResults.length > 0 ? (
              searchResults.map(user => (
                <Link href={`/${user.username}`} key={user._id}>
                  <div className="flex items-center space-x-3 p-3 hover:bg-nexusBorder cursor-pointer transition-colors">
                    <Avatar src={user.image} />
                    <div className="flex flex-col overflow-hidden">
                      <span className="font-bold truncate text-sm">{user.name}</span>
                      <span className="text-nexusLightGray text-xs truncate">@{user.username}</span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-4 text-center text-nexusLightGray text-sm">No results found</div>
            )}
          </div>
        )}
      </div>

      {/* Suggestions List */}
      {!loading && suggestions.length > 0 && (
        <div className="bg-nexusBorder rounded-2xl p-4 shadow-xl">
          <h2 className="text-xl font-bold mb-4">Who to follow</h2>
          <div className="space-y-4">
            {suggestions.map(user => (
              <div key={user._id} className="flex items-center justify-between group">
                <Link href={`/${user.username}`}>
                  <div className="flex items-center space-x-3 cursor-pointer">
                    <Avatar src={user.image} />
                    <div className="flex flex-col overflow-hidden">
                      <span className="font-bold truncate group-hover:underline">{user.name}</span>
                      <span className="text-nexusLightGray text-sm truncate">@{user.username}</span>
                    </div>
                  </div>
                </Link>
                <Link href={`/${user.username}`}>
                  <button className="bg-white text-black px-4 py-1 rounded-full text-sm font-bold hover:bg-opacity-90">
                    View
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
