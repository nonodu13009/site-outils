"use client";

import { DashboardLayout } from '@/components/DashboardLayout';
import { AuthGuard } from '@/components/AuthGuard';
import { CommercialTable } from '@/components/CommercialTable';
import { useCommercialData } from '@/hooks/useCommercialData';
import { useUserProfile } from '@/hooks/useUserProfile';

export default function DashboardPage() {
  const { profile, loading: profileLoading } = useUserProfile();
  const { data, loading: dataLoading, error } = useCommercialData();

  // Afficher le tableau commercial uniquement pour le rôle cdc_commercial (insensible à la casse/espaces)
  const isCommercial = profile?.role?.toLowerCase().trim() === 'cdc_commercial';

  return (
    <AuthGuard>
      <DashboardLayout>
        {profileLoading ? (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '200px',
            color: '#86868b',
            fontSize: '1.1rem'
          }}>
            Chargement du profil...
          </div>
        ) : isCommercial ? (
          <CommercialTable 
            data={data} 
            loading={dataLoading} 
          />
        ) : (
          <div style={{ 
            padding: '2rem',
            textAlign: 'center',
            color: '#86868b'
          }}>
            <h2 style={{ 
              fontSize: '2rem', 
              fontWeight: '600', 
              color: '#1d1d1f',
              marginBottom: '1rem'
            }}>
              Tableau de bord
            </h2>
            <p style={{ fontSize: '1.1rem' }}>
              Bienvenue sur votre tableau de bord.
            </p>
            {profile?.role && (
              <p style={{ 
                fontSize: '0.95rem', 
                color: '#a1a1a6',
                marginTop: '0.5rem'
              }}>
                Rôle actuel : {profile.role_label || profile.role}
              </p>
            )}
          </div>
        )}
        
        {error && (
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: '#ff3b30',
            color: 'white',
            padding: '1rem 1.5rem',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(255, 59, 48, 0.3)',
            zIndex: 1000
          }}>
            {error}
          </div>
        )}
      </DashboardLayout>
    </AuthGuard>
  );
} 