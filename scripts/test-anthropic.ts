
import { anthropic } from '../lib/anthropic';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env vars from .env.local or .env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function testAnthropicConnection() {
    console.log('🔍 Testando conexão com Anthropic AI...');
    console.log('🔑 API Key presente:', !!process.env.ANTHROPIC_API_KEY);

    if (process.env.ANTHROPIC_API_KEY) {
        console.log('🔑 Key começa com:', process.env.ANTHROPIC_API_KEY.substring(0, 7) + '...');
    }

    try {
        const message = await anthropic.messages.create({
            model: 'claude-sonnet-4-5-20250929',
            max_tokens: 100,
            messages: [
                { role: 'user', content: 'Responda apenas com a palavra "OK" se você estiver funcionando.' }
            ]
        });

        const response = message.content[0].type === 'text' ? message.content[0].text : '';

        console.log('✅ Resposta da API:', response);
        console.log('🎉 Conexão com a IA ESTÁ FUNCIONANDO CORRETAMENTE!');
        return true;

    } catch (error: any) {
        console.error('❌ ERRO AO CONECTAR COM ANTHROPIC:');
        if (error.status === 401) {
            console.error('⛔ Erro 401: API Key inválida ou não autorizada.');
        } else if (error.status === 429) {
            console.error('⏳ Erro 429: Rate limit excedido ou sem créditos.');
        } else {
            console.error(error);
        }
        return false;
    }
}

testAnthropicConnection();
