export const fileToBase64 = (file: Blob): Promise<string> => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => {
    // Remove the data URL prefix
    const base64 = (reader.result as string).split(',')[1];
    resolve(base64);
  };

  reader.onerror = reject;
  reader.readAsDataURL(file);
});

export const urlToBase64 = (url: string): Promise<string> =>
  fetch(url)
    .then(res => res.blob())
    .then(fileToBase64);

export const urlToFile = (url: string): Promise<File> =>
  fetch(url)
    .then(res => res.blob())
    .then(blob => {
      let filename: string;

      const urlPath = new URL(url).pathname;
      const urlFilename = urlPath.split('/').pop();
    
      if (urlFilename && urlFilename.includes('.')) {
        filename = urlFilename;
      } else {
        const mimeType = blob.type;
        const extension = mimeType.split('/')[1] || 'jpg'; // Default to jpg
        filename = `image.${extension}`;
      }
  
      return new File([blob], filename, {
        type: blob.type,
        lastModified: Date.now()
      });
    });

export const parseOpenAIResponse = (data: any) => {
  const choices = (data.choices || []);
  if (choices.length === 0) {
    console.warn('Response with no choices', data);
    return;
  }

  const result = choices.find(c => c.message.content)?.message?.content;
  if (!result) {
    console.warn('Response with no result content', data);
    return;
  }

  try {
    const str = Array.isArray(result) ? result.find(r => r.type === 'text')?.text : result;
    
    // Strip markdown container, if any
    const match = str.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, str];
    return JSON.parse(match[1]);
  } catch (error) {
    console.error(data);
    console.error(error);
    console.error('Could not parse OpenAI response');
    return;
  }
}