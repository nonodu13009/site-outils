"use client";

import { useUserProfile } from '@/hooks/useUserProfile';
import { signOutUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

function getTodayFr() {
  return new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
}

export const Header = () => {
  const { profile } = useUserProfile();
  const router = useRouter();
  const [date, setDate] = useState(getTodayFr());

  useEffect(() => {
    // Met à jour la date à minuit si la page reste ouverte
    const interval = setInterval(() => setDate(getTodayFr()), 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSignOut = async () => {
    await signOutUser();
    router.push('/');
  };

  return (
    <header className="w-full bg-white shadow-sm rounded-b-xl px-6 flex items-center justify-between gap-4" style={{ height: 64 }}>
      {/* Logo + Titre */}
      <div className="flex-1 min-w-0 flex items-center gap-4 h-full">
        <Image src="/images/logo.png" alt="Logo Allianz" width={442} height={114} style={{ height: 44, width: 'auto' }} />
        <span className="text-2xl font-bold" style={{ color: '#0055A4', lineHeight: 1, height: 44, display: 'flex', alignItems: 'center' }}>
          Notre site outils…
        </span>
      </div>
      {/* Date centrée */}
      <div className="flex-1 min-w-0 flex justify-center items-center h-full">
        <span className="text-lg font-semibold" style={{ color: '#A0AEC0', lineHeight: 1 }}>
          {date}
        </span>
      </div>
      {/* Profil à droite */}
      <div className="flex-1 min-w-0 flex justify-end items-center gap-4 h-full">
        {profile && (
          <>
            <span className="text-base font-semibold" style={{ color: '#A0AEC0', lineHeight: 1 }}>{profile.prenom}</span>
            <span className="text-sm font-medium" style={{ color: '#A0AEC0', lineHeight: 1 }}>{profile.role_label}</span>
            {/* Voyant vert clignotant */}
            <span className="relative flex h-3 w-3 items-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
          </>
        )}
        <button
          onClick={handleSignOut}
          className="ml-4 px-4 py-1 rounded-full bg-gray-100 font-medium hover:bg-blue-600 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 h-10 flex items-center"
          style={{ minHeight: 40, color: '#A0AEC0' }}
        >
          Se déconnecter
        </button>
      </div>
    </header>
  );
}; 