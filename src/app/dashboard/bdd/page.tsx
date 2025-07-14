"use client";

import { DashboardLayout } from '@/components/DashboardLayout';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding, faCogs, faDatabase, faUsers, faChartLine, faCog, faPlus } from '@fortawesome/free-solid-svg-icons';

export default function BddPage() {
  const bddSections = [
    {
      id: 'compagnies',
      title: 'Gestion des Compagnies',
      description: 'Ajouter, modifier et supprimer les compagnies d\'assurance',
      icon: faBuilding,
      href: '/dashboard/compagnies',
      color: '#007aff',
      bgColor: 'rgba(0,122,255,0.08)'
    },
    {
      id: 'produits',
      title: 'Admin Commercial',
      description: 'Gérer les produits et barèmes de commission',
      icon: faCogs,
      href: '/dashboard/produits',
      color: '#6366f1',
      bgColor: 'rgba(99,102,241,0.08)'
    },
    {
      id: 'utilisateurs',
      title: 'Gestion des Utilisateurs',
      description: 'Administrer les comptes utilisateurs et permissions',
      icon: faUsers,
      href: '/dashboard/utilisateurs',
      color: '#10b981',
      bgColor: 'rgba(16,185,129,0.08)',
      comingSoon: true
    },
    {
      id: 'statistiques',
      title: 'Statistiques & Rapports',
      description: 'Analyser les données et générer des rapports',
      icon: faChartLine,
      href: '/dashboard/statistiques',
      color: '#f59e0b',
      bgColor: 'rgba(245,158,11,0.08)',
      comingSoon: true
    },
    {
      id: 'configuration',
      title: 'Configuration Système',
      description: 'Paramètres avancés et configuration de la base',
      icon: faCog,
      href: '/dashboard/config',
      color: '#8b5cf6',
      bgColor: 'rgba(139,92,246,0.08)',
      comingSoon: true
    },
    {
      id: 'backup',
      title: 'Sauvegarde & Restauration',
      description: 'Gérer les sauvegardes et restaurations de données',
      icon: faDatabase,
      href: '/dashboard/backup',
      color: '#ef4444',
      bgColor: 'rgba(239,68,68,0.08)',
      comingSoon: true
    },
    {
      id: 'firebase-users',
      title: 'Gestion avancée des utilisateurs (Firebase)',
      description: 'Accéder à la console Firebase pour gérer les comptes utilisateurs (suppression définitive, reset mot de passe, providers, etc.)',
      icon: faUsers,
      external: true,
      href: 'https://console.firebase.google.com/project/site-outils-b939e/authentication/users',
      color: '#4285F4',
      bgColor: 'rgba(66,133,244,0.08)'
    },
  ];

  return (
    <DashboardLayout>
      <div style={{ width: '100%', maxWidth: 1200, margin: '0 auto', padding: '2.5rem 0 2rem 0' }}>
        {/* Header */}
        <div style={{ marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: '#1d1d1f', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            Gestion de la base de données
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#86868b', margin: '1.2rem 0 0 0', fontWeight: 400 }}>
            Accédez à toutes les fonctionnalités d'administration de la base de données
          </p>
        </div>

        {/* Grille des cartes */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
          gap: '1.5rem',
          marginTop: '2rem'
        }}>
          {bddSections.map((section) => (
            <div key={section.id} style={{
              background: '#fff',
              borderRadius: 20,
              padding: '2rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: '1px solid #e5e5ea',
              transition: 'all 0.2s ease',
              cursor: section.comingSoon ? 'default' : 'pointer',
              opacity: section.comingSoon ? 0.6 : 1,
              position: 'relative'
            }}>
              {/* Badge "Bientôt disponible" */}
              {section.comingSoon && (
                <div style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: '#f3f4f6',
                  color: '#6b7280',
                  padding: '0.3rem 0.8rem',
                  borderRadius: 12,
                  fontSize: '0.8rem',
                  fontWeight: 500
                }}>
                  Bientôt disponible
                </div>
              )}

              {/* Icône */}
              <div style={{
                width: 60,
                height: 60,
                borderRadius: 16,
                background: section.bgColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem'
              }}>
                <FontAwesomeIcon 
                  icon={section.icon} 
                  style={{ 
                    fontSize: '1.5rem', 
                    color: section.color 
                  }} 
                />
              </div>

              {/* Contenu */}
              <h3 style={{
                fontSize: '1.3rem',
                fontWeight: 600,
                color: '#1d1d1f',
                margin: '0 0 0.8rem 0',
                lineHeight: 1.2
              }}>
                {section.title}
              </h3>
              
              <p style={{
                fontSize: '1rem',
                color: '#86868b',
                margin: '0 0 1.5rem 0',
                lineHeight: 1.5
              }}>
                {section.description}
              </p>

              {/* Bouton d'action */}
              {section.comingSoon ? (
                <button
                  style={{
                    background: '#f3f4f6',
                    color: '#6b7280',
                    border: 'none',
                    borderRadius: 12,
                    padding: '0.8rem 1.5rem',
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    cursor: 'default',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                  disabled
                >
                  <FontAwesomeIcon icon={faPlus} style={{ fontSize: '0.9rem' }} />
                  En développement
                </button>
              ) : section.external ? (
                <a
                  href={section.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: section.color,
                    color: '#fff',
                    border: 'none',
                    borderRadius: 12,
                    padding: '0.8rem 1.5rem',
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    textDecoration: 'none',
                    boxShadow: `0 2px 8px ${section.color}20`,
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = `0 4px 16px ${section.color}30`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = `0 2px 8px ${section.color}20`;
                  }}
                >
                  Accéder à la console Firebase
                  <svg width="22" height="22" viewBox="0 0 48 48" style={{ marginLeft: 8 }}>
                    <g><path fill="#4285F4" d="M24 9.5c3.5 0 6.7 1.2 9.2 3.2l6.9-6.9C35.7 2.1 30.1 0 24 0 14.6 0 6.4 5.7 2.2 14.1l8.1 6.3C12.6 13.7 17.8 9.5 24 9.5z"/><path fill="#34A853" d="M46.1 24.6c0-1.6-.1-3.1-.4-4.6H24v9.1h12.4c-.5 2.7-2.1 5-4.4 6.6l7 5.4c4.1-3.8 6.5-9.4 6.5-16.5z"/><path fill="#FBBC05" d="M10.3 28.2c-1.1-3.2-1.1-6.7 0-9.9l-8.1-6.3C.7 16.2 0 19 0 22c0 3 .7 5.8 2.2 8.4l8.1-6.3z"/><path fill="#EA4335" d="M24 44c6.1 0 11.7-2 15.9-5.5l-7-5.4c-2 1.4-4.6 2.2-8.9 2.2-6.2 0-11.4-4.2-13.3-9.9l-8.1 6.3C6.4 42.3 14.6 48 24 48z"/></g>
                  </svg>
                </a>
              ) : (
                <Link href={section.href} style={{ textDecoration: 'none' }}>
                  <button
                    style={{
                      background: section.color,
                      color: '#fff',
                      border: 'none',
                      borderRadius: 12,
                      padding: '0.8rem 1.5rem',
                      fontSize: '0.95rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      transition: 'all 0.2s ease',
                      boxShadow: `0 2px 8px ${section.color}20`
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = `0 4px 16px ${section.color}30`;
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = `0 2px 8px ${section.color}20`;
                    }}
                  >
                    Accéder
                    <FontAwesomeIcon icon={faPlus} style={{ fontSize: '0.9rem' }} />
                  </button>
                </Link>
              )}
              {/* Explication spécifique pour la carte Firebase */}
              {section.external && (
                <div style={{
                  marginTop: '1.2rem',
                  background: '#f3f4f6',
                  borderRadius: 10,
                  padding: '1rem',
                  color: '#374151',
                  fontSize: '0.98rem',
                  lineHeight: 1.5
                }}>
                  <strong>Pour certaines opérations sensibles</strong> (suppression définitive, réinitialisation de mot de passe, gestion des providers, etc.), il est nécessaire de passer par la console Firebase officielle.<br />
                  Utilise le bouton ci-dessus pour accéder directement à la gestion des comptes utilisateurs sur Firebase.
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Section d'information */}
        <div style={{
          background: '#f8fafc',
          borderRadius: 16,
          padding: '2rem',
          marginTop: '3rem',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{
            fontSize: '1.2rem',
            fontWeight: 600,
            color: '#1d1d1f',
            margin: '0 0 1rem 0'
          }}>
            <FontAwesomeIcon icon={faDatabase} style={{ marginRight: '0.5rem', color: '#6366f1' }} />
            Informations sur la base de données
          </h3>
          <p style={{
            fontSize: '1rem',
            color: '#64748b',
            margin: 0,
            lineHeight: 1.6
          }}>
            Cette interface centralise toutes les opérations d'administration de la base de données. 
            Les nouvelles fonctionnalités seront ajoutées progressivement pour offrir un contrôle complet 
            sur vos données et configurations.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
} 