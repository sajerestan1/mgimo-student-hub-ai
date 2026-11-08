import { useEffect, useState } from 'react';
import { loadStudentPortal } from '@/lib/studentPortal';

/** The signed-in student's own profile, or null while loading / when unlinked. */
export default function useStudentProfile(enabled) {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!enabled) {
      setProfile(null);
      return undefined;
    }
    let alive = true;
    loadStudentPortal()
      .then((data) => alive && setProfile(data.profile || null))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [enabled]);

  return profile;
}