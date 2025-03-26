export const DEFAULT_COLOR = '#c2c2c2';

export const isValidColor = (color?: string) => {
  if (!color) return false;
  
  const hexColorRegex = /^#?([0-9A-Fa-f]{3}){1,2}$/;  
  return hexColorRegex.test(color);
}

export const getRandomColor = () => {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);

  return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}

export const getBrightness = (color: string) => {
  const hexColor = color.replace(/^#/, '');

  const r = parseInt(hexColor.slice(0, 2), 16) / 255;
  const g = parseInt(hexColor.slice(2, 4), 16) / 255;
  const b = parseInt(hexColor.slice(4, 6), 16) / 255;

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export const getForegroundColor = (color: string) => {
  const brightness = getBrightness(color);
  return brightness > 0.5 ? '#000' : '#fff' 
}