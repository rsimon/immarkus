// https://docs.google.com/document/d/1NSZnDdWgTp7SXW0PkAH8GmcTBja71n62/edit

import { urlToFile } from "@/services/utils";

const { VITE_KIM_HAN_NOM_KEY } = import.meta.env;

const BASE_PATH = import.meta.env.DEV 
  ? '' // Goes through Vite proxy in dev mode because of CORS
  : 'https://kimhannom.clc.hcmus.edu.vn';

const CREATE_TOKEN_ENDPOINT = 
  `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${VITE_KIM_HAN_NOM_KEY}`;

const REFRESH_TOKEN_ENDPOINT = 
  `https://securetoken.googleapis.com/v1/token?key=${VITE_KIM_HAN_NOM_KEY}` ;

const createToken = (email: string, password: string) => 
  fetch(CREATE_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email, 
      password,
      returnSecureToken: true
    })
  }).then(res => res.json());

const refreshToken = (token: string) =>
  fetch(REFRESH_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      grant_type: 'refresh_token',
      refresh_token: token
    })
  }).then(res => res.json());

const getToken = (email: string, password: string) => {
  const BASE_KEY = 'immarkus:services:sino-nom:';

  const persistedIdToken = localStorage.getItem(`${BASE_KEY}idToken`);
  const persistedRefreshToken = localStorage.getItem(`${BASE_KEY}refreshToken`);

  if (!persistedIdToken || !persistedRefreshToken) {
    return createToken(email, password).then(data => {
      const { idToken, refreshToken } = data;

      localStorage.setItem(`${BASE_KEY}idToken`, idToken);
      localStorage.setItem(`${BASE_KEY}refreshToken`, refreshToken);

      return { idToken, refreshToken };
    })
  } else {
    return refreshToken(persistedRefreshToken).then(data => {
      const { id_token: idToken, refresh_token: refreshToken } = data;

      localStorage.setItem(`${BASE_KEY}idToken`, idToken);
      localStorage.setItem(`${BASE_KEY}refreshToken`, refreshToken);

      return { idToken, refreshToken };
    });
  }
}

export const submit = (image: File | string, options?: Record<string, any>) => {
  const email = options['email'];
  const password = options['password'];

  if (!email || !password)
    throw new Error('Missing credentials');

  const generator = {
    id: 'KimHanNom-1',
    name: 'Kim Han Nom API (Han vertical)',
    homepage: 'https://kimhannom.clc.hcmus.edu.vn/'
  };

  // Uploads the image to Kim Han Nom API storage, receiving the file ID in return.
  const uploadImage = (imageFile: File, authToken: string): Promise<string> => {
    const formData = new FormData();
    formData.append('image_file', imageFile, imageFile.name);

    return fetch(`${BASE_PATH}/api/web/clc-sinonom/image-upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`
      },
      body: formData
    }).then(res => res.json()).then(result => {
      const { is_success, message, data } = result;
      if (is_success) {
        return data.file_name;
      } else {
        console.error(result)
        throw new Error(message);
      }
    });
  }

  const runOCR = (filename: string, authToken: string) =>
    fetch(`${BASE_PATH}/api/web/clc-sinonom/image-ocr`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ocr_id: 1, // 1: Han vertical (currently the only option)
        file_name: filename
      })
    }).then(res => res.json()).then(result => {
      const { is_success, message, data } = result;
      if (is_success) {
        return { data, generator };
      } else {
        console.error(result)
        throw new Error(message);
      }
    });

  return getToken(email, password).then(({ idToken }) => {
    const promise = (typeof image === 'string')
      ? urlToFile(image)
      : Promise.resolve(image);

    return promise.then(imageFile => 
      uploadImage(imageFile, idToken).then(imageName => runOCR(imageName, idToken)));
  });

}