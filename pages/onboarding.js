import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import useUserInfo from "../hooks/useUserInfo";
import axios from "axios";

export default function OnboardingPage() {
  const { userInfo, status, setUserInfo } = useUserInfo();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [dob, setDob] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && userInfo?.onboarded) {
      router.push("/");
    }
    if (userInfo?.username) setUsername(userInfo.username);
  }, [status, userInfo]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await axios.put("/api/profile", {
        username,
        dob,
        phone,
        gender,
        onboarded: true,
      });
      // Update local state
      setUserInfo((prev) => ({ ...prev, username, dob, phone, gender, onboarded: true }));
      router.push("/");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Username might be taken.");
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading") return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-nexusDarkGray p-4 text-white">
      <div className="mb-8 text-center">
        <img src="/logo.png" alt="Nexus Logo" className="h-16 w-16 mx-auto mb-4" />
        <h1 className="text-3xl font-bold">Welcome to Nexus</h1>
        <p className="text-nexusLightGray mt-2">Let&apos;s set up your profile</p>
      </div>

      <div className="bg-nexusBorder p-8 rounded-2xl shadow-xl w-full max-w-md">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-nexusLightGray">Choose Username</label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-nexusLightGray">@</span>
              <input
                type="text"
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-nexusDarkGray text-white pl-8 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexusAccent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-nexusLightGray">Date of Birth</label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full bg-nexusDarkGray text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexusAccent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-nexusLightGray">Phone Number</label>
            <input
              type="tel"
              placeholder="+1234567890"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-nexusDarkGray text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexusAccent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-nexusLightGray">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full bg-nexusDarkGray text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexusAccent appearance-none"
              required
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
          </div>

          {error && <div className="text-red-500 text-sm text-center">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="bg-nexusAccent hover:bg-opacity-80 text-white font-bold py-3 rounded-xl transition-all shadow-lg mt-4 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Finish Set Up"}
          </button>
        </form>
      </div>
    </div>
  );
}
