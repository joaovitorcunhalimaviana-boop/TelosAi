# Guia de Testes - Sistema de Auto-Save

## 📋 Índice

1. [Testes Manuais Básicos](#testes-manuais-básicos)
2. [Testes de Funcionalidades](#testes-de-funcionalidades)
3. [Testes de Erro](#testes-de-erro)
4. [Testes em Navegadores](#testes-em-navegadores)
5. [Checklist de Validação](#checklist-de-validação)

---

## 🧪 Testes Manuais Básicos

### Teste 1: Auto-Save Básico (2 minutos)

**Objetivo**: Verificar que dados são salvos automaticamente

**Passos**:
1. Acesse `/demo-autosave`
2. Na aba "Formulário Rápido"
3. Digite no campo "Nome Completo": `João Silva`
4. **Aguarde 2-3 segundos sem digitar**
5. Observe o indicador no canto superior direito

**Resultado Esperado**:
- ✅ Indicador muda de "Salvando..." para "Salvo há X segundos"
- ✅ Ícone muda de spinner (🔄) para check verde (✅)
- ✅ Tempo é atualizado a cada segundo

**Se falhar**:
- Verifique console do navegador para erros
- Confirme que localStorage está habilitado
- Verifique se debounceMs está configurado (padrão: 2000ms)

---

### Teste 2: Recuperação de Dados (2 minutos)

**Objetivo**: Verificar que dados são recuperados ao recarregar

**Passos**:
1. Acesse `/demo-autosave`
2. Preencha todos os campos:
   - Nome: `Maria Santos`
   - WhatsApp: `(11) 98765-4321`
   - Email: `maria@email.com`
   - Tipo de Cirurgia: `Fístula Anal`
   - Data: `2025-11-10`
3. **Aguarde 2 segundos** (ver "Salvo")
4. **Recarregue a página (F5)**

**Resultado Esperado**:
- ✅ Toast aparece: "Dados recuperados - Seus dados foram recuperados (salvos há X minutos)"
- ✅ Todos os campos estão preenchidos com os valores anteriores
- ✅ Indicador mostra "Salvo há X minutos"

**Se falhar**:
- Verifique se `onRecover` callback está implementado
- Confira localStorage no DevTools (F12 > Application > Local Storage)
- Procure chave `autosave_demo-quick-form`

---

### Teste 3: Save on Blur (1 minuto)

**Objetivo**: Verificar que dados são salvos ao sair do campo

**Passos**:
1. Acesse `/demo-autosave`
2. Clique no campo "Nome Completo"
3. Digite: `Pedro`
4. **Clique fora do campo** (sem esperar 2 segundos)
5. Observe o indicador

**Resultado Esperado**:
- ✅ Imediatamente mostra "Salvando..."
- ✅ Muda para "Salvo" em ~100ms
- ✅ Não precisa esperar os 2 segundos do debounce

**Se falhar**:
- Verifique se `onBlur={saveNow}` está no input
- Confira se `saveNow` está sendo chamado

---

### Teste 4: Wizard Multi-Step (3 minutos)

**Objetivo**: Verificar que wizard salva estado e recupera posição

**Passos**:
1. Acesse `/demo-autosave`
2. Vá para aba "Wizard Multi-Step"
3. **Etapa 1**: Preencha:
   - Nome: `Carlos Oliveira`
   - Email: `carlos@email.com`
   - Telefone: `(21) 99999-8888`
4. Clique em "Próximo"
5. **Etapa 2**: Preencha:
   - Tipo de Cirurgia: `Hemorroidectomia`
   - Data: `2025-11-11`
   - Alergias: `Nenhuma`
6. **Aguarde 2 segundos** (ver "Salvo")
7. **Recarregue a página (F5)**

**Resultado Esperado**:
- ✅ Toast: "Dados recuperados"
- ✅ **Volta para Etapa 2** (não para Etapa 1!)
- ✅ Todos os campos da Etapa 1 e 2 estão preenchidos
- ✅ Barra de progresso mostra "Passo 2 de 3"

**Se falhar**:
- Verifique se `currentStep` está sendo salvo junto com os dados
- Confira se `onRecover` está restaurando o step correto
- Veja localStorage para confirmar estrutura dos dados

---

### Teste 5: Limpeza Após Submissão (2 minutos)

**Objetivo**: Verificar que dados são limpos após sucesso

**Passos**:
1. Acesse `/demo-autosave`
2. Preencha o formulário rápido completamente
3. **Aguarde 2 segundos** (ver "Salvo")
4. Clique em "ATIVAR ACOMPANHAMENTO"
5. Aguarde a submissão (simulada)
6. Veja a mensagem de sucesso (card verde)
7. **Recarregue a página (F5)**

**Resultado Esperado**:
- ✅ **NÃO** aparece toast "Dados recuperados"
- ✅ Formulário está vazio
- ✅ Indicador não mostra nenhuma mensagem
- ✅ localStorage não tem dados salvos (verificar no DevTools)

**Se falhar**:
- Verifique se `clearSaved()` está sendo chamado no `handleSubmit`
- Confirme que está sendo chamado **apenas** em caso de sucesso
- Verifique localStorage para confirmar que a chave foi removida

---

## 🔬 Testes de Funcionalidades

### Teste 6: Debounce (2 minutos)

**Objetivo**: Confirmar que debounce está funcionando

**Passos**:
1. Acesse `/demo-autosave`
2. Abra DevTools (F12) > Console
3. Cole e execute:
```javascript
// Monitorar chamadas de localStorage.setItem
const originalSetItem = localStorage.setItem
let saveCount = 0
localStorage.setItem = function(...args) {
  saveCount++
  console.log(`Save #${saveCount}:`, args[0])
  return originalSetItem.apply(this, args)
}
```
4. Digite rapidamente no campo Nome: `abcdefghijklmnop` (15 teclas)
5. **Aguarde 3 segundos**
6. Verifique o console

**Resultado Esperado**:
- ✅ Console mostra apenas **1 ou 2 saves** (não 15!)
- ✅ Primeira mensagem: `Save #1: autosave_demo-quick-form`
- ✅ Debounce está agrupando as mudanças

**Se falhar**:
- Está salvando em cada tecla
- Debounce não está configurado
- Verifique `debounceMs` no hook

---

### Teste 7: Versionamento (2 minutos)

**Objetivo**: Verificar estrutura de dados salvos

**Passos**:
1. Acesse `/demo-autosave`
2. Preencha alguns campos
3. Aguarde o save
4. Abra DevTools (F12) > Application > Local Storage
5. Selecione o domínio (localhost)
6. Encontre chave `autosave_demo-quick-form`
7. Clique para ver o valor

**Resultado Esperado**:
```json
{
  "version": "1.0.0",
  "timestamp": "2025-11-11T10:30:45.123Z",
  "data": {
    "name": "João Silva",
    "phone": "(11) 98765-4321",
    ...
  }
}
```

- ✅ Tem campo `version`
- ✅ Tem campo `timestamp` (formato ISO 8601)
- ✅ Tem campo `data` com os dados do formulário
- ✅ JSON está bem formatado

**Se falhar**:
- Estrutura incorreta
- Faltam campos obrigatórios
- Verifique implementação em `useAutoSave.ts`

---

### Teste 8: Tempo Relativo (1 minuto)

**Objetivo**: Verificar que "há X segundos" atualiza em tempo real

**Passos**:
1. Acesse `/demo-autosave`
2. Preencha um campo e aguarde o save
3. **Observe o indicador por 1 minuto**

**Resultado Esperado**:
- ✅ 0-4s: "Salvo agora mesmo"
- ✅ 5-59s: "Salvo há 5 segundos", "há 6 segundos", etc.
- ✅ 60s+: "Salvo há 1 minuto", "há 2 minutos", etc.
- ✅ Atualiza automaticamente a cada segundo

**Se falhar**:
- Tempo não atualiza
- Formato incorreto
- Verifique `AutoSaveIndicator.tsx` (useEffect com interval)

---

## 🛡️ Testes de Erro

### Teste 9: QuotaExceededError (2 minutos)

**Objetivo**: Verificar tratamento de localStorage cheio

**Passos**:
1. Abra DevTools (F12) > Console
2. Execute o seguinte código para encher o localStorage:
```javascript
// Encher localStorage (cuidado! Vai consumir ~5MB)
const fillStorage = () => {
  try {
    let i = 0
    while (true) {
      localStorage.setItem('dummy_' + i, 'x'.repeat(100000))
      i++
    }
  } catch (e) {
    console.log('localStorage cheio!')
  }
}
fillStorage()
```
3. Tente usar o auto-save normalmente
4. Preencha um campo

**Resultado Esperado**:
- ✅ Toast de erro aparece
- ✅ Mensagem: "Erro ao salvar - Espaço de armazenamento insuficiente. Limpe o cache do navegador."
- ✅ Formulário continua funcionando (não quebra)
- ✅ Console mostra erro mas está tratado

**Limpar após teste**:
```javascript
// Limpar localStorage
for (let i = 0; i < 100; i++) {
  localStorage.removeItem('dummy_' + i)
}
```

**Se falhar**:
- App quebra com erro não tratado
- Nenhuma mensagem ao usuário
- Verifique try/catch no `saveToLocalStorage`

---

### Teste 10: Dados Corrompidos (2 minutos)

**Objetivo**: Verificar tratamento de JSON inválido

**Passos**:
1. Acesse `/demo-autosave`
2. Preencha e aguarde o save
3. Abra DevTools > Application > Local Storage
4. Edite manualmente a chave `autosave_demo-quick-form`
5. Troque o valor por: `{invalid json!!!`
6. **Recarregue a página**

**Resultado Esperado**:
- ✅ **NÃO** quebra a aplicação
- ✅ **NÃO** aparece toast de recuperação
- ✅ Formulário inicia vazio
- ✅ Console mostra erro: "Error reading from localStorage"
- ✅ App funciona normalmente

**Se falhar**:
- App quebra com erro de parsing
- Tela branca
- Verifique try/catch no `getSavedData`

---

### Teste 11: localStorage Desabilitado (1 minuto)

**Objetivo**: Verificar graceful degradation

**Passos**:
1. Abra modo anônimo/privado do navegador
2. Alguns navegadores bloqueiam localStorage em modo privado
3. Ou use DevTools para simular:
```javascript
// Simular localStorage desabilitado
Object.defineProperty(window, 'localStorage', {
  get: function() { throw new Error('localStorage disabled') }
})
```
4. Tente usar o formulário

**Resultado Esperado**:
- ✅ Formulário funciona (modo degradado)
- ✅ Não quebra a aplicação
- ✅ Apenas auto-save não funciona
- ✅ Console mostra avisos mas app continua

**Se falhar**:
- App quebra completamente
- Verifique todos os try/catch

---

## 🌐 Testes em Navegadores

### Teste 12: Compatibilidade Multi-Browser (5 minutos)

**Navegadores para testar**:
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari (macOS)
- ✅ Mobile Chrome (Android)
- ✅ Mobile Safari (iOS)

**Passos** (repetir em cada navegador):
1. Acesse `/demo-autosave`
2. Preencha formulário
3. Aguarde save
4. Recarregue
5. Confirme recuperação

**Resultado Esperado**:
- ✅ Funciona identicamente em todos
- ✅ Velocidade similar
- ✅ Sem erros específicos de browser

**Problemas Conhecidos**:
- Safari pode ter limite menor de localStorage (~5MB vs 10MB)
- Mobile pode ter restrições de espaço
- Modo privado pode bloquear storage

---

## ✅ Checklist de Validação

### Funcionalidades Core
- [ ] Auto-save debounced funciona (Teste 1)
- [ ] Recuperação ao recarregar (Teste 2)
- [ ] Save on blur funciona (Teste 3)
- [ ] Wizard salva e recupera step (Teste 4)
- [ ] Limpeza após submissão (Teste 5)

### Performance
- [ ] Debounce agrupa saves (Teste 6)
- [ ] Não salva em cada tecla
- [ ] Indicador atualiza suavemente

### Formato de Dados
- [ ] Versionamento correto (Teste 7)
- [ ] Timestamp válido
- [ ] Estrutura JSON correta

### UI/UX
- [ ] Indicador visual funciona (Teste 1)
- [ ] Tempo relativo atualiza (Teste 8)
- [ ] Toast de recuperação aparece (Teste 2)
- [ ] Estados visuais claros (salvando/salvo)

### Tratamento de Erros
- [ ] QuotaExceededError tratado (Teste 9)
- [ ] Dados corrompidos tratados (Teste 10)
- [ ] localStorage desabilitado tratado (Teste 11)
- [ ] App não quebra com erros

### Compatibilidade
- [ ] Chrome/Edge funciona (Teste 12)
- [ ] Firefox funciona
- [ ] Safari funciona (se disponível)
- [ ] Mobile funciona

---

## 🔍 Debugging

### Verificar localStorage no DevTools

**Chrome/Edge/Firefox**:
1. F12 > Application (ou Storage)
2. Local Storage > seu domínio
3. Procure chaves começando com `autosave_`

### Console Útil

```javascript
// Ver todos os dados de auto-save
Object.keys(localStorage)
  .filter(key => key.startsWith('autosave_'))
  .forEach(key => {
    console.log(key, JSON.parse(localStorage.getItem(key)))
  })

// Limpar todos os auto-saves
Object.keys(localStorage)
  .filter(key => key.startsWith('autosave_'))
  .forEach(key => localStorage.removeItem(key))

// Ver tamanho total do localStorage
const size = new Blob(Object.values(localStorage)).size
console.log(`localStorage: ${(size / 1024).toFixed(2)} KB`)
```

### Logs do Hook

O hook `useAutoSave` já loga informações importantes:
- ✅ Erros de save
- ✅ Versão incompatível
- ✅ Parsing errors

Abra o console para ver esses logs.

---

## 📊 Métricas de Sucesso

### Todos os testes passando:
- ✅ 12/12 testes manuais funcionando
- ✅ 0 erros não tratados
- ✅ Funciona em 3+ navegadores
- ✅ Dados são preservados e recuperados
- ✅ Performance é aceitável (save < 100ms)

### Se < 10 testes passarem:
- ⚠️ Revisar implementação
- ⚠️ Verificar console para erros
- ⚠️ Consultar documentação

---

## 🚨 Problemas Comuns

### "Dados não são salvos"
**Solução**: Verifique se o objeto está mudando (criar novo objeto, não mutar)

### "Recuperação não funciona"
**Solução**: Implemente `onRecover` callback

### "Save acontece em cada tecla"
**Solução**: Não force `saveNow()` no onChange, deixe o debounce agir

### "Dados permanecem após submissão"
**Solução**: Chame `clearSaved()` após submit bem-sucedido

### "localStorage cheio"
**Solução**: Implemente limpeza periódica ou compressão de dados

---

## 📝 Reportar Problemas

Se encontrar bugs:

1. **Anote**:
   - Navegador e versão
   - Passos para reproduzir
   - Resultado esperado vs obtido
   - Erros no console

2. **Verifique**:
   - localStorage está habilitado
   - Não está em modo privado
   - Tem espaço suficiente

3. **Documente**:
   - Screenshots
   - Dados do localStorage
   - Mensagens de erro completas

---

**Última atualização**: 11/11/2025
**Versão dos testes**: 1.0.0
