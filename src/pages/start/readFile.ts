export const readFile = (file: File): Promise<Blob> => 
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const contentArrayBuffer = event.target?.result as ArrayBuffer;
      const data = new Blob([contentArrayBuffer], { type: file.type });
      resolve(data);
    };

    reader.onerror = (event) => {
      reject(event.target?.error);
    };

    reader.readAsArrayBuffer(file);
  });