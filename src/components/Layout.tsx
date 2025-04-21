import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Layers, Home, Settings, Database, Book } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-primary text-primary-foreground border-b shadow-sm py-3">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 text-xl font-semibold">
            <Book className="h-6 w-6" />
            <span>Flashcards d'Anime</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="flex items-center gap-1 text-sm font-medium hover:text-white/80 transition-colors">
              <Home className="h-4 w-4" />
              Accueil
            </Link>
            <Link to="/decks" className="flex items-center gap-1 text-sm font-medium hover:text-white/80 transition-colors">
              <Layers className="h-4 w-4" />
              Mes decks
            </Link>
            <Link to="/public" className="flex items-center gap-1 text-sm font-medium hover:text-white/80 transition-colors">
              <BookOpen className="h-4 w-4" />
              Explorer
            </Link>
            <Link to="/admin" className="flex items-center gap-1 text-sm font-medium hover:text-white/80 transition-colors">
              <Settings className="h-4 w-4" />
              Admin
            </Link>
          </nav>
          
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm">
              Connexion
            </Button>
          </div>
        </div>
      </header>
      
      <main className="flex-grow bg-background">
        {children}
      </main>
      
      <footer className="bg-muted py-6 border-t">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Book className="h-5 w-5 text-primary" />
              <span className="font-semibold">Flashcards d'Anime</span>
            </div>
            
            <div className="flex gap-4 text-sm text-muted-foreground">
              <Link to="/admin" className="hover:text-foreground transition-colors flex items-center gap-1">
                <Database className="h-3.5 w-3.5" />
                Administration
              </Link>
              <span>© 2025</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}