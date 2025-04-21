import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { exportLocalStorageToJSON } from '@/utils/exportLocalStorage';
import { Loader2, Database, Download, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function DatabaseMigrationPanel() {
  const [isExporting, setIsExporting] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [exportedData, setExportedData] = useState<string | null>(null);
  const { toast } = useToast();

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const data = await exportLocalStorageToJSON();
      const jsonString = JSON.stringify(data, null, 2);
      setExportedData(jsonString);
      
      // Créer un élément de téléchargement
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'localStorage-backup.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Exportation réussie',
        description: 'Les données ont été exportées avec succès.',
        variant: 'default',
      });
    } catch (error) {
      console.error('Erreur lors de l\'exportation:', error);
      toast({
        title: 'Erreur d\'exportation',
        description: 'Une erreur est survenue lors de l\'exportation des données.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleMigrate = async () => {
    try {
      setIsMigrating(true);
      
      // Appel à l'API pour déclencher la migration
      const response = await fetch('/api/admin/migrate-to-db', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: exportedData || JSON.stringify({ decks: [], themes: [], flashcards: [] }),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la migration');
      }
      
      const result = await response.json();
      
      toast({
        title: 'Migration réussie',
        description: `${result.decks} decks, ${result.themes} thèmes et ${result.flashcards} cartes ont été migrés.`,
        variant: 'default',
      });
    } catch (error) {
      console.error('Erreur lors de la migration:', error);
      toast({
        title: 'Erreur de migration',
        description: 'Une erreur est survenue lors de la migration des données.',
        variant: 'destructive',
      });
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-6 w-6" />
          Migration de la base de données
        </CardTitle>
        <CardDescription>
          Migrer les données de localStorage vers PostgreSQL
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-secondary/20 p-4 rounded-md">
            <h3 className="font-medium mb-2">Étape 1: Exportation des données</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Exportez vos données actuelles du stockage local vers un fichier JSON.
            </p>
            <Button 
              variant="outline" 
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-2"
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Exportation...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Exporter les données
                </>
              )}
            </Button>
          </div>
          
          <div className="bg-secondary/20 p-4 rounded-md">
            <h3 className="font-medium mb-2">Étape 2: Migration vers PostgreSQL</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Migrez vos données exportées vers la base de données PostgreSQL permanente.
            </p>
            <Button 
              variant="default" 
              onClick={handleMigrate}
              disabled={isMigrating || !exportedData}
              className="flex items-center gap-2"
            >
              {isMigrating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Migration en cours...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Migrer vers PostgreSQL
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <p className="text-xs text-muted-foreground">
          Cette opération ne supprimera pas vos données locales existantes.
        </p>
      </CardFooter>
    </Card>
  );
}