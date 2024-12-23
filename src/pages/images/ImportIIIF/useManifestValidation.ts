import { useCallback, useState } from 'react';
import { IIIF } from '@allmaps/iiif-parser';
import { parseIIIFLabel } from '@/utils/parseIIIFLabel';

// Modified from Recogito Studio (AGPL) https://github.com/recogito/recogito-client/
const isValidHTTPSURL = (str: string) => {
  if (!str) return false;

  if (!str.startsWith('https://'))
    return false;

  const pattern = 
    new RegExp('^https:\\/\\/' + // HTTPS protocol
     '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
     '((\\d{1,3}\\.){3}\\d{1,3}))'); // OR ip (v4) address

  return pattern.test(str);
}

interface ValidationResult {

  isValid: boolean;

  manifest?: {

    uri: string;

    type: 'image' | 'manifest';

    majorVersion: number;
  
    label?: string;
  
  }

  error?: 'invalid_url' | 'not_https' | 'fetch_error' | 'invalid_manifest' | 'unsupported_manifest_type';

}

const validateIIIF = (url: string): Promise<ValidationResult> => {
  if (isValidHTTPSURL(url)) {
    return fetch(url)
      .then((response) => response.json())
      .then(data => {
          try {
            const parsed = IIIF.parse(data);

            if (parsed.type === 'image') {
              // Image API v1/2/3
              return {
                isValid: true,
                manifest: {
                  uri: parsed.uri,
                  type: 'image',
                  majorVersion: parsed.majorVersion
                }
              } as ValidationResult;
            } else if (parsed.type === 'manifest') {
              // Presentation API v1/2/3
              const label = parseIIIFLabel(parsed.label);
              return {
                isValid: true,
                manifest: {
                  uri: parsed.uri,
                  type: 'manifest',
                  majorVersion: parsed.majorVersion, 
                  label 
                }
              } as ValidationResult;
            } else {
              // Probably collection manifest... unsupported!
              console.error('Unsupported IIIF type', parsed);
              return {
                isValid: false,
                error: 'unsupported_manifest_type'
              } as ValidationResult;
            }
          } catch (error) {
            // Exception during parse - return the error
            console.error(error);
            return {
              isValid: false,
              error: 'invalid_manifest'
            } as ValidationResult;
          }
        })
        .catch(error => {
          console.error(error);

          // HTTP fetch or connection error
          return {
            isValid: false,
            error: 'fetch_error'
          };
        });
  } else {
    return Promise.resolve({
      isValid: false,
      error: url.startsWith('https') ? 'invalid_url' : 'not_https'
    });
  } 
}

export const useManifestValidation = () => {

  const [isFetching, setIsFetching] = useState(false);

  const [result, setResult] = useState<ValidationResult | undefined>();

  const validate = useCallback((url: string) => {
    setIsFetching(false);
    setResult(undefined);

    if (!url) return;

    validateIIIF(url).then(result => {
      setResult(result);
      setIsFetching(false);
    });
  }, []);

  return {
    isFetching,
    result,
    validate
  }

}