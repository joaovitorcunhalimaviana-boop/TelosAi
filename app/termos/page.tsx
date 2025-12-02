'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getTiposList } from '@/lib/termo-templates';

export default function TermosPage() {
  const [pacienteNome, setPacienteNome] = useState('');
  const termos = getTiposList();
  const router = useRouter();

  const categorizados = termos.reduce((acc, termo) => {
    if (!acc[termo.categoria]) {
      acc[termo.categoria] = [];
    }
    acc[termo.categoria].push(termo);
    return acc;
  }, {} as Record<string, typeof termos>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0A2647] to-[#144272] flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#0A2647]">
                  Central de Termos de Consentimento
                </h1>
                <p className="text-sm text-gray-600">
                  Dr. João Vitor Viana - CRM-PB 12831 | Cirurgião Colorretal
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#0A2647] bg-white border-2 border-[#D4AF37] rounded-lg hover:bg-[#0A2647] hover:text-white transition-all duration-200 shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Voltar ao Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Nome do Paciente */}
        <div className="bg-white rounded-xl shadow-md border-2 border-[#0A2647]/10 p-6 mb-8">
          <label htmlFor="pacienteNome" className="block text-sm font-semibold text-[#0A2647] mb-2">
            Nome do Paciente (opcional - será pré-preenchido no termo)
          </label>
          <input
            type="text"
            id="pacienteNome"
            value={pacienteNome}
            onChange={(e) => setPacienteNome(e.target.value)}
            placeholder="Digite o nome completo do paciente"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-all"
          />
        </div>

        {/* Lista de Termos por Categoria */}
        {Object.entries(categorizados).map(([categoria, termosCategoria]) => (
          <div key={categoria} className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                categoria === 'Cirúrgico'
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                  : 'bg-gradient-to-br from-green-500 to-emerald-600'
              } shadow-md`}>
                {categoria === 'Cirúrgico' ? (
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <h2 className="text-xl font-bold text-[#0A2647]">
                Termos {categoria}s
              </h2>
              <span className="px-3 py-1 text-xs font-semibold bg-[#0A2647]/10 text-[#0A2647] rounded-full">
                {termosCategoria.length} {termosCategoria.length === 1 ? 'termo' : 'termos'}
              </span>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {termosCategoria.map((termo) => (
                <div
                  key={termo.id}
                  className="bg-white rounded-xl shadow-md border-2 border-transparent hover:border-[#D4AF37] hover:shadow-lg transition-all duration-200 overflow-hidden group"
                >
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-[#0A2647] mb-2 group-hover:text-[#144272] transition-colors">
                      {termo.nome}
                    </h3>
                    <p className="text-sm text-gray-600 mb-5 line-clamp-2">
                      {termo.descricao}
                    </p>

                    <div className="flex flex-col gap-2">
                      <Link
                        href={`/termos/${termo.id}?nome=${encodeURIComponent(pacienteNome)}`}
                        target="_blank"
                        className="w-full px-4 py-2.5 text-sm font-semibold text-white bg-[#0A2647] rounded-lg hover:bg-[#0D3156] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D4AF37] text-center transition-colors"
                      >
                        <span className="flex items-center justify-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Visualizar
                        </span>
                      </Link>

                      <div className="grid grid-cols-2 gap-2">
                        <Link
                          href={`/termos/${termo.id}?nome=${encodeURIComponent(pacienteNome)}&print=true`}
                          target="_blank"
                          className="px-3 py-2 text-sm font-medium text-[#0A2647] bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 focus:outline-none transition-colors text-center"
                        >
                          <span className="flex items-center justify-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            Imprimir
                          </span>
                        </Link>

                        <button
                          onClick={() => {
                            const url = `/termos/${termo.id}?nome=${encodeURIComponent(pacienteNome)}`;
                            window.open(url, '_blank');
                          }}
                          className="px-3 py-2 text-sm font-medium text-[#0A2647] bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 focus:outline-none transition-colors"
                        >
                          <span className="flex items-center justify-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            Nova Aba
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Instruções */}
        <div className="bg-gradient-to-r from-[#0A2647]/5 to-[#144272]/5 border-2 border-[#0A2647]/20 rounded-xl p-6 mt-8">
          <h3 className="text-lg font-bold text-[#0A2647] mb-4 flex items-center">
            <div className="w-8 h-8 rounded-lg bg-[#0A2647] flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            Como utilizar os termos
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#D4AF37] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">1</div>
              <p className="text-sm text-gray-700">Digite o nome do paciente no campo acima para pré-preencher automaticamente</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#D4AF37] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">2</div>
              <p className="text-sm text-gray-700">Clique em "Visualizar" para ver o termo completo antes de imprimir</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#D4AF37] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">3</div>
              <p className="text-sm text-gray-700">Use "Imprimir" para abrir diretamente a janela de impressão</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#D4AF37] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">4</div>
              <p className="text-sm text-gray-700">Selecione "Salvar como PDF" na impressora para arquivo digital</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
