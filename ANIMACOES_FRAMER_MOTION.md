# Animações Framer Motion - Sistema de Pesquisa Pós-Operatório

## Visão Geral

Sistema de animações implementado usando **Framer Motion v12.23.24** para melhorar a experiência do usuário (UX) no dashboard médico e páginas de comparação de pesquisa.

## Princípios de Design

### 1. Sutileza
- Duração: 200-400ms para a maioria das animações
- Animações não devem distrair do conteúdo principal
- Focadas em melhorar a compreensão, não em chamar atenção

### 2. Suavidade
- Uso de curvas ease-out: `[0.25, 0.1, 0.25, 1]`
- Transições naturais entre estados
- Movimento consistente em todo o sistema

### 3. Performance
- Apenas propriedades `transform` e `opacity` animadas
- Evita reflows/repaints desnecessários
- Otimizado para 60fps

### 4. Acessibilidade
- Respeita preferência do usuário: `prefers-reduced-motion`
- Alternativas sem animação quando necessário
- Não causa motion sickness

## Componentes de Animação Criados

### 1. FadeIn
**Arquivo:** `components/animations/FadeIn.tsx`

**Uso:**
```tsx
<FadeIn delay={0.2} duration={0.4} direction="up">
  <Card>Conteúdo</Card>
</FadeIn>
```

**Props:**
- `delay`: Atraso antes da animação iniciar (segundos)
- `duration`: Duração da animação (segundos)
- `direction`: Direção do slide (`'up' | 'down' | 'left' | 'right' | 'none'`)

**Casos de Uso:**
- Seções inteiras do dashboard
- Cards individuais
- Elementos que aparecem após carregamento

### 2. SlideIn
**Arquivo:** `components/animations/SlideIn.tsx`

**Uso:**
```tsx
<SlideIn direction="down" delay={0.5} distance={40}>
  <FilterPanel />
</SlideIn>
```

**Props:**
- `direction`: Direção do slide (`'up' | 'down' | 'left' | 'right'`)
- `delay`: Atraso antes da animação
- `duration`: Duração da animação
- `distance`: Distância em pixels do movimento

**Casos de Uso:**
- Painéis de filtros
- Dropdowns
- Modais e dialogs

### 3. StaggerChildren + StaggerItem
**Arquivo:** `components/animations/StaggerChildren.tsx`

**Uso:**
```tsx
<StaggerChildren staggerDelay={0.1} initialDelay={0.2}>
  {items.map(item => (
    <StaggerItem key={item.id}>
      <Card>{item.content}</Card>
    </StaggerItem>
  ))}
</StaggerChildren>
```

**Props (StaggerChildren):**
- `staggerDelay`: Intervalo entre animação de cada filho (segundos)
- `initialDelay`: Atraso antes de iniciar a sequência

**Props (StaggerItem):**
- `direction`: Direção do movimento de cada item

**Casos de Uso:**
- Listas de cards de pacientes
- Estatísticas em grid
- Insights de IA
- Linhas de tabela

### 4. CountUp
**Arquivo:** `components/animations/CountUp.tsx`

**Uso:**
```tsx
<CountUp
  value={142}
  duration={1.5}
  delay={0.3}
  decimals={2}
  suffix=" pacientes"
  prefix="Total: "
/>
```

**Props:**
- `value`: Valor final do contador
- `duration`: Duração da contagem
- `delay`: Atraso antes de iniciar
- `decimals`: Número de casas decimais
- `suffix`: Texto após o número
- `prefix`: Texto antes do número

**Casos de Uso:**
- Estatísticas do dashboard (cirurgias hoje, pacientes ativos)
- Valores estatísticos (F-statistic, p-value)
- Percentagens de completude
- Contadores de resultados

### 5. ScaleOnHover
**Arquivo:** `components/animations/ScaleOnHover.tsx`

**Uso:**
```tsx
<ScaleOnHover scale={1.02} duration={0.2}>
  <Card>Hover me</Card>
</ScaleOnHover>
```

**Props:**
- `scale`: Fator de escala no hover (padrão: 1.02)
- `duration`: Duração da transição

**Casos de Uso:**
- Cards de estatísticas
- Botões interativos
- Cards de pacientes
- Elementos clicáveis

### 6. AnimatedTabContent
**Arquivo:** `components/animations/AnimatedTabs.tsx`

**Uso:**
```tsx
<AnimatedTabContent value="tab1" activeTab={activeTab}>
  <TabContent />
</AnimatedTabContent>
```

**Props:**
- `value`: Identificador do tab
- `activeTab`: Tab atualmente ativo

**Casos de Uso:**
- Tabs de análise estatística
- Navegação entre seções
- Switching de visualizações

## Hook de Acessibilidade

### usePrefersReducedMotion
**Arquivo:** `hooks/usePrefersReducedMotion.ts`

**Uso:**
```tsx
const prefersReducedMotion = usePrefersReducedMotion()

return (
  <div>
    {prefersReducedMotion ? (
      <span>{value}</span>
    ) : (
      <CountUp value={value} />
    )}
  </div>
)
```

**Funcionalidade:**
- Detecta preferência do sistema operacional do usuário
- Retorna `true` se usuário prefere movimento reduzido
- Atualiza dinamicamente se preferência mudar

## Implementações por Página

### Dashboard (DashboardClient.tsx)

#### 1. Estatísticas do Topo
**Animação:** StaggerChildren + CountUp + ScaleOnHover

```tsx
<StaggerChildren staggerDelay={0.1} initialDelay={0.2}>
  <StaggerItem>
    <ScaleOnHover>
      <Card>
        <CountUp value={stats.todaySurgeries} />
      </Card>
    </ScaleOnHover>
  </StaggerItem>
  {/* Mais cards... */}
</StaggerChildren>
```

**Efeito:**
- Cards aparecem sequencialmente com delay de 100ms
- Números contam de 0 até o valor final
- Escala em 2% no hover

#### 2. Painel de Filtros
**Animação:** SlideIn

```tsx
<SlideIn direction="down" delay={0.7}>
  <Card>
    {/* Filtros */}
  </Card>
</SlideIn>
```

**Efeito:**
- Desliza para baixo após stats cards aparecerem
- Suaviza entrada do painel complexo

#### 3. Cards de Pacientes
**Animação:** StaggerChildren + AnimatePresence + ScaleOnHover + Layout

```tsx
<StaggerChildren staggerDelay={0.05}>
  <AnimatePresence mode="popLayout">
    {patients.map(patient => (
      <StaggerItem key={patient.id}>
        <motion.div layout>
          <ScaleOnHover>
            <Card>{/* Paciente */}</Card>
          </ScaleOnHover>
        </motion.div>
      </StaggerItem>
    ))}
  </AnimatePresence>
</StaggerChildren>
```

**Efeito:**
- Cards aparecem sequencialmente
- Transições suaves ao filtrar
- Reposicionamento automático (layout animation)
- Hover interativo

### Página de Comparação (comparacao/page.tsx)

#### 1. Header
**Animação:** FadeIn

```tsx
<FadeIn>
  <div className="mb-8">
    {/* Header content */}
  </div>
</FadeIn>
```

#### 2. Painel de Insights IA
**Animação:** AnimatePresence + SlideIn + StaggerChildren

```tsx
<AnimatePresence>
  {showAiInsights && (
    <SlideIn direction="down">
      <Card>
        <StaggerChildren>
          {insights.map(insight => (
            <StaggerItem>
              <InsightCard />
            </StaggerItem>
          ))}
        </StaggerChildren>
      </Card>
    </SlideIn>
  )}
</AnimatePresence>
```

**Efeito:**
- Painel desliza suavemente ao abrir/fechar
- Insights aparecem um por um
- Remoção suave ao ocultar

#### 3. Cards Estatísticos ANOVA
**Animação:** StaggerChildren + CountUp + ScaleOnHover + Badge Pop

```tsx
<StaggerChildren staggerDelay={0.15}>
  <StaggerItem>
    <ScaleOnHover>
      <StatCard>
        <CountUp value={fStatistic} decimals={3} />
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
        >
          <Badge>Significativo</Badge>
        </motion.div>
      </StatCard>
    </ScaleOnHover>
  </StaggerItem>
</StaggerChildren>
```

**Efeito:**
- Cards aparecem em sequência
- Números contam até valor final
- Badge "pop" aparece com spring effect
- Hover scale feedback

## Variantes de Animação Customizadas

### Container Variants
Usado em StaggerChildren:

```typescript
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      delayChildren: 0.2,
      staggerChildren: 0.1,
    },
  },
}
```

### Item Variants
Usado em StaggerItem:

```typescript
const item = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
}
```

### Layout Animations
Para repositionamento suave:

```tsx
<motion.div
  layout
  initial={{ opacity: 0, scale: 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.9 }}
  transition={{ duration: 0.3 }}
>
  {/* Content */}
</motion.div>
```

## Considerações de Performance

### 1. Will-Change
Framer Motion automaticamente adiciona `will-change` quando necessário

### 2. GPU Acceleration
Uso exclusivo de propriedades aceleradas por GPU:
- `transform`
- `opacity`
- `scale`

### 3. Layout Thrashing
- Layout animations usam FLIP technique
- Minimiza reflows durante animações

### 4. Lazy Loading
- Componentes de animação importados apenas onde necessário
- Tree-shaking automático pelo Next.js

## Testes e Validação

### Como Testar Animações

1. **Teste Visual Básico:**
   - Navegue para `/dashboard`
   - Observe cards aparecendo em sequência
   - Números contando até valor final
   - Hover sobre cards para ver scale

2. **Teste de Filtros:**
   - Altere filtros de pacientes
   - Observe transições suaves dos cards
   - Verifique reposicionamento automático

3. **Teste de Comparação:**
   - Navegue para página de comparação de pesquisa
   - Toggle insights IA
   - Observe animações de tab switching
   - Verifique contadores estatísticos

4. **Teste de Acessibilidade:**
   - **Windows:** Settings > Ease of Access > Display > Show animations (OFF)
   - **macOS:** System Preferences > Accessibility > Display > Reduce motion
   - **Linux:** Settings > Universal Access > Reduce Animation

   Após ativar, recarregue a página e verifique:
   - Contadores mostram valor final imediatamente
   - Sem animações de movimento
   - Funcionalidade mantida

### Performance Benchmarks

**Métricas Esperadas:**
- FPS durante animações: 60fps
- Layout shift (CLS): < 0.1
- Time to Interactive (TTI): < 3s

**Ferramentas:**
- Chrome DevTools > Performance
- React DevTools Profiler
- Lighthouse

## Exemplos de Código Completos

### Exemplo 1: Card Animado com Hover
```tsx
import { ScaleOnHover, FadeIn } from '@/components/animations'

export function StatCard({ title, value, icon: Icon }) {
  const prefersReducedMotion = usePrefersReducedMotion()

  return (
    <FadeIn delay={0.2}>
      <ScaleOnHover>
        <Card>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <Icon />
          </CardHeader>
          <CardContent>
            {prefersReducedMotion ? (
              <span className="text-3xl font-bold">{value}</span>
            ) : (
              <CountUp
                value={value}
                duration={1}
                className="text-3xl font-bold"
              />
            )}
          </CardContent>
        </Card>
      </ScaleOnHover>
    </FadeIn>
  )
}
```

### Exemplo 2: Lista com Stagger
```tsx
import { StaggerChildren, StaggerItem } from '@/components/animations'

export function PatientList({ patients }) {
  return (
    <StaggerChildren
      className="grid grid-cols-3 gap-4"
      staggerDelay={0.05}
    >
      <AnimatePresence mode="popLayout">
        {patients.map(patient => (
          <StaggerItem key={patient.id}>
            <motion.div layout>
              <PatientCard patient={patient} />
            </motion.div>
          </StaggerItem>
        ))}
      </AnimatePresence>
    </StaggerChildren>
  )
}
```

### Exemplo 3: Modal Animado
```tsx
import { motion, AnimatePresence } from 'framer-motion'

export function AnimatedModal({ isOpen, onClose, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 flex items-center justify-center"
          >
            <div className="bg-white rounded-lg p-6">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
```

## Troubleshooting

### Problema: Animações não aparecem

**Solução:**
1. Verifique se componente é 'use client'
2. Confirme importação correta do Framer Motion
3. Verifique console para erros

### Problema: Performance ruim

**Solução:**
1. Reduza número de animações simultâneas
2. Aumente staggerDelay
3. Use `will-change` com moderação
4. Verifique que apenas transform/opacity são animados

### Problema: Layout shift durante animações

**Solução:**
1. Use `layout` prop do motion.div
2. Reserve espaço para conteúdo antes de carregar
3. Use `layoutId` para elementos que mudam de posição

## Próximos Passos

### Melhorias Futuras
1. **Micro-interações:**
   - Animação de botões ao clicar
   - Feedback visual em formulários
   - Loading states animados

2. **Animações de Dados:**
   - Gráficos animados com Recharts
   - Barras de progresso animadas
   - Transições entre visualizações

3. **Gestos:**
   - Swipe em cards mobile
   - Drag and drop para reordenar
   - Pull to refresh

4. **Temas:**
   - Transição suave entre light/dark mode
   - Animação de cores do tema

## Recursos

- [Framer Motion Docs](https://www.framer.com/motion/)
- [Animation Principles](https://www.framer.com/motion/animation/)
- [Accessibility](https://www.framer.com/motion/guide-accessibility/)
- [Performance](https://www.framer.com/motion/guide-performance/)

## Créditos

Sistema de animações implementado seguindo:
- Material Design Motion Guidelines
- Apple Human Interface Guidelines
- WCAG 2.1 Accessibility Standards
- Telos.AI Brand Guidelines
