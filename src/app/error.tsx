'use client';

import Link from 'next/link';

export default function ErrorPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <div className="max-w-md w-full flex flex-col items-center gap-8 py-24">
        <h1 className="text-3xl md:text-4xl font-bold text-red-600 text-center mb-4">Une erreur est survenue</h1>
        <p className="text-lg text-gray-700 text-center mb-8">Merci de réessayer ou de contacter l'administrateur si le problème persiste.</p>
        <Link href="/" className="inline-block px-8 py-3 rounded-full bg-blue-600 text-white text-lg font-semibold shadow hover:bg-blue-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2">
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
} 