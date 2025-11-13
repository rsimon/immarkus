export interface ExternalAuthority {

  name: string;

  description?: string;

  type: 'IFRAME';

  search_pattern?: string | Object;

  external_url_pattern?: string;

  canonical_id_pattern?: string;

}

export const findMatchingPattern = (patternObject: object, value: string) => {
  const match = Object.entries(patternObject).find(([ key ]) => {
    if (key === "*") return false;
    const pattern = key.slice(1, -1);
    return new RegExp(pattern).test(value);
  });
  
  return match ? match[1] : patternObject["*"];
}