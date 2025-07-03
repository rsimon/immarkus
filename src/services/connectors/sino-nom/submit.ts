const BASE_PATH = 'https://kimhannom.clc.hcmus.edu.vn';

export const submit = (image: File | string, options?: Record<string, any>) => {

  const uploadImage = (imageFile: File) => {
    const formData = new FormData();
    formData.append('image_file', imageFile);

    return fetch(`${BASE_PATH}/api/web/clc-sinonom/image-upload`, {
      method: 'POST',
      body: formData
    }).then(res => res.json()).then(data => {
      console.log(data);
      return data;
    });
  }

  if (typeof image === 'string') {
    console.log('TODO');
  } else {
    return uploadImage(image);
  }

}