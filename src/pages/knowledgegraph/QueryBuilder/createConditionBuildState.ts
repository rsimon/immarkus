import { BuildStep } from './BuildStep';

export const buildState = (steps?: BuildStep[]): BuildStep[] => {

  if (!steps)
    return [{
      options: [
        'All nodes',
        'All images',
        'All folders',
        'All entity classes'
      ]
    }];

  return [];

}