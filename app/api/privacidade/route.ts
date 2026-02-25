import { NextResponse } from 'next/server';

export async function GET() {
  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Política de Privacidade | VigIA</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; }
    .container { max-width: 800px; margin: 0 auto; padding: 40px 20px; background: white; min-height: 100vh; }
    h1 { color: #1a1a1a; margin-bottom: 30px; font-size: 2.5em; }
    h2 { color: #2c3e50; margin-top: 30px; margin-bottom: 15px; font-size: 1.8em; }
    p, li { margin-bottom: 15px; color: #555; }
    ul { margin-left: 30px; }
    .highlight { background: #fff3cd; padding: 20px; border-left: 4px solid #ffc107; margin: 20px 0; }
    .contact { background: #e7f3ff; padding: 20px; border-radius: 8px; margin: 30px 0; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Política de Privacidade</h1>
    <p><strong>Última atualização:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>

    <h2>1. Introdução</h2>
    <p>A VigIA opera o sistema de acompanhamento pós-operatório que utiliza inteligência artificial para monitorar pacientes após procedimentos cirúrgicos.</p>
    <p>Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos suas informações pessoais e dados de saúde em conformidade com a LGPD (Lei 13.709/2018) e regulamentações do CFM.</p>

    <h2>2. Dados Coletados</h2>
    <ul>
      <li><strong>Dados de Identificação:</strong> Nome completo, CPF, data de nascimento</li>
      <li><strong>Dados de Contato:</strong> Número de telefone, e-mail</li>
      <li><strong>Dados de Saúde:</strong> Tipo de cirurgia, sintomas, questionários pós-operatórios</li>
      <li><strong>Dados de Comunicação:</strong> Mensagens via WhatsApp</li>
    </ul>

    <h2>3. Base Legal e Finalidade</h2>
    <p>O tratamento é realizado com base em:</p>
    <ul>
      <li><strong>Tutela da saúde (Art. 11, II, LGPD)</strong></li>
      <li><strong>Consentimento (Art. 7, I, LGPD)</strong></li>
      <li><strong>Execução de contrato (Art. 7, V, LGPD)</strong></li>
    </ul>

    <h2>4. Compartilhamento de Dados</h2>
    <p>Dados compartilhados apenas com:</p>
    <ul>
      <li>Equipe médica responsável</li>
      <li>Meta Platforms (WhatsApp) - transmissão de mensagens</li>
      <li>Anthropic (Claude AI) - análise de sintomas</li>
      <li>Provedores de infraestrutura (Railway, Neon PostgreSQL)</li>
    </ul>
    <div class="highlight">
      <strong>Não vendemos, alugamos ou comercializamos seus dados pessoais.</strong>
    </div>

    <h2>5. Segurança dos Dados</h2>
    <ul>
      <li>Criptografia em trânsito (HTTPS/TLS) e em repouso</li>
      <li>Controle de acesso baseado em funções</li>
      <li>Autenticação multifator</li>
      <li>Auditoria e logs de acesso</li>
    </ul>

    <h2>6. Seus Direitos (LGPD)</h2>
    <p>Você tem direito a:</p>
    <ul>
      <li>Confirmação e acesso aos seus dados</li>
      <li>Correção de dados incompletos ou desatualizados</li>
      <li>Portabilidade dos dados</li>
      <li>Revogação de consentimento</li>
    </ul>

    <h2>7. Contato</h2>
    <div class="contact">
      <p><strong>Encarregado de Proteção de Dados (DPO):</strong></p>
      <p>E-mail: privacidade@vigia.ai</p>
      <p>Telefone: +55 83 9166-4904</p>
    </div>

    <p style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 0.9em; color: #777;">
      Esta política está em conformidade com a LGPD (Lei 13.709/2018), Resolução CFM nº 1.821/2007 e Código de Ética Médica.
    </p>
  </div>
</body>
</html>
  `;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}
