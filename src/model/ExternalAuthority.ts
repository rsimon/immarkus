export interface ExternalAuthority {

  name: string;

  description?: string;

  type: 'IFRAME';

  search_pattern?: string;

  external_url_pattern?: string;

  canonical_id_pattern?: string;

}