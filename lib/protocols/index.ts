/**
 * Índice de Protocolos Pós-Operatórios
 * Exporta todos os protocolos disponíveis
 */

export { HEMORROIDECTOMIA_PROTOCOL, PROTOCOL_FAQ, getProtocolForSurgery } from './hemorroidectomia-protocol';
export { FISSURECTOMIA_PROTOCOL, FISSURECTOMIA_FAQ } from './fissurectomia-protocol';
export { FISTULA_ANAL_PROTOCOL, FISTULA_ANAL_FAQ } from './fistula-anal-protocol';
export { DOENCA_PILONIDAL_PROTOCOL, DOENCA_PILONIDAL_FAQ } from './doenca-pilonidal-protocol';

/**
 * Lista de cirurgias suportadas pelo sistema
 */
export const SUPPORTED_SURGERIES = [
  {
    id: 'hemorroidectomia',
    name: 'Hemorroidectomia',
    description: 'Tratamento cirúrgico de hemorroidas',
    region: 'anal',
  },
  {
    id: 'fissurectomia',
    name: 'Fissurectomia',
    description: 'Tratamento cirúrgico de fissura anal',
    region: 'anal',
  },
  {
    id: 'fistula_anal',
    name: 'Tratamento Cirúrgico de Fístula Anal',
    description: 'LIFT, Fistulotomia, Fistulectomia, Colocação de Seton',
    region: 'anal',
  },
  {
    id: 'doenca_pilonidal',
    name: 'Tratamento Cirúrgico de Doença Pilonidal',
    description: 'Tratamento de cisto pilonidal na região sacrococcígea',
    region: 'sacrococcigea',
  },
] as const;

export type SurgeryType = typeof SUPPORTED_SURGERIES[number]['id'];
