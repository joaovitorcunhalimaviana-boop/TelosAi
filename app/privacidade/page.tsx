import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de Privacidade | Telos.AI',
  description: 'Política de Privacidade do Sistema de Acompanhamento Pós-Operatório Telos.AI',
};

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 md:p-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Política de Privacidade
        </h1>

        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-6">
            <strong>Última atualização:</strong> {new Date().toLocaleDateString('pt-BR')}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introdução</h2>
            <p className="text-gray-700 mb-4">
              A Telos.AI (&quot;nós&quot;, &quot;nosso&quot; ou &quot;nossa&quot;) opera o sistema de acompanhamento
              pós-operatório que utiliza inteligência artificial para monitorar pacientes
              após procedimentos cirúrgicos.
            </p>
            <p className="text-gray-700">
              Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e
              protegemos suas informações pessoais e dados de saúde em conformidade com a
              Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018) e regulamentações
              do Conselho Federal de Medicina (CFM).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Dados Coletados</h2>
            <p className="text-gray-700 mb-4">
              Coletamos as seguintes categorias de dados:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Dados de Identificação:</strong> Nome completo, CPF, data de nascimento</li>
              <li><strong>Dados de Contato:</strong> Número de telefone, e-mail</li>
              <li><strong>Dados de Saúde:</strong> Tipo de cirurgia, data da cirurgia, sintomas relatados,
                respostas a questionários pós-operatórios, medicamentos utilizados</li>
              <li><strong>Dados de Comunicação:</strong> Mensagens trocadas via WhatsApp,
                registros de acompanhamento</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Base Legal e Finalidade</h2>
            <p className="text-gray-700 mb-4">
              O tratamento de seus dados é realizado com base nas seguintes hipóteses legais:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Tutela da saúde (Art. 11, II, LGPD):</strong> Procedimentos realizados
                por profissionais de saúde para proteção da vida</li>
              <li><strong>Consentimento (Art. 7, I, LGPD):</strong> Para comunicações e
                funcionalidades não essenciais</li>
              <li><strong>Execução de contrato (Art. 7, V, LGPD):</strong> Prestação de serviços
                médicos contratados</li>
            </ul>
            <p className="text-gray-700 mt-4">
              <strong>Finalidades:</strong> Monitoramento pós-operatório, detecção precoce de
              complicações, orientação médica, melhoria da qualidade do atendimento.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Compartilhamento de Dados</h2>
            <p className="text-gray-700 mb-4">
              Seus dados são compartilhados apenas com:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Equipe médica responsável:</strong> Cirurgiões e profissionais envolvidos
                no seu tratamento</li>
              <li><strong>Prestadores de serviço essenciais:</strong>
                <ul className="list-circle pl-6 mt-2 space-y-1">
                  <li>Meta Platforms (WhatsApp Business API) - apenas para transmissão de mensagens</li>
                  <li>Anthropic (Claude AI) - apenas para análise de sintomas (dados pseudonimizados)</li>
                  <li>Provedores de infraestrutura (Railway, Neon PostgreSQL) - hospedagem segura</li>
                </ul>
              </li>
            </ul>
            <p className="text-gray-700 mt-4">
              <strong>Não vendemos, alugamos ou comercializamos seus dados pessoais.</strong>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Segurança dos Dados</h2>
            <p className="text-gray-700 mb-4">
              Implementamos medidas técnicas e organizacionais adequadas:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Criptografia em trânsito (HTTPS/TLS) e em repouso</li>
              <li>Controle de acesso baseado em funções (RBAC)</li>
              <li>Autenticação multifator para profissionais de saúde</li>
              <li>Auditoria e logs de acesso</li>
              <li>Backup regular e recuperação de desastres</li>
              <li>Conformidade com padrões de segurança da informação em saúde</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Retenção de Dados</h2>
            <p className="text-gray-700">
              Os dados de saúde são mantidos pelo prazo mínimo de <strong>20 anos</strong> após
              o último atendimento, conforme Resolução CFM nº 1.821/2007 e Código de Ética Médica.
              Após esse período, os dados poderão ser anonimizados para fins de pesquisa ou
              eliminados de forma segura.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Seus Direitos (LGPD)</h2>
            <p className="text-gray-700 mb-4">
              Você tem direito a:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Confirmação e acesso:</strong> Saber se tratamos seus dados e acessá-los</li>
              <li><strong>Correção:</strong> Solicitar correção de dados incompletos ou desatualizados</li>
              <li><strong>Anonimização ou bloqueio:</strong> De dados desnecessários ou tratados irregularmente</li>
              <li><strong>Portabilidade:</strong> Receber seus dados em formato estruturado</li>
              <li><strong>Eliminação:</strong> De dados tratados com consentimento (exceto obrigações legais)</li>
              <li><strong>Informação sobre compartilhamento:</strong> Com quais entidades seus dados foram compartilhados</li>
              <li><strong>Revogação de consentimento:</strong> A qualquer momento (não afeta tratamentos anteriores)</li>
            </ul>
            <p className="text-gray-700 mt-4">
              <strong>Importante:</strong> Alguns direitos podem ser limitados por obrigações legais
              de manutenção de prontuários médicos e sigilo profissional.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Cookies e Tecnologias Similares</h2>
            <p className="text-gray-700">
              Utilizamos cookies essenciais para funcionamento do sistema (autenticação, sessão).
              Não utilizamos cookies de rastreamento ou publicidade.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Menores de Idade</h2>
            <p className="text-gray-700">
              O tratamento de dados de menores de 18 anos é realizado com consentimento de pelo
              menos um dos pais ou responsável legal, conforme Art. 14 da LGPD.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Transferência Internacional</h2>
            <p className="text-gray-700">
              Alguns de nossos prestadores de serviço (como Anthropic) podem processar dados fora
              do Brasil. Garantimos que tais transferências atendem aos requisitos da LGPD,
              incluindo cláusulas contratuais padrão e garantias adequadas de proteção.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Alterações nesta Política</h2>
            <p className="text-gray-700">
              Podemos atualizar esta política periodicamente. Alterações significativas serão
              comunicadas com pelo menos 30 dias de antecedência via e-mail ou WhatsApp.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contato e Encarregado de Dados (DPO)</h2>
            <p className="text-gray-700 mb-4">
              Para exercer seus direitos ou esclarecer dúvidas sobre esta política:
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <p className="text-gray-700 mb-2">
                <strong>Encarregado de Proteção de Dados (DPO):</strong>
              </p>
              <p className="text-gray-700 mb-1">E-mail: privacidade@telos.ai</p>
              <p className="text-gray-700 mb-1">Telefone: +55 83 9166-4904</p>
              <p className="text-gray-700">Endereço: [Endereço da clínica]</p>
            </div>
            <p className="text-gray-700 mt-4">
              Você também pode contatar a Autoridade Nacional de Proteção de Dados (ANPD) em
              caso de reclamações não resolvidas: <a href="https://www.gov.br/anpd"
                className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                www.gov.br/anpd
              </a>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Sigilo Médico</h2>
            <p className="text-gray-700">
              Todos os dados de saúde são tratados com sigilo profissional conforme Código de
              Ética Médica (Resolução CFM 2.217/2018) e legislação aplicável. O acesso é
              restrito a profissionais com dever legal de sigilo.
            </p>
          </section>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Esta política está em conformidade com a Lei Geral de Proteção de Dados
              (Lei 13.709/2018), Resolução CFM nº 1.821/2007, Código de Ética Médica e
              demais normativas aplicáveis à área da saúde.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
