
import { genAI } from '../lib/anthropic';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env vars from .env.local or .env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function testGeminiConnection() {
    console.log('🔍 Testando conexão com Gemini AI...');
    console.log('🔑 API Key presente:', !!process.env.GOOGLE_GENERATIVE_AI_API_KEY);

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const result = await model.generateContent('Responda apenas com a palavra "OK" se você estiver funcionando.');
        const response = result.response.text();

        console.log('✅ Resposta da API:', response);
        console.log('🎉 Conexão com a IA ESTÁ FUNCIONANDO CORRETAMENTE!');
        return true;

    } catch (error: any) {
        console.error('❌ ERRO AO CONECTAR COM GEMINI:');
        console.error(error);
        return false;
    }
}

testGeminiConnection();
