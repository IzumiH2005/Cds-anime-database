import { useState, useEffect } from 'react';

/**
 * Hook pour détecter si l'appareil est un mobile
 * @param breakpoint Largeur en pixels en dessous de laquelle l'appareil est considéré comme mobile
 * @returns Boolean indiquant si l'appareil est mobile
 */
export default function useMobile(breakpoint: number = 768) {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    // Fonction pour vérifier la taille de l'écran
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };
    
    // Vérifier au chargement
    checkIfMobile();
    
    // Ajouter un écouteur d'événement pour le redimensionnement
    window.addEventListener('resize', checkIfMobile);
    
    // Nettoyer l'écouteur d'événement
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, [breakpoint]);

  return isMobile;
}