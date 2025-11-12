# Guia de Uso Mobile - Sistema Pós-Operatório

## Instalação como Aplicativo

### iOS (iPhone/iPad)

1. **Abra o Safari** (deve ser o Safari, outros navegadores não suportam instalação de PWA)
2. Acesse: `https://seu-dominio.com`
3. Toque no botão de **Compartilhar** (ícone de quadrado com seta para cima) na barra inferior
4. Role para baixo e toque em **"Adicionar à Tela Inicial"**
5. Edite o nome se desejar (sugestão: "Pós-Op")
6. Toque em **"Adicionar"**

**Pronto!** O ícone do app aparecerá na sua tela inicial.

#### Características no iOS:
- ✅ Funciona offline
- ✅ Tela cheia (sem barras do navegador)
- ✅ Sincronização automática quando online
- ✅ Notificações (se habilitadas)
- ✅ Ícone personalizado na tela inicial

---

### Android (Chrome)

1. **Abra o Chrome**
2. Acesse: `https://seu-dominio.com`
3. Aguarde alguns segundos - um popup aparecerá automaticamente
4. Toque em **"Instalar"** ou **"Adicionar à tela inicial"**

**Alternativa manual:**
1. Toque nos três pontos (⋮) no canto superior direito
2. Selecione **"Instalar app"** ou **"Adicionar à tela inicial"**
3. Confirme tocando em **"Instalar"**

**Pronto!** O app aparecerá na gaveta de aplicativos.

#### Características no Android:
- ✅ Funciona offline
- ✅ Aparece na gaveta de apps
- ✅ Tela cheia
- ✅ Sincronização em segundo plano
- ✅ Notificações (se habilitadas)

---

## Funcionalidade Offline

### Como Funciona

O sistema foi projetado para funcionar mesmo sem conexão com a internet, ideal para dias cirúrgicos corridos.

#### O que funciona offline:
- ✅ **Cadastro de pacientes** - Dados são salvos localmente
- ✅ **Visualização de páginas** - Páginas carregadas anteriormente
- ✅ **Formulários** - Todos os campos funcionam normalmente
- ✅ **Templates** - Acessíveis se carregados anteriormente

#### O que NÃO funciona offline:
- ❌ **IA/Análise** - Requer conexão para processar
- ❌ **Sincronização** - Aguarda conexão para enviar dados
- ❌ **Busca em tempo real** - Apenas dados em cache

### Usando Offline

#### 1. Cadastrar Paciente Offline

```
1. Abra o app (mesmo sem internet)
2. Vá para "Cadastro Express"
3. Preencha os dados normalmente
4. Toque em "Salvar"
```

**O que acontece:**
- ✅ Dados são salvos no dispositivo (IndexedDB)
- ✅ Aparece notificação: "Salvo offline - será sincronizado quando online"
- ✅ Contador mostra quantos pacientes estão pendentes

#### 2. Quando Voltar Online

**Sincronização Automática:**
- O sistema detecta automaticamente quando você volta online
- Após 2 segundos, tenta sincronizar dados pendentes
- Notificação aparece: "Sincronizando X pacientes..."
- Quando completo: "Sincronização concluída!"

**Sincronização Manual:**
- Toque no banner de "X pacientes pendentes"
- Toque em "Sincronizar"
- Aguarde confirmação

#### 3. Verificar Status

**Indicador de Status:**
- 🟢 **Bola verde** = Online e sincronizado
- 🟠 **Bola laranja** = Offline
- 🔵 **Bola azul** = Online com dados pendentes

**Ver Detalhes:**
- Número de pacientes pendentes aparece no topo
- Toque para ver lista completa
- Cada paciente mostra status (pendente/sincronizado)

---

## Navegação Mobile

### Menu Inferior (Bottom Nav)

O menu inferior facilita navegação com uma mão:

- 🏠 **Dashboard** - Visualizar pacientes
- ➕ **Cadastro** - Cadastro express rápido
- 📄 **Termos** - Templates e termos
- ☰ **Mais** - Menu adicional

### Gestos

- **Puxar para baixo** - Atualizar página (pull-to-refresh)
- **Tocar** - Seleção (mínimo 44x44px para facilitar)
- **Rolar** - Navegação vertical otimizada

---

## Otimizações Mobile

### Entrada de Dados

#### Teclados Otimizados:
- 📱 **Telefone** - Abre teclado numérico
- 📅 **Data** - Abre seletor de data nativo
- ⏰ **Hora** - Abre seletor de hora nativo
- 🔤 **Texto** - Teclado normal
- 🔢 **Número** - Teclado numérico

#### Campos Auto-completados:
- Nome usa capitalização automática
- Telefone com máscara automática
- Data em formato brasileiro

### Performance

#### Carregamento Rápido:
- ⚡ First Load: < 2s
- ⚡ Navegação: < 0.5s
- ⚡ Formulários: Resposta instantânea

#### Economia de Dados:
- 📦 Compressão automática
- 🖼️ Imagens otimizadas (WebP)
- 💾 Cache inteligente

---

## Dicas de Uso

### Durante Cirurgias

**Antes de entrar no centro cirúrgico:**
1. Abra o app uma vez para carregar páginas essenciais
2. Verifique se está instalado (ícone na tela inicial)
3. Teste cadastrar um paciente para validar

**Durante o dia cirúrgico:**
1. Use o app normalmente, mesmo sem internet
2. Cadastre pacientes conforme necessário
3. Não se preocupe com sincronização

**Ao final do dia:**
1. Conecte ao WiFi
2. Aguarde sincronização automática
3. Verifique se contador de pendentes está em 0

### Economia de Bateria

- Use modo escuro (se disponível)
- Feche outros apps em segundo plano
- Ative modo avião se não precisar de chamadas
- Sincronize em WiFi quando possível

### Gerenciar Armazenamento

**Ver espaço usado:**
1. Vá para Configurações do navegador/app
2. Procure "Armazenamento" ou "Storage"
3. Veja quanto espaço o app usa

**Limpar dados antigos:**
1. Sincronize tudo primeiro
2. Vá para "Mais" > "Configurações"
3. "Limpar dados sincronizados"
4. Confirme (não afeta dados no servidor)

---

## Troubleshooting

### App não instala

**iOS:**
- ✅ Use Safari (outros navegadores não funcionam)
- ✅ Aguarde 30 segundos após abrir a página
- ✅ Verifique se o popup de instalação apareceu
- ✅ Tente método manual (compartilhar > adicionar)

**Android:**
- ✅ Use Chrome (navegador padrão)
- ✅ Atualize o Chrome para última versão
- ✅ Limpe cache do Chrome
- ✅ Tente método manual (menu > instalar app)

### Sincronização não funciona

**Passos de diagnóstico:**
1. ✅ Verifique se está realmente online (abra outro site)
2. ✅ Force sincronização tocando no banner
3. ✅ Verifique se há erros específicos
4. ✅ Tente recarregar a página
5. ✅ Em último caso, feche e reabra o app

**Se persistir:**
- Anote os dados pendentes (faça screenshot)
- Entre em contato com suporte
- Não limpe os dados até resolver

### Dados não aparecem

**Cache desatualizado:**
1. Puxe para baixo para atualizar (pull-to-refresh)
2. Ou toque em "Atualizar" no menu
3. Verifique data/hora da última atualização

**Conexão intermitente:**
1. Aguarde conexão estabilizar
2. Force atualização manual
3. Verifique se sincronização completou

### Performance lenta

**Limpeza:**
1. Sincronize dados pendentes
2. Limpe dados antigos sincronizados
3. Limpe cache do navegador
4. Reinicie o app

**Dispositivo:**
1. Feche outros apps
2. Reinicie o telefone
3. Atualize sistema operacional
4. Verifique espaço disponível (mín. 500MB)

---

## Página de Teste

Para testar funcionalidade offline e debugar problemas:

**Acesse:** `https://seu-dominio.com/offline-test.html`

**Recursos:**
- ✅ Verificar status do Service Worker
- ✅ Testar IndexedDB
- ✅ Simular cadastro offline
- ✅ Ver pacientes pendentes
- ✅ Forçar sincronização
- ✅ Gerenciar cache manualmente
- ✅ Ver logs detalhados

---

## Atualizações do App

### Como Atualizar

**Atualizações automáticas:**
- Sistema verifica updates a cada hora
- Quando disponível, aparece notificação
- Toque "Atualizar" para aplicar

**Atualização manual:**
1. Feche completamente o app
2. Reabra
3. Aguarde alguns segundos
4. Aceite popup de atualização se aparecer

### Forçar Atualização

**Se a atualização não aparecer:**
1. Feche o app completamente
2. Limpe cache do navegador
3. Reabra o app
4. Aguarde nova versão baixar

---

## Segurança e Privacidade

### Dados Locais

- 🔒 Dados ficam apenas no seu dispositivo
- 🔒 Criptografados pelo sistema operacional
- 🔒 Não acessíveis por outros apps
- 🔒 Apagados se desinstalar o app

### Sincronização

- 🔒 Conexão HTTPS criptografada
- 🔒 Autenticação obrigatória
- 🔒 Dados validados antes de enviar
- 🔒 Log de todas as operações

### Boas Práticas

- ✅ Use PIN/biometria no celular
- ✅ Não deixe app aberto em público
- ✅ Sincronize em rede confiável (WiFi hospitalar)
- ✅ Faça logout ao final do expediente (se implementado)

---

## Suporte

### Contato

- 📧 Email: suporte@exemplo.com
- 📱 WhatsApp: (11) 98765-4321
- 🕐 Horário: Segunda a Sexta, 8h-18h

### Logs para Suporte

Se precisar enviar informações para diagnóstico:

1. Acesse: `/offline-test.html`
2. Role até "Log de Atividades"
3. Copie o log completo
4. Envie junto com descrição do problema

**Nunca compartilhe:**
- ❌ Senhas
- ❌ Tokens de acesso
- ❌ Dados de pacientes identificáveis

---

## Recursos Futuros

### Em Desenvolvimento

- 🔄 Notificações push para lembretes
- 🔄 Widget de tela inicial (Android)
- 🔄 Atalhos 3D Touch (iOS)
- 🔄 Compartilhamento de templates
- 🔄 Modo escuro automático
- 🔄 Backup automático em nuvem

### Sugestões

Tem ideias para melhorar o app mobile? Entre em contato!

---

**Versão do Guia:** 1.0.0
**Última Atualização:** 2025-01-09
**Compatibilidade:** iOS 12+, Android 8+
