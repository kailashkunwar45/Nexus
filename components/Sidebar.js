import { signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import useUserInfo from "../hooks/useUserInfo";

export default function Sidebar() {
  const { userInfo, setUserInfo } = useUserInfo();
  const router = useRouter();

  async function logout() {
    setUserInfo(null);
    await signOut();
  }

  const navItems = [
    { name: "Home", path: "/", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    )},
    { name: "Profile", path: `/${userInfo?.username}`, icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    )},
  ];

  return (
    <div className="flex flex-col h-screen sticky top-0 p-4 border-r border-nexusBorder">
      <div className="mb-8 px-4">
        <Link href="/">
          <img src="/logo.png" alt="Nexus Logo" className="h-10 w-10 cursor-pointer shadow-[0_0_15px_rgba(99,102,241,0.5)] rounded-xl" />
        </Link>
      </div>

      <nav className="flex-grow space-y-2">
        {navItems.map((item) => (
          <Link key={item.name} href={item.path}>
            <div className={`flex items-center space-x-4 p-4 rounded-full cursor-pointer transition-all hover:bg-nexusBorder ${router.asPath === item.path ? 'text-nexusAccent font-bold' : 'text-white'}`}>
              {item.icon}
              <span className="text-xl hidden lg:block">{item.name}</span>
            </div>
          </Link>
        ))}
      </nav>

      <div className="mt-auto">
        <button
          onClick={logout}
          className="flex items-center space-x-4 p-4 w-full rounded-full transition-all hover:bg-nexusBorder text-white group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 group-hover:text-red-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
          </svg>
          <span className="text-xl hidden lg:block group-hover:text-red-500">Logout</span>
        </button>
      </div>
    </div>
  );
}
