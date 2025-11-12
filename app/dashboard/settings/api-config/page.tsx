'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle, Loader2, MessageSquare, Bot } from 'lucide-react';

interface ApiStatus {
  configured: boolean;
  connected: boolean | null;
  loading: boolean;
  error: string | null;
  details?: any;
}

export default function ApiConfigPage() {
  const [anthropicStatus, setAnthropicStatus] = useState<ApiStatus>({
    configured: false,
    connected: null,
    loading: false,
    error: null,
  });

  const [whatsappStatus, setWhatsappStatus] = useState<ApiStatus>({
    configured: false,
    connected: null,
    loading: false,
    error: null,
  });

  // Testar API Anthropic
  const testAnthropicConnection = async () => {
    setAnthropicStatus({ ...anthropicStatus, loading: true, error: null });

    try {
      const response = await fetch('/api/test/anthropic', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setAnthropicStatus({
          configured: true,
          connected: true,
          loading: false,
          error: null,
          details: data,
        });
      } else {
        setAnthropicStatus({
          configured: data.configured || false,
          connected: false,
          loading: false,
          error: data.error || 'Erro ao testar conexão',
        });
      }
    } catch (error) {
      setAnthropicStatus({
        configured: false,
        connected: false,
        loading: false,
        error: 'Erro ao conectar com o servidor',
      });
    }
  };

  // Testar API WhatsApp
  const testWhatsAppConnection = async () => {
    setWhatsappStatus({ ...whatsappStatus, loading: true, error: null });

    try {
      const response = await fetch('/api/test/whatsapp', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setWhatsappStatus({
          configured: true,
          connected: true,
          loading: false,
          error: null,
          details: data,
        });
      } else {
        setWhatsappStatus({
          configured: data.configured || false,
          connected: false,
          loading: false,
          error: data.error || 'Erro ao testar conexão',
        });
      }
    } catch (error) {
      setWhatsappStatus({
        configured: false,
        connected: false,
        loading: false,
        error: 'Erro ao conectar com o servidor',
      });
    }
  };

  const getStatusBadge = (status: ApiStatus) => {
    if (status.loading) {
      return <Badge variant="outline">Testando...</Badge>;
    }
    if (status.connected === null) {
      return <Badge variant="outline">Não testado</Badge>;
    }
    if (status.connected) {
      return <Badge className="bg-green-500">Conectado</Badge>;
    }
    if (!status.configured) {
      return <Badge variant="destructive">Não configurado</Badge>;
    }
    return <Badge variant="destructive">Erro na conexão</Badge>;
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Configuração de APIs</h1>
          <p className="text-muted-foreground">
            Configure e teste as integrações com APIs externas
          </p>
        </div>

        {/* Anthropic API */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Bot className="h-6 w-6 text-purple-600 dark:text-purple-300" />
                </div>
                <div>
                  <CardTitle>Anthropic API (Claude AI)</CardTitle>
                  <CardDescription>
                    IA para análise inteligente de respostas dos pacientes
                  </CardDescription>
                </div>
              </div>
              {getStatusBadge(anthropicStatus)}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Como configurar:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Acesse <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">console.anthropic.com/settings/keys</a></li>
                <li>Crie uma nova API Key</li>
                <li>Adicione a chave no arquivo .env como <code className="bg-muted px-1 py-0.5 rounded">ANTHROPIC_API_KEY</code></li>
                <li>Reinicie o servidor de desenvolvimento</li>
              </ol>
            </div>

            {anthropicStatus.error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{anthropicStatus.error}</AlertDescription>
              </Alert>
            )}

            {anthropicStatus.connected && anthropicStatus.details && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  Conexão bem-sucedida! Modelo: {anthropicStatus.details.model}
                </AlertDescription>
              </Alert>
            )}

            <Button
              onClick={testAnthropicConnection}
              disabled={anthropicStatus.loading}
              className="w-full sm:w-auto"
            >
              {anthropicStatus.loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testando...
                </>
              ) : (
                'Testar Conexão'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* WhatsApp API */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-green-600 dark:text-green-300" />
                </div>
                <div>
                  <CardTitle>WhatsApp Business API</CardTitle>
                  <CardDescription>
                    Envio de mensagens e questionários automáticos
                  </CardDescription>
                </div>
              </div>
              {getStatusBadge(whatsappStatus)}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Como configurar:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Acesse <a href="https://developers.facebook.com/apps/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">developers.facebook.com/apps</a></li>
                <li>Crie um novo app e adicione o produto "WhatsApp Business API"</li>
                <li>Configure um número de telefone de teste</li>
                <li>Obtenha o Phone Number ID e Access Token</li>
                <li>Adicione no arquivo .env:
                  <ul className="list-disc list-inside ml-4 mt-1">
                    <li><code className="bg-muted px-1 py-0.5 rounded">WHATSAPP_PHONE_NUMBER_ID</code></li>
                    <li><code className="bg-muted px-1 py-0.5 rounded">WHATSAPP_ACCESS_TOKEN</code></li>
                    <li><code className="bg-muted px-1 py-0.5 rounded">DOCTOR_PHONE_NUMBER</code></li>
                  </ul>
                </li>
                <li>Reinicie o servidor de desenvolvimento</li>
              </ol>
            </div>

            {whatsappStatus.error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{whatsappStatus.error}</AlertDescription>
              </Alert>
            )}

            {whatsappStatus.connected && whatsappStatus.details && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  Conexão bem-sucedida! Phone Number ID: {whatsappStatus.details.phoneNumberId?.slice(0, 10)}...
                </AlertDescription>
              </Alert>
            )}

            <Button
              onClick={testWhatsAppConnection}
              disabled={whatsappStatus.loading}
              className="w-full sm:w-auto"
            >
              {whatsappStatus.loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testando...
                </>
              ) : (
                'Testar Conexão'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Info adicional */}
        <Alert>
          <AlertDescription>
            <strong>Nota:</strong> As APIs são necessárias para o funcionamento completo do sistema.
            A API Anthropic analisa as respostas dos pacientes e a API WhatsApp envia os questionários automaticamente.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
