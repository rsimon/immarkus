import { createContext, useContext, useMemo } from 'react';

export const HoveredImageIdContext = createContext<string | undefined>(undefined);

export const useEmphasized = (imageId: string) => {
  const emphasizedId =  useContext(HoveredImageIdContext);
  
  const isEmphasized = imageId === emphasizedId;
  const hasEmphasis = Boolean(emphasizedId);

  return useMemo(() => ({ isEmphasized, hasEmphasis }), [isEmphasized, hasEmphasis]);
};