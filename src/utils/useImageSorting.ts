import { useEffect, useState } from 'react';
import { SortOrder } from 'primereact/datatable';
import { CanvasInformation, FileImage } from '@/model';

const KEY_IMAGE_SORTING = 'immarkus:image-sorting';

export interface Sorting { 
  
  sortField: string;
  
  sortOrder: SortOrder;

}

export const useImageSorting = () => {

  const [sorting, setSorting] = useState<Sorting>(() => {
    const saved = localStorage.getItem(KEY_IMAGE_SORTING);
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem(KEY_IMAGE_SORTING, JSON.stringify(sorting));
  }, [sorting, KEY_IMAGE_SORTING]);

  const onSort = (sorting: Sorting) => {
    const { sortField, sortOrder } = sorting;
    setSorting({ sortField, sortOrder });
  }

  return {
    sortField: sorting?.sortField,
    sortOrder: sorting?.sortOrder,
    onSort  
  };

}