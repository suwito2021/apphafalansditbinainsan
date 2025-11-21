import React from 'react';

interface LandingPageProps {
  onNavigate: (portal: 'teacher' | 'parent' | 'principal') => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="w-full max-w-6xl mx-auto text-center">
      <h1 className="text-2xl md:text-3xl mb-4 text-gray-800">Selamat Datang di</h1>
      <p className="text-2xl md:text-3xl font-bold mb-8 text-white">SD IT BINA INSAN</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <h3 className="text-xl font-semibold mb-4 text-blue-600">Portal Guru</h3>
          <p className="text-gray-600 mb-4">Akses untuk guru mengelola data siswa dan penilaian.</p>
          <button
            onClick={() => onNavigate('teacher')}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Masuk Portal Guru
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <h3 className="text-xl font-semibold mb-4 text-green-600">Portal Orang Tua</h3>
          <p className="text-gray-600 mb-4">Pantau perkembangan anak dan laporan belajar.</p>
          <button
            onClick={() => onNavigate('parent')}
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            Masuk Portal Orang Tua
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <h3 className="text-xl font-semibold mb-4 text-purple-600">Portal Admin</h3>
          <p className="text-gray-600 mb-4">Akses administratif untuk kepala sekolah.</p>
          <button
            onClick={() => onNavigate('principal')}
            className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition-colors"
          >
            Masuk Portal Admin
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;