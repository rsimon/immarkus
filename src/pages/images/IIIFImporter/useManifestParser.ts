import { useCallback } from 'react';
import { identifyIIIF, parseIIIF } from '@/utils/iiif/lib';

const isPlausibleURL = (str: string) => {
  if (!str.startsWith('https://'))
    return false;

  const pattern = 
    new RegExp('^https:\\/\\/' + // HTTPS protocol
     '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
     '((\\d{1,3}\\.){3}\\d{1,3}))'); // OR ip (v4) address

  return pattern.test(str);
}

const preValidate = (url: string) => {
  if (!isPlausibleURL(url)) {
    return { type: 'VALIDATION_ERROR', message: 'Please enter a valid URL – must start with https://' };
  }
}

export const useManifestParser = () => {

  const identify = useCallback((url: string) => {
    const error = preValidate(url);
    if (error) {
      return Promise.resolve({ error });
    } else {
      return fetch(url)
        .then(res => res.json())
        .then(data => identifyIIIF(data))
        .catch(error => {
          console.error(error);
          return { error: { type: 'FETCH_ERROR', message: error.message }};
        });
    }
  }, []);

  const parse = useCallback((url: string) => {
    const error = preValidate(url);
    if (error) {
      return Promise.resolve({ error });
    } else {
      return fetch(url)
        .then(res => res.json())
        .then(data => parseIIIF(data))
        .catch(error => {
          console.error(error);
          return { error: { type: 'FETCH_ERROR', message: error.message }};
        });
    }
  }, []);

  return { identify, parse };

}