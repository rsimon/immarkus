import { fileToBase64 } from '@/services/utils';

const sha256 = async (message: string, secret: string = '', encoding = 'hex') => {
  const encoder = new TextEncoder();
            
  if (secret) {
    const key = await crypto.subtle.importKey(
      'raw',
      typeof secret === 'string' ? encoder.encode(secret) : secret,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(message)
    );
    
    if (encoding === 'hex') {
      return Array.from(new Uint8Array(signature))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
    }

    return new Uint8Array(signature);
  } else {
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(message));
                
    if (encoding === 'hex') {
      return Array.from(new Uint8Array(hashBuffer))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
    }

    return new Uint8Array(hashBuffer);
  }
}

const getDate = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  const year = date.getUTCFullYear();
  const month = ('0' + (date.getUTCMonth() + 1)).slice(-2);
  const day = ('0' + date.getUTCDate()).slice(-2);
  return `${year}-${month}-${day}`;
}

const getHash = (message: string, encoding = 'hex') => sha256(message, '', encoding);

const createRequest = async (secretId: string, secretKey: string, payload: any) => {
  const host = 'ocr.intl.tencentcloudapi.com';
  const service = 'ocr';
  const region = undefined; // 'ap-seoul';
  const action = 'GeneralAccurateOCR';
  const version = '2018-11-19';
  const timestamp = parseInt(String(new Date().getTime() / 1000));
  const date = getDate(timestamp);

  const signedHeaders = 'content-type;host';
  const hashedRequestPayload = await getHash(payload);
  const httpRequestMethod = 'POST';
  const canonicalUri = '/';
  const canonicalQueryString = '';
  const canonicalHeaders = 
    'content-type:application/json; charset=utf-8\n' + 
    'host:' + host + '\n';

  const canonicalRequest = 
    httpRequestMethod + '\n' +
    canonicalUri + '\n' +
    canonicalQueryString + '\n' +
    canonicalHeaders + '\n' +
    signedHeaders + '\n' +
    hashedRequestPayload;

  const algorithm = 'TC3-HMAC-SHA256';
  const hashedCanonicalRequest = await getHash(canonicalRequest);
  const credentialScope = date + '/' + service + '/' + 'tc3_request';
  const stringToSign = 
    algorithm + '\n' +
    timestamp + '\n' +
    credentialScope + '\n' +
    hashedCanonicalRequest;

  const kDate = await sha256(date, 'TC3' + secretKey);
  const kService = await sha256(service, kDate.toString());
  const kSigning = await sha256('tc3_request', kService.toString());
  const signature = await sha256(stringToSign, kSigning.toString(), 'hex');

  const authorization = 
    algorithm + ' ' +
    'Credential=' + secretId + '/' + credentialScope + ', ' +
    'SignedHeaders=' + signedHeaders + ', ' +
    'Signature=' + signature;

  const headers = {
    'Authorization': authorization,
    'Content-Type': 'application/json; charset=utf-8',
    'Host': host,
    'X-TC-Action': action,
    'X-TC-Timestamp': timestamp.toString(),
    'X-TC-Version': version,
  };

  if (region)
    headers['X-TC-Region'] = region;

  return fetch(`https://${host}`, {
    method: httpRequestMethod,
    headers: headers,
    body: JSON.stringify(payload)
  }).then(res => res.text());
}

export const submit = (image: File | string, options?: Record<string, any>) => {
  const secretId = options['secret-id'];
  const secretKey = options['secret-key'];

  // Should never happen
  if (!secretId || !secretKey)
    throw new Error('Missing credentials');

  const submit = (params: any) => new Promise((resolve, reject) => {
    console.log('submitting', params);

    createRequest(secretId, secretKey, params).then(response => {
      console.log(response);

      resolve({});
    })

    // const data = await response.text();
    // return { success: true, data: data, status: response.status };
    /*
    const credential = new Credential(secretId, secretKey);

    console.log('credential', credential);

    const httpProfile = new HttpProfile();
    httpProfile.endpoint = 'ocr.intl.tencentcloudapi.com';

    console.log('httpprofile', httpProfile);

    const clientProfile = new ClientProfile();
    clientProfile.httpProfile = httpProfile;
    clientProfile.signMethod = 'TC3-HMAC-SHA256';

    console.log('clientProfile', clientProfile);

    const client = new Client(credential, 'ap-seoul', clientProfile);

    console.log('client', client)

    const request = new Models.GeneralAccurateOCRRequest();
    request.from_json_string(JSON.stringify(params));

    console.log('request', request);

    client.GeneralAccurateOCR(request, (error: any, response: any) => {
      if (error) {
        reject(error);
      } else {
        console.log(response);
        const result = response.to_json_string();
        resolve(JSON.parse(result));
      }
    });
    */
  });

  if (typeof image === 'string') {
    return submit({
      ImageUrl: image
    });
  } else {
    return fileToBase64(image as File).then(base64 => submit({
      ImageBase64: base64
    }));
  }
}