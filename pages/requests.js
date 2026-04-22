import Layout from "../components/Layout";
import useUserInfo from "../hooks/useUserInfo";
import { useEffect, useState } from "react";
import axios from "axios";
import Avatar from "../components/Avatar";
import Link from "next/link";

export default function RequestsPage() {
  const { userInfo } = useUserInfo();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  function fetchRequests() {
    axios.get('/api/requests').then(res => {
      setRequests(res.data);
      setLoading(false);
    });
  }

  async function handleAction(requestId, action) {
    await axios.post('/api/requests', { requestId, action });
    fetchRequests();
  }

  return (
    <Layout>
      <div className="p-4 border-b border-nexusBorder">
        <h1 className="text-xl font-bold">Follow Requests</h1>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="text-center text-nexusLightGray mt-4">Loading requests...</div>
        ) : requests.length === 0 ? (
          <div className="text-center text-nexusLightGray mt-10">No pending follow requests.</div>
        ) : (
          <div className="space-y-4">
            {requests.map(req => (
              <div key={req._id} className="flex items-center justify-between bg-nexusBorder p-4 rounded-2xl">
                <Link href={`/${req.source?.username}`}>
                  <div className="flex items-center space-x-3 cursor-pointer group">
                    <Avatar src={req.source?.image} />
                    <div className="flex flex-col">
                      <span className="font-bold group-hover:underline">{req.source?.name}</span>
                      <span className="text-nexusLightGray text-sm">@{req.source?.username}</span>
                    </div>
                  </div>
                </Link>
                
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleAction(req._id, 'accept')}
                    className="bg-nexusAccent text-white px-4 py-1.5 rounded-full text-sm font-bold hover:bg-opacity-80 transition-all"
                  >
                    Confirm
                  </button>
                  <button 
                    onClick={() => handleAction(req._id, 'reject')}
                    className="bg-nexusDarkGray border border-nexusLightGray text-white px-4 py-1.5 rounded-full text-sm font-bold hover:bg-red-500 hover:border-red-500 transition-all"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
