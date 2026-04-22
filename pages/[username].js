import {useRouter} from "next/router";
import Layout from "../components/Layout";
import TopNavLink from "../components/TopNavLink";
import {useEffect, useState} from "react";
import axios from "axios";
import Cover from "../components/Cover";
import Avatar from "../components/Avatar";
import PostContent from "../components/PostContent";
import useUserInfo from "../hooks/useUserInfo";

export default function UserPage() {
  const router = useRouter();
  const {username} = router.query;
  const [profileInfo,setProfileInfo] = useState();
  const [originalUserInfo,setOriginalUserInfo] = useState();
  const {userInfo} = useUserInfo();
  const [posts,setPosts] = useState([]);
  const [postsLikedByMe,setPostsLikedByMe] = useState([]);
  const [editMode,setEditMode] = useState(false);
  const [isFollowing,setIsFollowing] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isRequested, setIsRequested] = useState(false);

  useEffect(() => {
    if (!username) return;
    fetchProfile();
  }, [username]);

  function fetchProfile() {
    axios.get('/api/users?username='+username)
      .then(response => {
        setProfileInfo(response.data.user);
        setOriginalUserInfo(response.data.user);
        setIsFollowing(!!response.data.follow);
        setIsBlocked(!!response.data.isBlocked);
      })
  }

  useEffect(() => {
    if (!profileInfo?._id) return;
    fetchPosts();
  }, [profileInfo]);

  function fetchPosts() {
    axios.get('/api/posts?author='+profileInfo._id)
      .then(response => {
        setPosts(response.data.posts);
        setPostsLikedByMe(response.data.idsLikedByMe);
      })
  }



  function updateUserImage(type, src) {
    setProfileInfo(prev => ({...prev,[type]:src}));
  }

  async function updateProfile() {
    try {
      const {bio,name,username,dob,phone,gender,isPrivate} = profileInfo;
      await axios.put('/api/profile', {
        bio,name,username,dob,phone,gender,isPrivate
      });
      setEditMode(false);
    } catch (e) {
      alert(e.response?.data?.message || 'Error updating profile');
    }
  }

  function cancel() {
    setProfileInfo(originalUserInfo);
    setEditMode(false);
  }

  async function toggleFollow() {
    const res = await axios.post('/api/followers', { destination: profileInfo?._id });
    if (res.data.status === 'followed') {
      setIsFollowing(true);
      setIsRequested(false);
    } else if (res.data.status === 'requested') {
      setIsFollowing(false);
      setIsRequested(true);
    } else if (res.data.status === 'unfollowed' || res.data.status === 'request_cancelled') {
      setIsFollowing(false);
      setIsRequested(false);
    }
  }

  async function toggleBlock() {
    const res = await axios.post('/api/block', { destination: profileInfo?._id });
    setIsBlocked(res.data.blocked);
  }

  const isMyProfile = profileInfo?._id === userInfo?._id;

  return (
    <Layout>
      {!!profileInfo && (
        <div className="pb-10">
          <div className="px-5 pt-2">
            <TopNavLink title={profileInfo.name} />
          </div>
          <Cover src={profileInfo.cover}
                 editable={isMyProfile}
                 onChange={src => updateUserImage('cover',src)} />
          <div className="flex justify-between">
            <div className="ml-5 relative">
              <div className="absolute -top-12 border-4 rounded-full border-nexusDarkGray overflow-hidden">
                <Avatar big src={profileInfo.image} editable={isMyProfile}
                        onChange={src => updateUserImage('image',src)} />
              </div>
            </div>
            <div className="p-2 flex space-x-2">
              {!isMyProfile && (
                <div className="flex space-x-2">
                  {!isBlocked && (
                    <button onClick={toggleFollow}
                            className={(isFollowing ? 'bg-nexusWhite text-black' : isRequested ? 'bg-nexusBorder text-nexusLightGray' : 'bg-nexusAccent text-white')+" py-2 px-5 rounded-full font-bold"}>
                      {isFollowing ? 'Following' : isRequested ? 'Requested' : 'Follow'}
                    </button>
                  )}
                  <button onClick={toggleBlock}
                          className={(isBlocked ? 'bg-red-600 text-white' : 'bg-nexusBorder text-white hover:bg-red-600')+" py-2 px-5 rounded-full font-bold transition-colors"}>
                    {isBlocked ? 'Blocked' : 'Block'}
                  </button>
                </div>
              )}
              {isMyProfile && (
                <div>
                  {!editMode ? (
                    <button
                      onClick={() => setEditMode(true)}
                      className="border border-nexusLightGray text-white py-2 px-5 rounded-full text-sm font-bold">Edit profile</button>
                  ) : (
                    <div className="space-x-2">
                      <button
                        onClick={() => cancel()}
                        className="bg-nexusWhite text-black py-2 px-5 rounded-full text-sm font-bold">Cancel</button>
                      <button
                        onClick={() => updateProfile()}
                        className="bg-nexusAccent text-white py-2 px-5 rounded-full text-sm font-bold">Save</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="px-5 mt-4">
            {!editMode ? (
              <>
                <h1 className="font-bold text-xl leading-5">{profileInfo.name}</h1>
                <h2 className="text-nexusLightGray text-sm">@{profileInfo.username}</h2>
                <div className="text-sm mt-3 mb-3 whitespace-pre-wrap">{profileInfo.bio}</div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-nexusLightGray text-sm">
                  {profileInfo.gender && (
                    <div className="flex items-center">
                      <span className="capitalize">{profileInfo.gender}</span>
                    </div>
                  )}
                  {profileInfo.dob && (
                    <div className="flex items-center">
                      <span>Born {new Date(profileInfo.dob).toLocaleDateString()}</span>
                    </div>
                  )}
                  {profileInfo.phone && (
                    <div className="flex items-center">
                      <span>{profileInfo.phone}</span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-4 max-w-sm">
                <div>
                  <label className="text-nexusLightGray text-xs">Name</label>
                  <input type="text" value={profileInfo.name}
                         onChange={ev => setProfileInfo(prev => ({...prev,name:ev.target.value}))}
                         className="w-full bg-nexusDarkGray border border-nexusBorder p-2 rounded-xl text-white"/>
                </div>
                <div>
                  <label className="text-nexusLightGray text-xs">Username</label>
                  <input type="text" value={profileInfo.username}
                         onChange={ev => setProfileInfo(prev => ({...prev,username:ev.target.value}))}
                         className="w-full bg-nexusDarkGray border border-nexusBorder p-2 rounded-xl text-white"/>
                </div>
                <div>
                  <label className="text-nexusLightGray text-xs">Bio</label>
                  <textarea value={profileInfo.bio}
                            onChange={ev => setProfileInfo(prev => ({...prev,bio:ev.target.value}))}
                            className="w-full bg-nexusDarkGray border border-nexusBorder p-2 rounded-xl text-white h-24"  />
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <div>
                    <label className="text-nexusLightGray text-xs">Phone</label>
                    <input type="text" value={profileInfo.phone || ''}
                           onChange={ev => setProfileInfo(prev => ({...prev,phone:ev.target.value}))}
                           className="w-full bg-nexusDarkGray border border-nexusBorder p-2 rounded-xl text-white"/>
                  </div>
                  <div>
                    <label className="text-nexusLightGray text-xs">Gender</label>
                    <select value={profileInfo.gender || ''}
                            onChange={ev => setProfileInfo(prev => ({...prev,gender:ev.target.value}))}
                            className="w-full bg-nexusDarkGray border border-nexusBorder p-2 rounded-xl text-white">
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between bg-nexusBorder p-3 rounded-xl">
                  <div>
                    <span className="text-sm font-bold text-white block">Private Account</span>
                    <span className="text-xs text-nexusLightGray">Only followers can see your posts.</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={profileInfo.isPrivate || false} onChange={ev => setProfileInfo(prev => ({...prev, isPrivate: ev.target.checked}))} />
                    <div className="w-11 h-6 bg-nexusDarkGray peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-nexusAccent"></div>
                  </label>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6">
            {!isMyProfile && profileInfo.isPrivate && !isFollowing ? (
              <div className="p-10 text-center border-t border-nexusBorder">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-nexusBorder mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-nexusLightGray">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </div>
                <h3 className="font-bold text-xl">This account is private</h3>
                <p className="text-nexusLightGray text-sm mt-1">Follow to see their posts.</p>
              </div>
            ) : posts?.length > 0 ? posts.map(post => (
              <div className="p-5 border-t border-nexusBorder" key={post._id}>
                <PostContent {...post} likedByMe={postsLikedByMe.includes(post._id)} onUpdate={fetchPosts} />
              </div>
            )) : (
              <div className="p-10 text-center text-nexusLightGray border-t border-nexusBorder">No posts yet</div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}