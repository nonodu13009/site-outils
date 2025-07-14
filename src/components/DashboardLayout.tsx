"use client";

import { ReactNode } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-indigo-100 flex flex-col">
      {/* Header flottant */}
      <div className="sticky top-0 z-30 w-full">
        <Header />
      </div>
      <div className="flex flex-1 w-full max-w-screen-2xl mx-auto">
        {/* Sidebar sous le header, prend toute la hauteur */}
        <Sidebar />
        <main className="flex-1 p-2 flex flex-col items-center">
          {children}
        </main>
      </div>
    </div>
  );
}; 