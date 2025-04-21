import React from 'react';
import { Layout } from '@/components/Layout';
import { DatabaseMigrationPanel } from '@/components/admin/DatabaseMigrationPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, Settings, Server } from 'lucide-react';

export default function AdminPage() {
  return (
    <Layout>
      <div className="container py-8">
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Administration</h1>
            <p className="text-muted-foreground">
              Gérez les paramètres et fonctionnalités avancées de l'application.
            </p>
          </div>

          <Tabs defaultValue="database" className="w-full">
            <TabsList className="w-full md:w-auto bg-muted/60 p-1 mb-6">
              <TabsTrigger value="database" className="flex items-center gap-2 px-4 py-2">
                <Database className="h-4 w-4" />
                <span>Base de données</span>
              </TabsTrigger>
              <TabsTrigger value="system" className="flex items-center gap-2 px-4 py-2">
                <Server className="h-4 w-4" />
                <span>Système</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2 px-4 py-2">
                <Settings className="h-4 w-4" />
                <span>Paramètres</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="database" className="space-y-6">
              <div className="grid gap-6">
                <div className="flex flex-col gap-1 mb-4">
                  <h2 className="text-xl font-semibold">Gestion de la base de données</h2>
                  <p className="text-muted-foreground text-sm">
                    Migrez les données de localStorage vers PostgreSQL et gérez la base de données.
                  </p>
                </div>

                <DatabaseMigrationPanel />
              </div>
            </TabsContent>

            <TabsContent value="system" className="space-y-6">
              <div className="flex flex-col gap-1 mb-4">
                <h2 className="text-xl font-semibold">Informations système</h2>
                <p className="text-muted-foreground text-sm">
                  Consultez les informations sur le système et l'environnement d'exécution.
                </p>
              </div>

              <div className="grid gap-4 p-6 border rounded-lg bg-card">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium mb-1">Version de l'application</h3>
                    <p className="text-sm text-muted-foreground">1.0.0</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-1">Environnement</h3>
                    <p className="text-sm text-muted-foreground">Production</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-1">Base de données</h3>
                    <p className="text-sm text-muted-foreground">PostgreSQL</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-1">Mode de stockage</h3>
                    <p className="text-sm text-muted-foreground">Migration disponible</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <div className="flex flex-col gap-1 mb-4">
                <h2 className="text-xl font-semibold">Paramètres avancés</h2>
                <p className="text-muted-foreground text-sm">
                  Configurez les paramètres avancés de l'application.
                </p>
              </div>

              <div className="grid gap-4 p-6 border rounded-lg bg-card">
                <p className="text-sm text-muted-foreground italic">
                  Les paramètres avancés seront disponibles dans une future mise à jour.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}