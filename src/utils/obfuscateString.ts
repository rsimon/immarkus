const KEY = '39c3ffee-c927-4072-86ad-5b972932c2ea'; 

const xorEncode = (str: string) => 
  str.split('').map((char, i) =>
    String.fromCharCode(char.charCodeAt(0) ^ KEY.charCodeAt(i % KEY.length))
  ).join('');

export const obfuscate = (str: string) => {
  const encoded = xorEncode(str);
  return btoa(encoded);
}

export const deobfuscate = (obfuscated: string) => {
  const encoded = atob(obfuscated);
  return xorEncode(encoded);
}