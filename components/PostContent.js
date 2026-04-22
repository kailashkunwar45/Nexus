import Avatar from "./Avatar";
import ReactTimeAgo from "react-time-ago";
import Link from "next/link";
import PostButtons from "./PostButtons";
import { useState } from "react";
import axios from "axios";
import useUserInfo from "../hooks/useUserInfo";

export default function PostContent({
  text: initialText, author, createdAt, _id,
  likesCount, likedByMe, commentsCount,
  images,
  big = false,
  onUpdate
}) {
  const { userInfo } = useUserInfo();
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(initialText);
  const [showOptions, setShowOptions] = useState(false);

  const isMyPost = author?._id === userInfo?._id;

  async function handleDelete() {
    if (confirm("Are you sure you want to delete this post?")) {
      await axios.delete(`/api/posts?id=${_id}`);
      if (onUpdate) onUpdate();
    }
  }

  async function handleUpdate() {
    await axios.put('/api/posts', { id: _id, text });
    setIsEditing(false);
    if (onUpdate) onUpdate();
  }

  function showImages() {
    if (!images?.length) return '';
    return (
      <div className="flex -mx-1 mt-2">
        {images.map(img => (
          <div className="m-1 overflow-hidden rounded-2xl border border-nexusBorder" key={img}>
            <img src={img} alt="" className="max-h-80 object-cover" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex w-full">
        <div>
          {!!author?.image && (
            <Link href={'/' + author?.username}>
              <div className="cursor-pointer">
                <Avatar src={author.image} />
              </div>
            </Link>
          )}
        </div>
        <div className="pl-3 grow">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-1">
              <Link href={'/' + author?.username}>
                <span className="font-bold cursor-pointer hover:underline">{author?.name}</span>
              </Link>
              <Link href={'/' + author?.username}>
                <span className="text-nexusLightGray cursor-pointer text-sm">@{author?.username}</span>
              </Link>
            </div>
            
            {isMyPost && (
              <div className="relative">
                <button onClick={() => setShowOptions(!showOptions)} className="text-nexusLightGray hover:bg-nexusBorder p-1 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                  </svg>
                </button>
                {showOptions && (
                  <div className="absolute right-0 mt-1 w-32 bg-nexusDarkGray border border-nexusBorder rounded-xl shadow-2xl z-10 overflow-hidden">
                    <button onClick={() => { setIsEditing(true); setShowOptions(false); }} className="w-full text-left px-4 py-2 hover:bg-nexusBorder text-sm">Edit</button>
                    <button onClick={handleDelete} className="w-full text-left px-4 py-2 hover:bg-nexusBorder text-sm text-red-500">Delete</button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-1">
            {isEditing ? (
              <div className="mt-2">
                <textarea
                  value={text}
                  onChange={e => setText(e.target.value)}
                  className="w-full bg-nexusDarkGray border border-nexusBorder p-2 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-nexusAccent"
                />
                <div className="flex justify-end space-x-2 mt-2">
                  <button onClick={() => { setIsEditing(false); setText(initialText); }} className="text-sm px-3 py-1 rounded-full border border-nexusBorder">Cancel</button>
                  <button onClick={handleUpdate} className="text-sm px-3 py-1 rounded-full bg-nexusAccent text-white">Save</button>
                </div>
              </div>
            ) : (
              <Link href={`/${author?.username}/status/${_id}`}>
                <div className="w-full cursor-pointer whitespace-pre-wrap">
                  {text}
                  {showImages()}
                </div>
              </Link>
            )}
          </div>

          <div className="mt-3 text-nexusLightGray text-xs flex items-center space-x-2">
            {createdAt && (
              <span>
                {new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {new Date(createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            )}
          </div>

          <PostButtons username={author?.username} id={_id} likesCount={likesCount} likedByMe={likedByMe} commentsCount={commentsCount} />
        </div>
      </div>
    </div>
  );
}