import React from 'react';
import { XIcon } from './icons';

interface SchoolInfoModalProps {
  onClose: () => void;
}

const SchoolInfoModal: React.FC<SchoolInfoModalProps> = ({ onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 md:p-8 relative transform transition-all"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Tutup"
        >
          <XIcon className="w-6 h-6" />
        </button>
        <div className="text-center mb-6">
          <img
            src="https://iili.io/f3I2n3v.png"
            alt="Logo SD IT BINA INSAN"
            className="mx-auto mb-4 w-20 h-20"
          />
          <h2 className="text-2xl font-bold text-gray-800">Informasi Sekolah</h2>
          <p className="text-gray-500">SD IT BINA INSAN LUBUK PAKAM</p>
        </div>
        
        <div className="space-y-3 text-sm md:text-base text-gray-700">
          <div className="flex">
            <p className="font-semibold w-40 shrink-0">Nama</p>
            <p>: SD IT BINA INSAN LUBUK PAKAM</p>
          </div>
          <div className="flex">
            <p className="font-semibold w-40 shrink-0">NPSN</p>
            <p>: 70047606</p>
          </div>
          <div className="flex">
            <p className="font-semibold w-40 shrink-0">Alamat</p>
            <p>: Jl. Mesjid I Desa Sekip</p>
          </div>
          <div className="flex">
            <p className="font-semibold w-40 shrink-0">Desa/Kelurahan</p>
            <p>: SEKIP</p>
          </div>
          <div className="flex">
            <p className="font-semibold w-40 shrink-0">Kecamatan/Kota (LN)</p>
            <p>: KEC. LUBUK PAKAM</p>
          </div>
          <div className="flex">
            <p className="font-semibold w-40 shrink-0">Kab.-Kota/Negara (LN)</p>
            <p>: KAB. DELI SERDANG</p>
          </div>
          <div className="flex">
            <p className="font-semibold w-40 shrink-0">Propinsi/Luar Negeri (LN)</p>
            <p>: PROV. SUMATERA UTARA</p>
          </div>
          <div className="flex">
            <p className="font-semibold w-40 shrink-0">Status Sekolah</p>
            <p>: SWASTA</p>
          </div>
          <div className="flex">
            <p className="font-semibold w-40 shrink-0">Bentuk Pendidikan</p>
            <p>: SD</p>
          </div>
          <div className="flex">
            <p className="font-semibold w-40 shrink-0">Jenjang Pendidikan</p>
            <p>: DIKDAS</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolInfoModal;