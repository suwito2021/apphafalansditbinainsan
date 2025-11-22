import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getSheetData, addScore } from '../services/googleSheetsService';
import type { Student, Score, Teacher, Hafalan } from '../types';
import { ChevronLeftIcon, BookIcon, PrayingHandsIcon, QuoteIcon, ChartBarIcon, NotYetDevelopedIcon, StartingToDevelopIcon, DevelopingAsExpectedIcon, VeryWellDevelopedIcon } from './icons';

interface TeacherPortalProps {
  onBack: () => void;
  teacher: Teacher;
}

const INPUT_TABS = {
  surah1: { label: 'Semester 1 - Surah Pendek', category: 'Hafalan Surah Pendek', icon: BookIcon, semester: 1 },
  surah2: { label: 'Semester 2 - Surah Pendek', category: 'Hafalan Surah Pendek', icon: BookIcon, semester: 2 },
  doa1: { label: 'Semester 1 - Doa Sehari-hari', category: 'Hafalan Doa Sehari-hari', icon: PrayingHandsIcon, semester: 1 },
  doa2: { label: 'Semester 2 - Doa Sehari-hari', category: 'Hafalan Doa Sehari-hari', icon: PrayingHandsIcon, semester: 2 },
  hadist1: { label: 'Semester 1 - Hadist', category: 'Hafalan Hadist', icon: QuoteIcon, semester: 1 },
  hadist2: { label: 'Semester 2 - Hadist', category: 'Hafalan Hadist', icon: QuoteIcon, semester: 2 },
} as const;

type InputTabKey = keyof typeof INPUT_TABS;

const SCORE_OPTIONS = [
    { value: 'BB', label: 'Belum Berkembang', Icon: NotYetDevelopedIcon, color: 'red' },
    { value: 'MB', label: 'Mulai Berkembang', Icon: StartingToDevelopIcon, color: 'yellow' },
    { value: 'BSH', label: 'Berkembang Sesuai Harapan', Icon: DevelopingAsExpectedIcon, color: 'green' },
    { value: 'BSB', label: 'Berkembang Sangat Baik', Icon: VeryWellDevelopedIcon, color: 'emerald' },
];

const colorSchemes = {
    red: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-300', selected: 'border-red-500 ring-red-500' },
    yellow: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-300', selected: 'border-yellow-500 ring-yellow-500' },
    green: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-300', selected: 'border-green-500 ring-green-500' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-300', selected: 'border-emerald-500 ring-emerald-500' },
};

const TeacherPortal: React.FC<TeacherPortalProps> = ({ onBack, teacher }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [scores, setScores] = useState<Score[]>([]);
  const [hafalanItems, setHafalanItems] = useState<Hafalan[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const [isLoadingHafalan, setIsLoadingHafalan] = useState(true);
  const [isLoadingScores, setIsLoadingScores] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  const [mainTab, setMainTab] = useState<'input' | 'report'>('input');
  const [activeSemester, setActiveSemester] = useState<1 | 2>(1);

  // Filter states for report
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState<Omit<Score, 'Timestamp'>>({
    'Student ID': '',
    Category: INPUT_TABS.surah1.category,
    'Item Name': '',
    Score: '',
    Date: new Date().toISOString().split('T')[0],
    Notes: '',
    Ayat: '',
  });
  const [selectedAyat, setSelectedAyat] = useState<number[]>([]);
  const [maxAyat, setMaxAyat] = useState<number>(100);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setIsLoadingStudents(true);
        setError(null);
        const studentData = await getSheetData<Student>('Student');
        const filteredStudents = studentData.filter(s => s.Class === teacher.Class);
        setStudents(filteredStudents);
      } catch (err) {
        setError('Gagal memuat data siswa. Silakan coba lagi.');
      } finally {
        setIsLoadingStudents(false);
      }
    };
    fetchStudents();
  }, [teacher.Class]);
  
  useEffect(() => {
    const fetchHafalanItems = async () => {
      try {
        setIsLoadingHafalan(true);
        const hafalanData = await getSheetData<Hafalan>('Hafalan');
        const filteredData = hafalanData.filter(h => h.Class === teacher.Class);
        setHafalanItems(filteredData);
      } catch (err) {
        setError(prev => prev || 'Gagal memuat daftar item hafalan.');
      } finally {
        setIsLoadingHafalan(false);
      }
    };
    fetchHafalanItems();
  }, [teacher.Class]);

  useEffect(() => {
    if (mainTab === 'input') {
      setFormData(prev => ({
        ...prev,
        Category: '',
        'Item Name': '',
        Score: '',
        Ayat: '',
      }));
      setSelectedAyat([]);
      setMaxAyat(100);
    }
    setSubmitStatus(null);
  }, [activeSemester, mainTab]);

  useEffect(() => {
    if (mainTab === 'report' && students.length > 0) {
      const fetchScores = async () => {
        setIsLoadingScores(true);
        setError(null);
        try {
          const scoreData = await getSheetData<Score>('score');
          const studentIds = new Set(students.map(s => s.NISN));
          const teacherScores = scoreData.filter(score => studentIds.has(score['Student ID']));
          setScores(teacherScores.sort((a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime()));
        } catch (err)
 {
          setError('Gagal memuat data laporan.');
        } finally {
          setIsLoadingScores(false);
        }
      };
      fetchScores();
    }
  }, [mainTab, students]);

  const studentMap = useMemo(() => new Map(students.map(s => [s.NISN, s.Name])), [students]);
  const filteredHafalanItems = useMemo(() => {
    return hafalanItems.filter(item => parseInt(item.Semester as string) === activeSemester);
  }, [hafalanItems, activeSemester]);

  const filteredScores = useMemo(() => {
    let filtered = scores;
    if (selectedStudent) {
      filtered = filtered.filter(score => score['Student ID'] === selectedStudent);
    }
    if (startDate) {
      filtered = filtered.filter(score => score.Date >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter(score => score.Date <= endDate);
    }
    return filtered;
  }, [scores, selectedStudent, startDate, endDate]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStudent, startDate, endDate]);

  const scoreCountsSurah = useMemo(() => {
    const counts = { BB: 0, MB: 0, BSH: 0, BSB: 0 };
    filteredScores.filter(score => score.Category === 'Hafalan Surah Pendek').forEach(score => {
      if (counts[score.Score as keyof typeof counts] !== undefined) {
        counts[score.Score as keyof typeof counts]++;
      }
    });
    return Object.entries(counts).map(([score, count]) => ({ score, count }));
  }, [filteredScores]);

  const scoreCountsDoa = useMemo(() => {
    const counts = { BB: 0, MB: 0, BSH: 0, BSB: 0 };
    filteredScores.filter(score => score.Category === 'Hafalan Doa Sehari-hari').forEach(score => {
      if (counts[score.Score as keyof typeof counts] !== undefined) {
        counts[score.Score as keyof typeof counts]++;
      }
    });
    return Object.entries(counts).map(([score, count]) => ({ score, count }));
  }, [filteredScores]);

  const scoreCountsHadist = useMemo(() => {
    const counts = { BB: 0, MB: 0, BSH: 0, BSB: 0 };
    filteredScores.filter(score => score.Category === 'Hafalan Hadist').forEach(score => {
      if (counts[score.Score as keyof typeof counts] !== undefined) {
        counts[score.Score as keyof typeof counts]++;
      }
    });
    return Object.entries(counts).map(([score, count]) => ({ score, count }));
  }, [filteredScores]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'Item Name') {
      const selectedItem = filteredHafalanItems.find(item => item.ItemName === value);
      setFormData(prev => ({ ...prev, [name]: value, Category: selectedItem?.Category || '' }));
      setMaxAyat(parseInt(selectedItem?.['Jlh Ayat'] as string) || 100);
      // Reset selectedAyat if exceeds new max
      setSelectedAyat(prev => prev.filter(a => a <= (parseInt(selectedItem?.['Jlh Ayat'] as string) || 100)));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleScoreSelect = (scoreValue: string) => {
    setFormData(prev => ({ ...prev, Score: scoreValue }));
  }

  const handleAyatSelect = (ayat: number) => {
    setSelectedAyat(prev => prev.includes(ayat) ? prev.filter(a => a !== ayat) : [...prev, ayat]);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData['Student ID'] || !formData['Item Name'] || !formData.Score) {
      setSubmitStatus({ message: 'Silakan lengkapi semua pilihan: siswa, item, dan penilaian.', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);
    try {
      const submitData = { ...formData, Ayat: selectedAyat.sort((a, b) => a - b).join(',') };
      const result = await addScore(submitData);
      setSubmitStatus({ message: result.message, type: 'success' });
      setFormData({
        'Student ID': '',
        Category: '',
        'Item Name': '',
        Score: '',
        Date: new Date().toISOString().split('T')[0],
        Notes: '',
        Ayat: '',
      });
      setSelectedAyat([]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan yang tidak diketahui.';
      setSubmitStatus({ message: `Gagal mengirim data: ${errorMessage}`, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const renderInputForm = () => {
    if (isLoadingStudents) return <p className="text-center text-gray-500 py-8">Memuat data siswa...</p>;
    if (error && students.length === 0) return <p className="text-center text-red-500 py-8">{error}</p>;

    return (
      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Input Penilaian Baru</h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <select id="Student ID" name="Student ID" value={formData['Student ID']} onChange={handleChange} required className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md">
                <option value="">Pilih Siswa</option>
                {students.map((student, index) => <option key={`${student.NISN}-${index}`} value={student.NISN}>{student.Name} ({student.NISN})</option>)}
              </select>
            </div>
            <div>
              <select id="Item Name" name="Item Name" value={formData['Item Name']} onChange={handleChange} required disabled={isLoadingHafalan || filteredHafalanItems.length === 0} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md disabled:bg-gray-100">
                <option value="">{isLoadingHafalan ? 'Memuat item...' : 'Pilih Item'}</option>
                {filteredHafalanItems.map((item, index) => <option key={`${item.ItemName}-${item.Category}-${item.Semester}-${index}`} value={item.ItemName}>{item.ItemName}</option>)}
              </select>
            </div>
          </div>
          {formData['Item Name'] && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ayat yang Dihafal</label>
              <div className="grid grid-cols-10 gap-2 max-h-60 overflow-y-auto border border-gray-300 rounded-md p-4">
                {Array.from({ length: maxAyat }, (_, i) => i + 1).map(ayat => (
                  <label key={ayat} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedAyat.includes(ayat)}
                      onChange={() => handleAyatSelect(ayat)}
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                    />
                    <span className="text-sm">{ayat}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Penilaian</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {SCORE_OPTIONS.map(option => {
                const scheme = colorSchemes[option.color as keyof typeof colorSchemes];
                const isSelected = formData.Score === option.value;
                return (
                  <button type="button" key={option.value} onClick={() => handleScoreSelect(option.value)} className={`flex flex-col items-center justify-center text-center p-3 rounded-lg border-2 transition-all duration-200 focus:outline-none ${scheme.bg} ${scheme.text} ${isSelected ? `${scheme.selected} ring-2 ring-offset-1` : `${scheme.border} hover:shadow-md hover:-translate-y-1`}`}>
                    <option.Icon className="w-8 h-8 mb-2" />
                    <span className="font-bold text-lg">{option.value}</span>
                    <span className="text-xs">{option.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="Date" className="block text-sm font-medium text-gray-700">Tanggal</label>
              <input type="date" id="Date" name="Date" value={formData.Date} onChange={e => setFormData(p => ({...p, Date: e.target.value}))} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"/>
            </div>
            <div>
              <label htmlFor="Notes" className="block text-sm font-medium text-gray-700">Catatan (Opsional)</label>
              <textarea id="Notes" name="Notes" value={formData.Notes} onChange={handleChange} rows={1} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"></textarea>
            </div>
          </div>
          <div className="text-right">
            <button type="submit" disabled={isSubmitting} className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:bg-gray-400">
              {isSubmitting ? 'Mengirim...' : 'Kirim Penilaian'}
            </button>
          </div>
        </form>
        {submitStatus && (
          <div className={`mt-4 p-4 rounded-md ${submitStatus.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
            <p className="text-sm font-medium">{submitStatus.message}</p>
          </div>
        )}
      </div>
    );
  };
  
  const renderReport = () => {
    if (isLoadingScores) return <p className="text-center text-gray-500 py-8">Memuat data laporan...</p>;
    if (error && scores.length === 0) return <p className="text-center text-red-500 py-8">{error}</p>;
    if (scores.length === 0) return <p className="text-center text-gray-500 py-8">Belum ada data penilaian untuk kelas ini.</p>;

    const totalPages = Math.ceil(filteredScores.length / itemsPerPage);
    const paginatedScores = filteredScores.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Laporan Penilaian Kelas {teacher.Class}</h3>
        <div className="mb-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Filter Siswa</label>
              <select value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500">
                <option value="">Semua Siswa</option>
                {students.map(student => <option key={student.NISN} value={student.NISN}>{student.Name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tanggal Mulai</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tanggal Akhir</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" />
            </div>
            <div className="flex items-end">
              <button onClick={() => {setSelectedStudent(''); setStartDate(''); setEndDate('');}} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">Reset Filter</button>
            </div>
          </div>
        </div>
        <div className="border rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-emerald-600">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">No</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Nama Siswa</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Kategori</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Item Hafalan</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Ayat</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Rating</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Tanggal</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Catatan</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedScores.map((score, index) => (
                <tr key={index}>
                  <td className="px-4 py-4 text-sm text-gray-900 break-words">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td className="px-4 py-4 text-sm text-gray-900 font-medium break-words">{studentMap.get(score['Student ID']) || score['Student ID']}</td>
                  <td className="px-4 py-4 text-sm text-gray-900 break-words">{score.Category}</td>
                  <td className="px-4 py-4 text-sm text-gray-900 break-words">{score['Item Name']}</td>
                  <td className="px-4 py-4 text-sm text-gray-900 break-words">{score.Ayat || '-'}</td>
                  <td className="px-4 py-4 text-sm text-gray-900 font-semibold break-words">{score.Score}</td>
                  <td className="px-4 py-4 text-sm text-gray-500 break-words">{score.Date}</td>
                  <td className="px-4 py-4 text-sm text-gray-900 break-words">{score.Notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredScores.length === 0 && scores.length > 0 && <p className="text-center text-gray-500 py-4">Tidak ada data yang cocok dengan filter.</p>}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4 px-4 py-3 bg-gray-50 border-t">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Halaman {currentPage} dari {totalPages} ({filteredScores.length} data)
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
            >
              Next
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 w-full max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6 pb-4 border-b">
        <div className="flex items-center space-x-4">
          <img
            src="https://iili.io/f3I2n3v.png"
            alt="Logo SD IT BINA INSAN"
            className="w-12 h-12"
          />
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Portal Guru</h2>
            <p className="text-gray-500">Selamat datang, {teacher.Name}!</p>
          </div>
        </div>
        <button onClick={onBack} className="flex items-center text-emerald-600 hover:text-emerald-800 font-semibold">
          <ChevronLeftIcon className="w-5 h-5 mr-1" />
          Kembali
        </button>
      </div>
      
      <div>
        <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <button
                    onClick={() => setMainTab('input')}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                        mainTab === 'input'
                        ? 'border-emerald-500 text-emerald-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                    Penilaian Hafalan
                </button>
                <button
                    onClick={() => setMainTab('report')}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                        mainTab === 'report' 
                        ? 'border-emerald-500 text-emerald-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                    Laporan
                </button>
            </nav>
        </div>
      </div>

      <div className="mt-8">
        {mainTab === 'input' && (
            <div className="flex flex-col md:flex-row gap-8">
                <aside className="w-full md:w-1/4">
                    <nav className="flex flex-col space-y-2">
                        <button
                            onClick={() => setActiveSemester(1)}
                            className={`flex items-center w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 text-sm font-medium ${
                                activeSemester === 1
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                            }`}
                        >
                            Semester 1
                        </button>
                        <button
                            onClick={() => setActiveSemester(2)}
                            className={`flex items-center w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 text-sm font-medium ${
                                activeSemester === 2
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                            }`}
                        >
                            Semester 2
                        </button>
                    </nav>
                </aside>
                <main className="flex-1 md:w-3/4">
                    {renderInputForm()}
                </main>
            </div>
        )}
        {mainTab === 'report' && renderReport()}
      </div>
    </div>
  );
};

export default TeacherPortal;
