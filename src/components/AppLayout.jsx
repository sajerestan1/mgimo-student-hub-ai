import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { base44 } from '@/api/base44Client';
import { useAdminData } from '@/lib/AdminDataContext';

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { me, role, analytics } = useAdminData();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleSignOut = () => {
    base44.auth.logout();
  };

  return (
    <div className="min-h-screen bg-canvas">
      <div className="fixed inset-y-0 left-0 z-40 hidden w-[258px] lg:block">
        <Sidebar role={role} user={me} pendingRequests={analytics.kpis.pendingRequests} onSignOut={handleSignOut} />
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-[#0B2140]/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-[270px] shadow-2xl">
            <div onClick={() => setMobileOpen(false)} className="h-full">
              <Sidebar
                role={role}
                user={me}
                pendingRequests={analytics.kpis.pendingRequests}
                onSignOut={handleSignOut}
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

      <div className="lg:pl-[258px]">
        <TopBar onOpenMenu={() => setMobileOpen(true)} />
        <main className="px-4 pb-10 pt-5 sm:px-6 lg:px-8">
          <Outlet />
          <footer className="mt-10 border-t border-[#E4EAF3] pt-4 text-[10.5px] leading-relaxed text-mutedink">
            <span className="font-medium text-ink">DEMONSTRATION DATA.</span> All faculties, students, staff, grades and
            requests shown are fictional records generated for the MGIMO AI Challenge prototype. This is not an official
            MGIMO University system.
          </footer>
        </main>
      </div>
    </div>
  );
}