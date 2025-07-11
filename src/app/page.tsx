import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <div className="w-full max-w-xl flex flex-col items-center justify-center gap-8 py-24">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 text-center tracking-tight mb-2" style={{letterSpacing: '-0.02em'}}>allianz marseille</h1>
        <h2 className="text-xl md:text-2xl font-light text-gray-600 text-center mb-8">boîte à outils de l'agence</h2>
        <div className="w-full h-48 rounded-xl overflow-hidden mb-8 group">
          <Image
            src="/images/vieux-port.jpg"
            alt="Vieux-Port de Marseille"
            width={800}
            height={300}
            className="object-cover w-full h-48 transition-transform duration-500 ease-out group-hover:scale-105"
            priority
          />
        </div>
        <Link
          href="/login"
          className="inline-block px-8 py-3 rounded-full bg-blue-600 text-white text-lg font-semibold shadow transition-all duration-300 ease-out hover:bg-blue-700 hover:shadow-xl hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
        >
          je me connecte
        </Link>
      </div>
    </div>
  );
}
