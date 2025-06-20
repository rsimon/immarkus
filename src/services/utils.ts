export const fileToBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => {
    // Remove the data URL prefix
    const base64 = (reader.result as string).split(',')[1];
    resolve(base64);
  };

  reader.onerror = reject;
  reader.readAsDataURL(file);
});