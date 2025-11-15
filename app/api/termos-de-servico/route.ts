import { NextResponse } from 'next/server';

export async function GET() {
  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Termos de Serviço | Telos.AI</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; }
    .container { max-width: 800px; margin: 0 auto; padding: 40px 20px; background: white; min-height: 100vh; }
    h1 { color: #1a1a1a; margin-bottom: 30px; font-size: 2.5em; }
    h2 { color: #2c3e50; margin-top: 30px; margin-bottom: 15px; font-size: 1.8em; }
    p, li { margin-bottom: 15px; color: #555; }
    ul { margin-left: 30px; }
    .warning { background: #fff3cd; padding: 20px; border-left: 4px solid #ffc107; margin: 20px 0; }
    .contact { background: #e7f3ff; padding: 20px; border-radius: 8px; margin: 30px 0; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Termos de Serviço</h1>
    <p><strong>Última atualização:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>

    <h2>1. Aceitação dos Termos</h2>
    <p>Ao utilizar o sistema Telos.AI de acompanhamento pós-operatório ("Serviço"), você concorda com estes Termos de Serviço. Se não concorda, não utilize o Serviço.</p>

    <h2>2. Descrição do Serviço</h2>
    <p>O Telos.AI é um sistema que:</p>
    <ul>
      <li>Envia questionários automatizados via WhatsApp após procedimentos cirúrgicos</li>
      <li>Monitora sintomas e evolução pós-operatória</li>
      <li>Utiliza inteligência artificial (Claude AI) para análise de respostas</li>
      <li>Alerta a equipe médica sobre possíveis complicações</li>
      <li>Facilita comunicação entre paciente e equipe médica</li>
    </ul>

    <h2>3. Natureza do Serviço</h2>
    <div class="warning">
      <p><strong>ATENÇÃO:</strong> Este serviço é complementar e NÃO substitui consultas médicas presenciais.</p>
      <ul>
        <li>O sistema utiliza IA para triagem, mas decisões médicas são tomadas por profissionais qualificados</li>
        <li>Em emergências, procure atendimento médico imediatamente ou ligue 192 (SAMU)</li>
        <li>Respostas são orientações gerais, não diagnóstico ou prescrição médica</li>
      </ul>
    </div>

    <h2>4. Elegibilidade</h2>
    <ul>
      <li>Ser paciente submetido a procedimento cirúrgico por médico que utiliza Telos.AI</li>
      <li>Ter 18 anos ou mais, ou consentimento de responsável legal</li>
      <li>Possuir WhatsApp ativo</li>
      <li>Concordar com a Política de Privacidade</li>
    </ul>

    <h2>5. Comunicação via WhatsApp</h2>
    <p>Você autoriza:</p>
    <ul>
      <li>Recebimento de mensagens automatizadas via WhatsApp Business API</li>
      <li>Envio de questionários de acompanhamento</li>
      <li>Recebimento de orientações da equipe médica</li>
      <li>Comunicação de alertas relevantes</li>
    </ul>

    <h2>6. Privacidade</h2>
    <p>O tratamento de dados pessoais e de saúde está descrito em nossa <a href="/api/privacidade">Política de Privacidade</a>, em conformidade com LGPD e normas do CFM.</p>

    <h2>7. Contato</h2>
    <div class="contact">
      <p><strong>Suporte Telos.AI:</strong></p>
      <p>E-mail: contato@telos.ai</p>
      <p>Telefone: +55 83 9166-4904</p>
    </div>

    <p style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 0.9em; color: #777;">
      Estes termos estão em conformidade com CDC (Lei 8.078/90), LGPD (Lei 13.709/2018), Marco Civil da Internet e Código de Ética Médica.
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
