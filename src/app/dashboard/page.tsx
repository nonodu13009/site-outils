"use client";

import { DashboardLayout } from '@/components/DashboardLayout';
import { AuthGuard } from '@/components/AuthGuard';

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardLayout>
        {/* Zone principale vide pour l'instant */}
      </DashboardLayout>
    </AuthGuard>
  );
} 