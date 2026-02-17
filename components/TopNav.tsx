"use client";

interface TopNavProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  showMenu?: boolean;
}

const menuItems = [
  { id: "dashboard", label: "Dashboard" },
  { id: "analyze", label: "วิเคราะห์ใหม่" },
  { id: "report", label: "รายงาน" },
];

export default function TopNav({ currentPage, onNavigate, showMenu = true }: TopNavProps) {
  return (
    <nav className="bg-gov-primary text-white sticky top-0 z-50 shadow-md">
      {/* Organization Sub-bar */}
      <div className="bg-gov-primary border-b border-white/10">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex items-center justify-between h-10">
            <p className="text-[11px] text-white/60 font-prompt">
              สำนักงานเขตพื้นที่การศึกษาประถมศึกษานครปฐม เขต 1
            </p>
            <p className="text-[11px] text-white/50 font-prompt hidden sm:block">
              สพป.นครปฐม เขต 1
            </p>
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo + Brand */}
          <button
            onClick={() => onNavigate("home")}
            className="flex items-center gap-3 hover:opacity-90 transition-opacity"
          >
            <div className="w-9 h-9 bg-white/10 border border-white/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-semibold tracking-wide font-prompt leading-tight">
                TeachAlign
              </h1>
              <p className="text-[10px] text-white/60 font-prompt leading-tight">
                ระบบวิเคราะห์ความสอดคล้องการสอน
              </p>
            </div>
          </button>

          {/* Menu Items */}
          {showMenu && (
            <div className="hidden md:flex items-center gap-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`px-4 py-2 text-sm font-prompt transition-colors ${
                    currentPage === item.id
                      ? "bg-white/15 text-white"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}

          {/* User Profile */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-medium font-prompt">ผู้ดูแลระบบ</p>
              <p className="text-[10px] text-white/60 font-prompt">Admin</p>
            </div>
            <div className="w-8 h-8 bg-gov-secondary border border-white/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-white/80" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
