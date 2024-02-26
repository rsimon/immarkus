import { ExternalAuthority } from '@/model';

export const matchPattern = (input: string, pattern: string) => {
  const markerIdx = pattern.indexOf('{{id}}');

  if (markerIdx === -1)
    return input === pattern;

  const prefix = pattern.substring(0, markerIdx);
  const suffix = pattern.substring(markerIdx + '{{id}}'.length);

  if (input.startsWith(prefix) && input.endsWith(suffix)) {
    const startIdx = prefix.length;
    const endIdx = input.length - suffix.length;
    return input.substring(startIdx, endIdx);    
  }
}

export const formatIdentifier = (id: string, authorities: ExternalAuthority[]) => {
  if (!id) return;

  const matchedId = authorities.reduce((resolved, a) => {
    return resolved || a.canonical_id_pattern && matchPattern(id, a.canonical_id_pattern)
  }, undefined as string);

  return matchedId || id;
}