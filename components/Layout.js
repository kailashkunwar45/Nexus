export default function Layout({children}) {
  return (
    <div className="max-w-lg mx-auto border-l border-r border-nexusBorder min-h-screen">
      <div className="flex justify-center p-4 border-b border-nexusBorder">
        <img src="/logo.png" alt="Nexus Logo" className="h-10 w-10 object-contain rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
      </div>
      {children}
    </div>
  );
}