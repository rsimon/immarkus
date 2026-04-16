export const THIS_IMAGE_COLOR = '#1F77B4';

const OTHER_IMAGE_COLORS = [
  '#FF7F0E',
  '#2CA02C',
  '#D62728',
  '#9467BD',
  '#8C564B',
  '#E377C2',
  '#7F7F7F',
  '#BCBD22',
  '#17BECF',
  '#393B79',
  '#637939',
  '#8C6D31',
  '#843C39',
  '#7B4173',
  '#3182BD'
];

const imageColorMap = new Map<string, string>();

let colorIndex = 0;

export const getImageColor = (imageId: string) => {
  if (imageColorMap.has(imageId))
    return imageColorMap.get(imageId)!;

  const color = OTHER_IMAGE_COLORS[colorIndex % OTHER_IMAGE_COLORS.length];
  colorIndex++;

  imageColorMap.set(imageId, color);
  return color;
}

export const resetPalette = () => {
  imageColorMap.clear();
  colorIndex = 0;
}