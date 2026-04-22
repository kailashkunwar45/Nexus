import { useState, useEffect } from "react";
import axios from "axios";
import Avatar from "./Avatar";
import Link from "next/link";

export default function Suggestions() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/suggestions').then(res => {
      setSuggestions(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return null;
  if (suggestions.length === 0) return null;

  return (
    <div className="sticky top-0 p-4 h-screen border-l border-nexusBorder hidden md:block overflow-y-auto">
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
    </div>
  );
}
