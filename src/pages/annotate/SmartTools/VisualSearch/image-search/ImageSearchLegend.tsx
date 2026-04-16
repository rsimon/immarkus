import { useMemo } from 'react';
import { ResolvedSearchResult } from './ImageSearchDialog';

const THIS_IMAGE = '#1F77B4';

const OTHER_PALETTE = [
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

interface ImageSearchLegendProps {

  queryImageId: string;

  results: ResolvedSearchResult[];

}

export const ImageSearchLegend = (props: ImageSearchLegendProps) => {

  console.log(props.queryImageId);

  const distinct = useMemo(() => {
    const d = [...new Set(props.results.map(r => r.image))];
    console.log(d);
    return d;
  }, [props.results]);

  return (
    <div>
      Legend
    </div>
  )

}