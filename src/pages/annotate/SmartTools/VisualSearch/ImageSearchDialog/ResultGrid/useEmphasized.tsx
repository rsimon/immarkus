import { useDebounce } from '@/utils/useDebounce';
import { createContext, ReactNode, useContext, useMemo, useState } from 'react';

export const HoveredImageIdContext = createContext<string | undefined>(undefined);

interface HoverImageIdProviderProps {

  hoveredId?: string;

  children: ReactNode;

}

export const HoveredImageIdProvider = (props: HoverImageIdProviderProps) => {
  const debouncedId = useDebounce(props.hoveredId, 10);

  return (
    <HoveredImageIdContext.Provider value={debouncedId}>
      {props.children}
    </HoveredImageIdContext.Provider>
  )
}

export const useEmphasized = (imageId: string) => {
  const emphasizedId = useContext(HoveredImageIdContext);

  const isEmphasized = imageId === emphasizedId;
  const hasEmphasis = Boolean(emphasizedId);

  return useMemo(() => ({ isEmphasized, hasEmphasis }), [isEmphasized, hasEmphasis]);
}