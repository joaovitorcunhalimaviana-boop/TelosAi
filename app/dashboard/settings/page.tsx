"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CollectiveIntelligenceSettings } from "@/components/settings/CollectiveIntelligenceSettings"
import { Settings, Brain, Webhook } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Configurações</h1>
            <p className="text-muted-foreground">
              Gerencie suas preferências e integrações
            </p>
          </div>
        </div>

        <Tabs defaultValue="collective-intelligence" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="collective-intelligence" className="gap-2">
              <Brain className="h-4 w-4" />
              Inteligência Coletiva
            </TabsTrigger>
            <TabsTrigger value="apis" className="gap-2">
              <Webhook className="h-4 w-4" />
              Integrações (APIs)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="collective-intelligence" className="space-y-6">
            <CollectiveIntelligenceSettings />
          </TabsContent>

          <TabsContent value="apis" className="space-y-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Configure as integrações com APIs externas (Claude AI e WhatsApp)
              </p>
              <Link href="/dashboard/settings/api-config">
                <Button>
                  <Webhook className="mr-2 h-4 w-4" />
                  Ir para Configuração de APIs
                </Button>
              </Link>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
