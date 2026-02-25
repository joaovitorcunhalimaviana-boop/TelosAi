import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Termos de Serviço | VigIA',
  description: 'Termos de Serviço do Sistema de Acompanhamento Pós-Operatório VigIA',
};

export default function TermosPage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#0B0E14' }}>
      <div className="max-w-4xl mx-auto rounded-2xl shadow-xl p-8 md:p-12 border" style={{ backgroundColor: '#161B27', borderColor: '#1E2535' }}>
        <h1 className="text-4xl font-bold mb-8" style={{ color: '#F0EAD6' }}>
          Termos de Serviço
        </h1>

        <div className="prose prose-lg max-w-none">
          <p className="mb-6" style={{ color: '#7A8299' }}>
            <strong style={{ color: '#D8DEEB' }}>Última atualização:</strong> {new Date().toLocaleDateString('pt-BR')}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: '#F0EAD6' }}>1. Aceitação dos Termos</h2>
            <p className="mb-4" style={{ color: '#D8DEEB' }}>
              Ao utilizar o sistema VigIA de acompanhamento pós-operatório (&quot;Serviço&quot;),
              você concorda com estes Termos de Serviço (&quot;Termos&quot;). Se você não concorda
              com estes termos, não utilize o Serviço.
            </p>
            <p style={{ color: '#D8DEEB' }}>
              Estes Termos constituem um contrato juridicamente vinculante entre você
              (&quot;Paciente&quot; ou &quot;Usuário&quot;) e os profissionais de saúde que utilizam o
              sistema VigIA.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: '#F0EAD6' }}>2. Descrição do Serviço</h2>
            <p className="mb-4" style={{ color: '#D8DEEB' }}>
              O VigIA é um sistema de acompanhamento pós-operatório que:
            </p>
            <ul className="list-disc pl-6 space-y-2" style={{ color: '#D8DEEB' }}>
              <li>Envia questionários automatizados via WhatsApp após procedimentos cirúrgicos</li>
              <li>Monitora sintomas e evolução pós-operatória</li>
              <li>Utiliza inteligência artificial (Claude AI da Anthropic) para análise de respostas</li>
              <li>Alerta a equipe médica sobre possíveis complicações</li>
              <li>Facilita a comunicação entre paciente e equipe médica</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: '#F0EAD6' }}>3. Natureza do Serviço</h2>
            <div className="rounded-lg p-6 mb-4 border" style={{ backgroundColor: '#1E2535', borderColor: '#C9A84C' }}>
              <p className="font-semibold mb-2" style={{ color: '#E8C97A' }}>
                ATENÇÃO: Este serviço é complementar e NÃO substitui consultas médicas presenciais.
              </p>
              <ul className="list-disc pl-6 space-y-2" style={{ color: '#D8DEEB' }}>
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
            <h2 className="text-2xl font-semibold mb-4" style={{ color: '#F0EAD6' }}>4. Contato</h2>
            <div className="rounded-lg p-6 border" style={{ backgroundColor: '#1E2535', borderColor: '#0D7377' }}>
              <p className="mb-2" style={{ color: '#D8DEEB' }}>
                <strong style={{ color: '#14BDAE' }}>Suporte VigIA:</strong>
              </p>
              <p className="mb-1" style={{ color: '#D8DEEB' }}>E-mail: contato@vigia.app.br</p>
              <p style={{ color: '#D8DEEB' }}>Telefone: +55 83 9166-4904</p>
            </div>
          </section>

          <div className="mt-12 pt-8" style={{ borderTopWidth: '1px', borderColor: '#1E2535' }}>
            <div className="rounded-lg p-6 border" style={{ backgroundColor: '#1E2535', borderColor: '#0D7377' }}>
              <p className="font-semibold mb-2" style={{ color: '#14BDAE' }}>
                Ao utilizar o sistema VigIA, você declara ter lido, compreendido e
                concordado com estes Termos de Serviço.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
