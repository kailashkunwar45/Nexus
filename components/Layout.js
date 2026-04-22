import Sidebar from "./Sidebar";
import Suggestions from "./Suggestions";

export default function Layout({children}) {
  return (
    <div className="bg-nexusDarkGray min-h-screen text-white">
      <div className="max-w-7xl mx-auto flex">
        {/* Left Sidebar */}
        <aside className="w-20 lg:w-64 flex-shrink-0">
          <Sidebar />
        </aside>

        {/* Center Feed */}
        <main className="flex-grow border-r border-nexusBorder min-h-screen max-w-2xl">
          {children}
        </main>

        {/* Right Sidebar */}
        <aside className="hidden md:block w-80 lg:w-96 flex-shrink-0">
          <Suggestions />
        </aside>
      </div>
    </div>
  );
}