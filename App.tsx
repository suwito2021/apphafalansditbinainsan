import React, { useState, useCallback } from 'react';
import LandingPage from './components/LandingPage.tsx';
import TeacherPortal from './components/TeacherPortal.tsx';
import ParentPortal from './components/ParentPortal.tsx';
import PrincipalPortal from './components/PrincipalPortal.tsx';
import Login from './components/Login.tsx';
import Header from './components/Header.tsx';
import SchoolInfoModal from './components/SchoolInfoModal.tsx';
import type { Teacher, Student, Principal } from './types';

type Portal = 'landing' | 'teacher' | 'parent' | 'principal';
type User = Teacher | Student | Principal;

const App: React.FC = () => {
  const [activePortal, setActivePortal] = useState<Portal>('landing');
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [isSchoolInfoVisible, setIsSchoolInfoVisible] = useState(false);

  const handleShowSchoolInfo = useCallback(() => {
    setIsSchoolInfoVisible(true);
  }, []);

  const handleCloseSchoolInfo = useCallback(() => {
    setIsSchoolInfoVisible(false);
  }, []);

  const handlePortalSelect = useCallback((portal: Portal) => {
    setActivePortal(portal);
    setLoggedInUser(null); // Reset user on new portal selection
  }, []);

  const handleBackToHome = useCallback(() => {
    setActivePortal('landing');
    setLoggedInUser(null);
  }, []);

  const handleLoginSuccess = useCallback((user: User) => {
    setLoggedInUser(user);
  }, []);

  const renderPortal = () => {
    switch (activePortal) {
      case 'teacher':
        return loggedInUser ? 
            <TeacherPortal onBack={handleBackToHome} teacher={loggedInUser as Teacher} /> : 
            <Login portalType="teacher" onBack={handleBackToHome} onLoginSuccess={handleLoginSuccess} />;
      case 'parent':
        return loggedInUser ? 
            <ParentPortal onBack={handleBackToHome} student={loggedInUser as Student} /> : 
            <Login portalType="parent" onBack={handleBackToHome} onLoginSuccess={handleLoginSuccess} />;
      case 'principal':
        return loggedInUser ? 
            <PrincipalPortal onBack={handleBackToHome} principal={loggedInUser as Principal} /> : 
            <Login portalType="principal" onBack={handleBackToHome} onLoginSuccess={handleLoginSuccess} />;
      case 'landing':
      default:
        return <LandingPage onNavigate={handlePortalSelect} />;
    }
  };

  return (
    <div className="min-h-screen bg-[url('https://iili.io/f3IABPR.jpg')] bg-cover bg-center font-sans">
        <nav className="bg-emerald-900 text-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center space-x-4">
                        <img
                            src="https://iili.io/f3I2n3v.png"
                            alt="Logo SD IT BINA INSAN"
                            className="w-10 h-10"
                        />
                        <h1 className="text-xl font-bold">SD IT BINA INSAN</h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button onClick={handleBackToHome} className="hover:bg-emerald-700 px-3 py-2 rounded-md text-sm font-medium">Home</button>
                        <button onClick={() => handlePortalSelect('teacher')} className="hover:bg-emerald-700 px-3 py-2 rounded-md text-sm font-medium">Portal Guru</button>
                        <button onClick={() => handlePortalSelect('parent')} className="hover:bg-emerald-700 px-3 py-2 rounded-md text-sm font-medium">Portal Orang Tua</button>
                        <button onClick={() => handlePortalSelect('principal')} className="hover:bg-emerald-700 px-3 py-2 rounded-md text-sm font-medium">Portal Admin</button>
                        <button onClick={handleShowSchoolInfo} className="hover:bg-emerald-700 px-3 py-2 rounded-md text-sm font-medium">Info Sekolah</button>
                        {loggedInUser && (
                            <button onClick={handleBackToHome} className="hover:bg-emerald-700 px-3 py-2 rounded-md text-sm font-medium">Logout</button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
        <main className="flex-grow p-4 md:p-8 flex items-center justify-center">
            {renderPortal()}
        </main>
        {isSchoolInfoVisible && <SchoolInfoModal onClose={handleCloseSchoolInfo} />}
    </div>
  );
};

export default App;