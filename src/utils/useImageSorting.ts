import { useEffect, useState } from 'react';
import { SortOrder } from 'primereact/datatable';

const KEY_IMAGE_SORTING = 'immarkus:image-sorting';

export interface Sorting { 
  
  sortField: string;
  
  sortOrder: SortOrder;

}

export const useImageSorting = () => {

  const [sorting, setSorting] = useState<Sorting | null>(() => {
    const saved = localStorage.getItem(KEY_IMAGE_SORTING);
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (sorting)
      localStorage.setItem(KEY_IMAGE_SORTING, JSON.stringify(sorting));
    else
      localStorage.removeItem(KEY_IMAGE_SORTING);
  }, [sorting, KEY_IMAGE_SORTING]);

  const onSort = (sorting?: Sorting) => {
    if (sorting) {
      const { sortField, sortOrder } = sorting;
      setSorting({ sortField, sortOrder });
    } else {
      setSorting(null);
    }
  }

  return {
    sortField: sorting?.sortField,
    sortOrder: sorting?.sortOrder,
    sorting,
    onSort  
  };

}
