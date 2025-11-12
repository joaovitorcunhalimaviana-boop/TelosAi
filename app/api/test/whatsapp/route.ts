import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Verificar se as credenciais estão configuradas
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

    if (
      !phoneNumberId ||
      !accessToken ||
      phoneNumberId === 'seu-phone-number-id-aqui' ||
      accessToken === 'seu-access-token-aqui'
    ) {
      return NextResponse.json(
        {
          configured: false,
          error: 'Variáveis WHATSAPP_PHONE_NUMBER_ID e WHATSAPP_ACCESS_TOKEN não configuradas no arquivo .env',
        },
        { status: 400 }
      );
    }

    // Testar conexão com a API do WhatsApp
    // Fazemos uma requisição GET para buscar informações do número
    const WHATSAPP_API_URL = 'https://graph.facebook.com/v18.0';
    const response = await fetch(`${WHATSAPP_API_URL}/${phoneNumberId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        {
          configured: true,
          connected: false,
          error: errorData.error?.message || 'Erro ao conectar com a API do WhatsApp',
          details: errorData,
        },
        { status: 500 }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      configured: true,
      connected: true,
      phoneNumberId,
      phoneNumber: data.display_phone_number,
      verifiedName: data.verified_name,
      quality: data.quality_rating,
    });
  } catch (error: any) {
    console.error('Erro ao testar WhatsApp API:', error);

    return NextResponse.json(
      {
        configured: true,
        connected: false,
        error: error.message || 'Erro ao conectar com a API do WhatsApp',
      },
      { status: 500 }
    );
  }
}
