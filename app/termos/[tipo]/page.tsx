'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { termoTemplates, TermoData } from '@/lib/termo-templates';

function TermoPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const tipo = params.tipo as string;

  const [data, setData] = useState<TermoData>({
    pacienteNome: searchParams.get('nome') || '',
    pacienteCPF: '',
    data: new Date().toLocaleDateString('pt-BR'),
    cidade: 'João Pessoa'
  });

  const [autoPrint, setAutoPrint] = useState(false);

  useEffect(() => {
    // Auto-print se o parâmetro print=true estiver na URL
    if (searchParams.get('print') === 'true') {
      setAutoPrint(true);
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [searchParams]);

  const termo = termoTemplates[tipo as keyof typeof termoTemplates];

  if (!termo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Termo não encontrado</h1>
          <p className="text-gray-600 mb-6">O tipo de termo solicitado não existe.</p>
          <a
            href="/termos"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Voltar para Central de Termos
          </a>
        </div>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* Botões de ação - apenas na tela */}
      <div className="no-print fixed top-4 right-4 z-50 flex gap-2">
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-lg flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Imprimir
        </button>
        <a
          href="/termos"
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 shadow-lg flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Voltar
        </a>
      </div>

      {/* Container A4 */}
      <div className="min-h-screen bg-gray-100 py-8 no-print-bg">
        <div className="a4-container mx-auto bg-white shadow-lg">
          {/* Cabeçalho */}
          <div className="header-section text-center border-b-2 border-gray-300 pb-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {termo.titulo}
            </h1>
            <h2 className="text-xl text-gray-700 mb-4">
              {termo.subtitulo}
            </h2>
            <div className="text-sm text-gray-600">
              <p className="font-semibold">Dr. João Vitor Viana</p>
              <p>CRM-PB 12831</p>
              <p>Cirurgião Colorretal</p>
            </div>
          </div>

          {/* Campos editáveis - apenas na tela */}
          <div className="no-print mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm font-semibold text-yellow-800 mb-3">
              Preencha os dados abaixo antes de imprimir:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Paciente *
                </label>
                <input
                  type="text"
                  value={data.pacienteNome}
                  onChange={(e) => setData({ ...data, pacienteNome: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nome completo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CPF (opcional)
                </label>
                <input
                  type="text"
                  value={data.pacienteCPF}
                  onChange={(e) => setData({ ...data, pacienteCPF: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="000.000.000-00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cidade
                </label>
                <input
                  type="text"
                  value={data.cidade}
                  onChange={(e) => setData({ ...data, cidade: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data
                </label>
                <input
                  type="text"
                  value={data.data}
                  onChange={(e) => setData({ ...data, data: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Conteúdo do termo */}
          <div
            className="termo-content text-justify leading-relaxed"
            dangerouslySetInnerHTML={{ __html: termo.conteudo(data) }}
          />

          {/* Assinaturas */}
          <div className="signatures-section mt-12 pt-8">
            <div className="text-center mb-8">
              <p className="text-sm text-gray-700">
                {data.cidade}, {data.data}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="text-center">
                <div className="border-t-2 border-gray-400 pt-2 mx-8">
                  <p className="text-sm font-medium text-gray-900">Assinatura do Paciente</p>
                  <p className="text-xs text-gray-600 mt-1">{data.pacienteNome || '___________________________'}</p>
                  {data.pacienteCPF && (
                    <p className="text-xs text-gray-600">CPF: {data.pacienteCPF}</p>
                  )}
                </div>
              </div>

              <div className="text-center">
                <div className="border-t-2 border-gray-400 pt-2 mx-8">
                  <p className="text-sm font-medium text-gray-900">Dr. João Vitor Viana</p>
                  <p className="text-xs text-gray-600 mt-1">CRM-PB 12831</p>
                  <p className="text-xs text-gray-600">Cirurgião Colorretal</p>
                </div>
              </div>
            </div>
          </div>

          {/* Rodapé */}
          <div className="footer-section mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-500">
            <p>Este documento foi gerado eletronicamente e deve ser assinado pelo paciente e pelo médico.</p>
          </div>
        </div>
      </div>

      {/* CSS de impressão */}
      <style jsx global>{`
        /* Estilos para tela */
        .a4-container {
          width: 210mm;
          min-height: 297mm;
          padding: 20mm;
          margin: 0 auto;
        }

        .no-print-bg {
          background-color: #f3f4f6;
        }

        /* Estilos do conteúdo do termo */
        .termo-content h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #1f2937;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }

        .termo-content p {
          margin-bottom: 1rem;
          color: #374151;
          font-size: 0.95rem;
          line-height: 1.6;
        }

        .termo-content ul {
          margin-left: 2rem;
          margin-bottom: 1rem;
          list-style-type: disc;
        }

        .termo-content li {
          margin-bottom: 0.5rem;
          color: #374151;
          font-size: 0.95rem;
          line-height: 1.5;
        }

        .termo-content strong {
          font-weight: 600;
          color: #111827;
        }

        /* Estilos de impressão */
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }

          body {
            background: white;
          }

          .no-print {
            display: none !important;
          }

          .no-print-bg {
            background: white !important;
          }

          .a4-container {
            width: 100%;
            min-height: auto;
            padding: 0;
            margin: 0;
            box-shadow: none;
            page-break-after: avoid;
          }

          .header-section {
            margin-bottom: 1.5rem;
          }

          .termo-content {
            font-size: 11pt;
            line-height: 1.5;
          }

          .termo-content h3 {
            font-size: 12pt;
            margin-top: 1rem;
            margin-bottom: 0.5rem;
            page-break-after: avoid;
          }

          .termo-content p {
            font-size: 11pt;
            margin-bottom: 0.75rem;
          }

          .termo-content ul {
            margin-left: 1.5rem;
            margin-bottom: 0.75rem;
          }

          .termo-content li {
            font-size: 10pt;
            margin-bottom: 0.25rem;
          }

          .signatures-section {
            margin-top: 2rem;
            page-break-inside: avoid;
          }

          .footer-section {
            margin-top: 1.5rem;
            font-size: 8pt;
          }

          /* Evitar quebra de página em elementos importantes */
          h1, h2, h3 {
            page-break-after: avoid;
          }

          ul, ol {
            page-break-inside: avoid;
          }
        }

        /* Melhorias visuais */
        .header-section h1 {
          color: #1e40af;
        }

        .header-section h2 {
          color: #1f2937;
        }

        .signatures-section {
          border-top: 1px solid #e5e7eb;
        }
      `}</style>
    </>
  );
}

export default function TermoPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando termo...</p>
        </div>
      </div>
    }>
      <TermoPage />
    </Suspense>
  );
}
