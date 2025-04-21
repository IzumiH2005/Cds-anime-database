import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastProvider } from '@/components/ui/toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useEffect } from 'react';
import { generateSampleData } from '@/lib/localStorage';
import { Toaster } from '@/components/ui/toaster';

// Pages
import HomePage from '@/pages/HomePage';
import ExplorePage from '@/pages/ExplorePage';
import CreatePage from '@/pages/CreatePage';
import DeckPage from '@/pages/DeckPage';
import EditDeckPage from '@/pages/EditDeckPage';
import MyDecksPage from '@/pages/MyDecksPage';
import ProfilePage from '@/pages/ProfilePage';
import StudyPage from '@/pages/StudyPage';
import LoginPage from '@/pages/LoginPage';
import ImportPage from '@/pages/ImportPage';
import SharePage from '@/pages/SharePage';
import StatsPage from '@/pages/StatsPage';
import LearningMethodsPage from '@/pages/LearningMethodsPage';
import ThemePage from '@/pages/ThemePage';
import AdminPage from '@/pages/AdminPage';
import NotFound from '@/pages/NotFound';

import './App.css';

function App() {
  // Génération des données d'exemple au chargement de l'application
  useEffect(() => {
    generateSampleData();
  }, []);

  return (
    <Router>
      <ToastProvider>
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1 container mx-auto py-8 px-4">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/create" element={<CreatePage />} />
              <Route path="/deck/:id" element={<DeckPage />} />
              <Route path="/edit-deck/:id" element={<EditDeckPage />} />
              <Route path="/my-decks" element={<MyDecksPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/study/:deckId" element={<StudyPage />} />
              <Route path="/deck/:deckId/theme/:themeId/study" element={<StudyPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/import" element={<ImportPage />} />
              <Route path="/share" element={<SharePage />} />
              <Route path="/stats" element={<StatsPage />} />
              <Route path="/learning-methods" element={<LearningMethodsPage />} />
              <Route path="/themes" element={<ThemePage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
          <Toaster />
        </div>
      </ToastProvider>
    </Router>
  );
}

export default App;