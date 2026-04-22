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
      })
  }

  useEffect(() => {
    if (!profileInfo?._id) return;
    fetchPosts();
    checkBlock();
  }, [profileInfo]);

  function fetchPosts() {
    axios.get('/api/posts?author='+profileInfo._id)
      .then(response => {
        setPosts(response.data.posts);
        setPostsLikedByMe(response.data.idsLikedByMe);
      })
  }

  function checkBlock() {
    axios.get('/api/block').then(res => {
      const blocked = res.data.some(b => b.destination === profileInfo._id);
      setIsBlocked(blocked);
    });
  }

  function updateUserImage(type, src) {
    setProfileInfo(prev => ({...prev,[type]:src}));
  }

  async function updateProfile() {
    try {
      const {bio,name,username,dob,phone,gender} = profileInfo;
      await axios.put('/api/profile', {
        bio,name,username,dob,phone,gender
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

  function toggleFollow() {
    setIsFollowing(prev => !prev);
    axios.post('/api/followers', { destination: profileInfo?._id });
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
                <>
                  <button onClick={toggleBlock}
                          className={(isBlocked ? 'bg-red-500 text-white' : 'border border-nexusLightGray text-white')+" py-2 px-5 rounded-full text-sm font-bold"}>
                    {isBlocked ? 'Blocked' : 'Block'}
                  </button>
                  {!isBlocked && (
                    <button onClick={toggleFollow}
                            className={(isFollowing ? 'bg-white text-black' : 'bg-nexusAccent text-white')+" py-2 px-5 rounded-full text-sm font-bold"}>
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>
                  )}
                </>
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
                <div className="grid grid-cols-2 gap-2">
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
              </div>
            )}
          </div>

          <div className="mt-6">
            {posts?.length > 0 ? posts.map(post => (
              <div className="p-5 border-t border-nexusBorder" key={post._id}>
                <PostContent {...post} likedByMe={postsLikedByMe.includes(post._id)} onUpdate={fetchPosts} />
              </div>
            )) : (
              <div className="p-10 text-center text-nexusLightGray">No posts yet</div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}