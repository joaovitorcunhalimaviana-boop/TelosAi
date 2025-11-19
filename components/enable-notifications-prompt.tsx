'use client';

/**
 * Enable Notifications Prompt Component
 * Modal bonito pedindo permissão para ativar notificações push
 */

import { useState, useEffect } from 'react';
import { Bell, X, Check } from 'lucide-react';
import {
  isPushNotificationSupported,
  getNotificationPermission,
  subscribeToPush,
  isSubscribedToPush,
  sendTestNotification,
} from '@/lib/push-notifications';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const STORAGE_KEY = 'notifications-prompt-dismissed';
const STORAGE_ENABLED_KEY = 'notifications-enabled';

export function EnableNotificationsPrompt() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [alreadySubscribed, setAlreadySubscribed] = useState(false);

  useEffect(() => {
    checkNotificationStatus();
  }, []);

  async function checkNotificationStatus() {
    // Verificar suporte
    const supported = isPushNotificationSupported();
    setIsSupported(supported);

    if (!supported) {
      return;
    }

    // Verificar se já está inscrito
    const subscribed = await isSubscribedToPush();
    setAlreadySubscribed(subscribed);

    // Verificar se já foi dispensado ou ativado
    const dismissed = localStorage.getItem(STORAGE_KEY);
    const enabled = localStorage.getItem(STORAGE_ENABLED_KEY);

    // Se já ativou ou já está inscrito, não mostrar
    if (enabled === 'true' || subscribed) {
      return;
    }

    // Se foi dispensado há menos de 7 dias, não mostrar
    if (dismissed) {
      const dismissedDate = new Date(dismissed);
      const daysSinceDismissed = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        return;
      }
    }

    // Verificar permissão atual
    const permission = getNotificationPermission();

    // Se foi negada, não mostrar (usuário precisa habilitar manualmente)
    if (permission === 'denied') {
      return;
    }

    // Se já foi concedida mas não está inscrito, inscrever automaticamente
    if (permission === 'granted' && !subscribed) {
      await handleEnableNotifications();
      return;
    }

    // Mostrar prompt após 5 segundos (para não ser invasivo)
    setTimeout(() => {
      setOpen(true);
    }, 5000);
  }

  async function handleEnableNotifications() {
    setLoading(true);
    try {
      await subscribeToPush();

      // Marcar como ativado
      localStorage.setItem(STORAGE_ENABLED_KEY, 'true');

      // Enviar notificação de teste
      try {
        await sendTestNotification();
        toast.success('Notificações ativadas com sucesso!', {
          description: 'Você receberá alertas importantes sobre seus pacientes.',
        });
      } catch (error) {
        toast.success('Notificações ativadas!', {
          description: 'Você receberá alertas importantes sobre seus pacientes.',
        });
      }

      setOpen(false);
      setAlreadySubscribed(true);
    } catch (error: any) {
      console.error('Error enabling notifications:', error);

      if (error.message.includes('negada')) {
        toast.error('Permissão negada', {
          description: 'Por favor, habilite as notificações nas configurações do navegador.',
        });
      } else {
        toast.error('Erro ao ativar notificações', {
          description: 'Tente novamente mais tarde.',
        });
      }
    } finally {
      setLoading(false);
    }
  }

  function handleDismiss() {
    // Salvar data de dispensa
    localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    setOpen(false);

    toast.info('Você pode ativar as notificações depois nas configurações', {
      duration: 5000,
    });
  }

  // Não renderizar se não for suportado ou já estiver inscrito
  if (!isSupported || alreadySubscribed) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
            <Bell className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <DialogTitle className="text-center text-xl">
            Ativar Notificações Push
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Receba alertas importantes em tempo real sobre seus pacientes
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <BenefitItem
              icon={<Bell className="h-5 w-5" />}
              title="Red Flags Detectados"
              description="Seja alertado imediatamente quando um paciente reportar sintomas preocupantes"
            />
            <BenefitItem
              icon={<Check className="h-5 w-5" />}
              title="Respostas de Pacientes"
              description="Receba notificação quando um paciente responder ao questionário"
            />
            <BenefitItem
              icon={<Bell className="h-5 w-5" />}
              title="Funciona Offline"
              description="Notificações chegam mesmo com o app fechado ou dispositivo em standby"
            />
          </div>

          <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/10">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <strong>Privacidade:</strong> Suas notificações são criptografadas e apenas
              você as receberá. Você pode desativar a qualquer momento.
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={handleDismiss}
            className="w-full sm:w-auto"
          >
            Agora Não
          </Button>
          <Button
            onClick={handleEnableNotifications}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading ? 'Ativando...' : 'Ativar Notificações'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function BenefitItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
        {icon}
      </div>
      <div className="flex-1">
        <h4 className="font-medium text-sm">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
