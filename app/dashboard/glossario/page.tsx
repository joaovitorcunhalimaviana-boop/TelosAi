/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  BookOpen,
  Activity,
  Stethoscope,
  FileText,
  Download,
  Printer,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { tooltipDatabase, TooltipContent } from '@/lib/tooltip-content';

export default function GlossarioPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTerms, setExpandedTerms] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'statistical' | 'medical' | 'clinical'>('all');

  // Get all terms grouped by category
  const termsByCategory = useMemo(() => {
    const terms = Object.values(tooltipDatabase);
    return {
      statistical: terms.filter(t => t.category === 'statistical'),
      medical: terms.filter(t => t.category === 'medical'),
      clinical: terms.filter(t => t.category === 'clinical'),
    };
  }, []);

  // Filter terms based on search query and category
  const filteredTerms = useMemo(() => {
    const terms = Object.values(tooltipDatabase);
    let filtered = terms;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        t =>
          t.term.toLowerCase().includes(query) ||
          t.definition.toLowerCase().includes(query) ||
          t.example?.toLowerCase().includes(query) ||
          t.interpretation?.toLowerCase().includes(query)
      );
    }

    // Sort alphabetically
    return filtered.sort((a, b) => a.term.localeCompare(b.term, 'pt-BR'));
  }, [searchQuery, selectedCategory]);

  const toggleTerm = (termId: string) => {
    const newExpanded = new Set(expandedTerms);
    if (newExpanded.has(termId)) {
      newExpanded.delete(termId);
    } else {
      newExpanded.add(termId);
    }
    setExpandedTerms(newExpanded);
  };

  const exportAsText = () => {
    let text = 'GLOSSÁRIO DE TERMOS ESTATÍSTICOS E MÉDICOS\n';
    text += 'Sistema de Pesquisa Pós-Operatória\n';
    text += '='.repeat(80) + '\n\n';

    const categories = [
      { id: 'statistical', name: 'TERMOS ESTATÍSTICOS', icon: '' },
      { id: 'medical', name: 'TERMOS MÉDICOS', icon: '' },
      { id: 'clinical', name: 'TERMOS DE PESQUISA CLÍNICA', icon: '' },
    ];

    categories.forEach(cat => {
      const terms = Object.values(tooltipDatabase)
        .filter(t => t.category === cat.id)
        .sort((a, b) => a.term.localeCompare(b.term, 'pt-BR'));

      if (terms.length > 0) {
        text += `\n${cat.name}\n`;
        text += '-'.repeat(80) + '\n\n';

        terms.forEach(term => {
          text += `${term.term}\n`;
          text += `   ${term.definition}\n`;
          if (term.example) {
            text += `   Exemplo: ${term.example}\n`;
          }
          if (term.interpretation) {
            text += `   Interpretação: ${term.interpretation}\n`;
          }
          text += '\n';
        });
      }
    });

    text += '\n' + '='.repeat(80) + '\n';
    text += `Total de termos: ${Object.keys(tooltipDatabase).length}\n`;
    text += `Gerado em: ${new Date().toLocaleDateString('pt-BR')}\n`;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.download = `glossario-${new Date().toISOString().split('T')[0]}.txt`;
    link.href = URL.createObjectURL(blob);
    link.click();
  };

  const printGlossary = () => {
    window.print();
  };

  const renderTermCard = (term: TooltipContent, termId: string) => {
    const isExpanded = expandedTerms.has(termId);

    const categoryConfig = {
      statistical: { color: 'bg-[#0D7377]/20 text-[#14BDAE]', icon: <Activity className="h-4 w-4" /> },
      medical: { color: 'bg-green-500/20 text-green-400', icon: <Stethoscope className="h-4 w-4" /> },
      clinical: { color: 'bg-purple-500/20 text-purple-400', icon: <FileText className="h-4 w-4" /> },
    };

    const config = categoryConfig[term.category];

    return (
      <Card key={termId} className="mb-3 print:break-inside-avoid" style={{ backgroundColor: '#111520', borderColor: '#1E2535' }}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <CardTitle className="text-lg" style={{ color: '#F0EAD6' }}>{term.term}</CardTitle>
                <Badge className={config.color} variant="secondary">
                  {config.icon}
                </Badge>
              </div>
              <CardDescription className="text-sm leading-relaxed" style={{ color: '#D8DEEB' }}>
                {term.definition}
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleTerm(termId)}
              className="ml-2 print:hidden hover:bg-[#1E2535]"
              style={{ color: '#7A8299' }}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>

        {(isExpanded || (typeof window !== 'undefined' && window.matchMedia('print').matches)) && (
          <CardContent className="pt-0 space-y-3">
            {term.example && (
              <div className="p-3 rounded-lg" style={{ backgroundColor: '#161B27' }}>
                <div className="text-xs font-semibold mb-1" style={{ color: '#7A8299' }}>Exemplo:</div>
                <div className="text-sm" style={{ color: '#D8DEEB' }}>{term.example}</div>
              </div>
            )}

            {term.interpretation && (
              <div className="p-3 rounded-lg" style={{ backgroundColor: '#0D7377/10', border: '1px solid #0D7377' }}>
                <div className="text-xs font-semibold mb-1" style={{ color: '#14BDAE' }}>Interpretação:</div>
                <div className="text-sm" style={{ color: '#D8DEEB' }}>{term.interpretation}</div>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl" style={{ backgroundColor: '#0B0E14' }}>
      {/* Header */}
      <div className="mb-8 print:mb-4">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="h-10 w-10" style={{ color: '#14BDAE' }} />
          <h1 className="text-4xl font-bold" style={{ color: '#F0EAD6' }}>
            Glossário de Termos
          </h1>
        </div>
        <p className="text-lg" style={{ color: '#7A8299' }}>
          Guia completo de termos estatísticos, médicos e de pesquisa clínica
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 print:hidden">
        <Card style={{ backgroundColor: '#111520', borderColor: '#1E2535' }}>
          <CardHeader className="pb-3">
            <CardDescription className="text-xs" style={{ color: '#7A8299' }}>Total de Termos</CardDescription>
            <CardTitle className="text-3xl" style={{ color: '#14BDAE' }}>
              {Object.keys(tooltipDatabase).length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card style={{ backgroundColor: '#111520', borderColor: '#1E2535' }}>
          <CardHeader className="pb-3">
            <CardDescription className="text-xs" style={{ color: '#7A8299' }}>Estatísticos</CardDescription>
            <CardTitle className="text-3xl" style={{ color: '#14BDAE' }}>
              {termsByCategory.statistical.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card style={{ backgroundColor: '#111520', borderColor: '#1E2535' }}>
          <CardHeader className="pb-3">
            <CardDescription className="text-xs" style={{ color: '#7A8299' }}>Médicos</CardDescription>
            <CardTitle className="text-3xl text-green-400">
              {termsByCategory.medical.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card style={{ backgroundColor: '#111520', borderColor: '#1E2535' }}>
          <CardHeader className="pb-3">
            <CardDescription className="text-xs" style={{ color: '#7A8299' }}>Pesquisa Clínica</CardDescription>
            <CardTitle className="text-3xl text-purple-400">
              {termsByCategory.clinical.length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Search and Actions */}
      <div className="mb-6 print:hidden">
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: '#7A8299' }} />
            <Input
              type="text"
              placeholder="Buscar termos, definições, exemplos..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
              style={{ backgroundColor: '#161B27', borderColor: '#1E2535', color: '#D8DEEB' }}
            />
          </div>
          <Button variant="outline" onClick={exportAsText} style={{ borderColor: '#1E2535', color: '#D8DEEB', backgroundColor: '#1E2535' }}>
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button variant="outline" onClick={printGlossary} style={{ borderColor: '#1E2535', color: '#D8DEEB', backgroundColor: '#1E2535' }}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
        </div>
      </div>

      {/* Results Count */}
      {searchQuery && (
        <div className="mb-4 text-sm print:hidden" style={{ color: '#7A8299' }}>
          {filteredTerms.length} termo{filteredTerms.length !== 1 ? 's' : ''} encontrado
          {filteredTerms.length !== 1 ? 's' : ''}
        </div>
      )}

      {/* Category Tabs */}
      <Tabs
        defaultValue="all"
        value={selectedCategory}
        onValueChange={(v: any) => setSelectedCategory(v)}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-4 print:hidden" style={{ backgroundColor: '#161B27' }}>
          <TabsTrigger value="all" className="data-[state=active]:bg-[#0D7377] data-[state=active]:text-[#F0EAD6]" style={{ color: '#D8DEEB' }}>
            Todos ({Object.keys(tooltipDatabase).length})
          </TabsTrigger>
          <TabsTrigger value="statistical" className="data-[state=active]:bg-[#0D7377] data-[state=active]:text-[#F0EAD6]" style={{ color: '#D8DEEB' }}>
            <Activity className="mr-2 h-4 w-4" />
            Estatísticos ({termsByCategory.statistical.length})
          </TabsTrigger>
          <TabsTrigger value="medical" className="data-[state=active]:bg-[#0D7377] data-[state=active]:text-[#F0EAD6]" style={{ color: '#D8DEEB' }}>
            <Stethoscope className="mr-2 h-4 w-4" />
            Médicos ({termsByCategory.medical.length})
          </TabsTrigger>
          <TabsTrigger value="clinical" className="data-[state=active]:bg-[#0D7377] data-[state=active]:text-[#F0EAD6]" style={{ color: '#D8DEEB' }}>
            <FileText className="mr-2 h-4 w-4" />
            Pesquisa ({termsByCategory.clinical.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          {filteredTerms.length > 0 ? (
            <div className="space-y-2">
              {filteredTerms.map(term => {
                const termId = Object.keys(tooltipDatabase).find(
                  key => tooltipDatabase[key] === term
                );
                return termId ? renderTermCard(term, termId) : null;
              })}
            </div>
          ) : (
            <div className="text-center py-12" style={{ color: '#7A8299' }}>
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Nenhum termo encontrado</p>
              <p className="text-sm">Tente ajustar sua busca ou filtros</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Print Footer */}
      <div className="hidden print:block mt-8 pt-4 border-t text-sm" style={{ color: '#7A8299' }}>
        <p>
          Glossário de Termos - Sistema de Pesquisa Pós-Operatória | Gerado em:{' '}
          {new Date().toLocaleDateString('pt-BR')}
        </p>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:block {
            display: block !important;
          }
          .print\\:break-inside-avoid {
            break-inside: avoid;
          }
          .print\\:mb-4 {
            margin-bottom: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
