"use client";

import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse } from '@fortawesome/free-solid-svg-icons';
import { usePathname } from 'next/navigation';
import { useUserProfile } from '@/hooks/useUserProfile';
import { faBuilding, faCogs, faDatabase } from '@fortawesome/free-solid-svg-icons';

export const Sidebar = () => {
  const pathname = usePathname();
  const { profile } = useUserProfile();
  
  return (
    <aside
      className="h-[calc(100vh-64px)] w-24 bg-white/70 backdrop-blur-md shadow-lg border-r border-gray-200 flex flex-col items-center pt-8 gap-8 rounded-tr-3xl"
      style={{ minHeight: 'calc(100vh - 64px)' }}
    >
      {/* Bouton Dashboard */}
      <Link href="/dashboard">
        <span
          className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-200 cursor-pointer
            ${pathname === '/dashboard' ? 'bg-blue-50 text-blue-600 shadow-md' : 'text-gray-400 hover:bg-blue-50 hover:text-blue-600'}`}
        >
          <FontAwesomeIcon icon={faHouse} className="text-2xl mb-1" />
          <span className="text-xs font-medium">Dashboard</span>
        </span>
      </Link>
      {/* Bouton Gestion BDD (admin uniquement) */}
      {profile?.role === 'administrateur' && (
        <Link href="/dashboard/bdd">
          <span
            className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-200 cursor-pointer
              ${pathname === '/dashboard/bdd' ? 'bg-blue-50 text-blue-600 shadow-md' : 'text-gray-400 hover:bg-blue-50 hover:text-blue-600'}`}
          >
            <FontAwesomeIcon icon={faDatabase} className="text-2xl mb-1" />
            <span className="text-xs font-medium">Gestion BDD</span>
          </span>
        </Link>
      )}
    </aside>
  );
}; 