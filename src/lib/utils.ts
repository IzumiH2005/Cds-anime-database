import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combine plusieurs classes CSS avec clsx et tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formate une date en chaîne lisible
 */
export function formatDate(date: Date | string): string {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
}

/**
 * Tronque un texte s'il dépasse une certaine longueur
 */
export function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Génère une couleur aléatoire
 */
export function getRandomColor(): string {
  const colors = [
    'bg-red-100', 'bg-yellow-100', 'bg-green-100', 'bg-blue-100', 'bg-indigo-100', 'bg-purple-100', 'bg-pink-100',
    'bg-teal-100', 'bg-orange-100', 'bg-cyan-100'
  ];
  
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Détermine si l'appareil est mobile
 */
export function isMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
}

/**
 * Vérifie si l'URL est une image
 */
export function isImageUrl(url: string): boolean {
  if (!url) return false;
  return /\.(jpeg|jpg|gif|png|svg|webp)$/i.test(url);
}

/**
 * Calcule le temps de lecture d'un texte
 */
export function getReadingTime(text: string): number {
  const wordsPerMinute = 200;
  const wordCount = text.trim().split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Extrait le nom d'utilisateur d'une adresse email
 */
export function getUsernameFromEmail(email: string): string {
  return email.split('@')[0];
}

/**
 * Génère un avatar à partir d'un nom
 */
export function generateAvatar(name: string): string {
  // Utilise le service DiceBear pour générer un avatar
  return `https://api.dicebear.com/7.x/micah/svg?seed=${encodeURIComponent(name)}`;
}

/**
 * Délai pour pause asynchrone
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}