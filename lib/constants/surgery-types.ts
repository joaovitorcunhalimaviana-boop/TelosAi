export const SURGERY_TYPES = {
  hemorroidectomia: 'hemorroidectomia',
  fissurectomia: 'fissurectomia',
  fistula_anal: 'fistula_anal',
  doenca_pilonidal: 'doenca_pilonidal',
} as const;

export type SurgeryType = typeof SURGERY_TYPES[keyof typeof SURGERY_TYPES];

export const SURGERY_TYPE_LABELS: Record<string, string> = {
  hemorroidectomia: 'Hemorroidectomia',
  fissurectomia: 'Fissurectomia',
  fissura: 'Fissurectomia',
  fistula_anal: 'Fístula Anal',
  fistula: 'Fístula Anal',
  doenca_pilonidal: 'Doença Pilonidal',
  pilonidal: 'Doença Pilonidal',
  cisto_pilonidal: 'Doença Pilonidal',
};

export function getSurgeryTypeLabel(type: string | null | undefined): string {
  if (!type) return 'Não informado';
  const normalized = type.toLowerCase().replace(/\s+/g, '_');
  return SURGERY_TYPE_LABELS[normalized] || type;
}
