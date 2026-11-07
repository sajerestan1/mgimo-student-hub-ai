import { useEffect, useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { Menu, X, Bell } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import BrandMark from '@/components/BrandMark';
import { base44 } from '@/api/base44Client';
import { useStudentData } from '@/lib/StudentDataContext';

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { profile, unreadCount } = useStudentData();
  const studentName = profile?.full_name || 'Student';
  const program = profile?.program || 'MGIMO University';

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleSignOut = () => {
    base44.auth.logout();
  };

  return (
    <div className="min-h-screen bg-canvas">
      <div className="fixed inset-y-0 left-0 z-40 hidden w-[272px] lg:block">
        <Sidebar
          onSignOut={handleSignOut}
          unreadCount={unreadCount}
          studentName={studentName}
          program={program}
        />
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-[#08182B]/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-[280px] shadow-2xl">
            <div onClick={() => setMobileOpen(false)} className="h-full">
              <Sidebar
                onSignOut={handleSignOut}
                unreadCount={unreadCount}
                studentName={studentName}
                program={program}
              />
            </div>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute -right-12 top-4 rounded-full bg-white/10 p-2 text-white backdrop-blur"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      <div className="lg:pl-[272px]">
        <header className="sticky top-0 z-30 border-b border-[#E4E9F2]/80 bg-canvas/85 backdrop-blur-md lg:hidden">
          <div className="flex h-16 items-center justify-between px-4">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="rounded-xl border border-[#E4E9F2] bg-white p-2 text-navy shadow-sm"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <BrandMark className="h-8 w-8" />
              <span className="font-heading text-[15px] text-navy">Student Hub</span>
            </div>
            <Link
              to="/notifications"
              className="relative rounded-xl border border-[#E4E9F2] bg-white p-2 text-navy shadow-sm"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[9px] font-bold text-navy-deep">
                  {unreadCount}
                </span>
              )}
            </Link>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1200px] px-4 pb-10 pt-6 sm:px-6 lg:px-10 lg:pt-10">
          <Outlet />
        </main>

        <footer className="mx-auto w-full max-w-[1200px] px-4 pb-8 sm:px-6 lg:px-10">
          <p className="border-t border-[#E4E9F2] pt-5 text-center text-[10.5px] leading-relaxed text-slate-400">
            Independent AI Challenge Prototype. Not an official MGIMO University service. All student
            records and academic data are fictional.
          </p>
        </footer>
      </div>
    </div>
  );
}