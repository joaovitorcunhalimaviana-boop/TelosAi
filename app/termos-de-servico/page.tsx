import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Termos de Serviço | Telos.AI',
  description: 'Termos de Serviço do Sistema de Acompanhamento Pós-Operatório Telos.AI',
};

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 md:p-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Termos de Serviço
        </h1>

        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-6">
            <strong>Última atualização:</strong> {new Date().toLocaleDateString('pt-BR')}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Aceitação dos Termos</h2>
            <p className="text-gray-700 mb-4">
              Ao utilizar o sistema Telos.AI de acompanhamento pós-operatório ("Serviço"),
              você concorda com estes Termos de Serviço ("Termos"). Se você não concorda
              com estes termos, não utilize o Serviço.
            </p>
            <p className="text-gray-700">
              Estes Termos constituem um contrato juridicamente vinculante entre você
              ("Paciente" ou "Usuário") e os profissionais de saúde que utilizam o
              sistema Telos.AI.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Descrição do Serviço</h2>
            <p className="text-gray-700 mb-4">
              O Telos.AI é um sistema de acompanhamento pós-operatório que:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Envia questionários automatizados via WhatsApp após procedimentos cirúrgicos</li>
              <li>Monitora sintomas e evolução pós-operatória</li>
              <li>Utiliza inteligência artificial (Claude AI da Anthropic) para análise de respostas</li>
              <li>Alerta a equipe médica sobre possíveis complicações</li>
              <li>Facilita a comunicação entre paciente e equipe médica</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Natureza do Serviço</h2>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-4">
              <p className="text-gray-800 font-semibold mb-2">
                ATENÇÃO: Este serviço é complementar e NÃO substitui consultas médicas presenciais.
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>O sistema utiliza IA para triagem inicial, mas todas as decisões médicas
                    são tomadas por profissionais de saúde qualificados</li>
                <li>Em caso de sintomas graves ou emergência, procure atendimento médico
                    presencial imediatamente ou ligue para 192 (SAMU)</li>
                <li>As respostas fornecidas pelo sistema são orientações gerais e não
                    constituem diagnóstico ou prescrição médica</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Contato</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <p className="text-gray-700 mb-2">
                <strong>Suporte Telos.AI:</strong>
              </p>
              <p className="text-gray-700 mb-1">E-mail: contato@telos.ai</p>
              <p className="text-gray-700">Telefone: +55 83 9166-4904</p>
            </div>
          </section>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <p className="text-gray-800 font-semibold mb-2">
                Ao utilizar o sistema Telos.AI, você declara ter lido, compreendido e
                concordado com estes Termos de Serviço.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
