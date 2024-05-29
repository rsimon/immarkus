import { Link } from 'react-router-dom';
import { Dot, Minus, MoveLeft } from 'lucide-react';
import { RelatedAnnotation, useStore } from '@/store';
import { EntityBadge } from '@/components/EntityBadge';
import { ImageSnippet, getImageSnippet } from '@/utils/getImageSnippet';
import { useEffect, useMemo, useState } from 'react';
import { LoadedImage } from '@/model';
import { W3CImageAnnotation } from '@annotorious/react';
import { useImageSnippet } from '@/store/hooks/useImageSnippets';

interface InboundRelationCardProps {

  related: RelatedAnnotation;

}

export const InboundRelationCard = (props: InboundRelationCardProps) => {

  const { related } = props;

  const store = useStore();

  const model = store.getDataModel();

  const snippet = useImageSnippet(related.annotation as W3CImageAnnotation);

  return (
    <div className="relative border rounded text-xs shadow-sm px-2 py-2.5">
      <div className="flex gap-1.5 items-center mb-1">
        <Dot className="h-4 w-4" />
        <MoveLeft className="h-4 w-4" />

        <div className="text-xs italic">
          {related.relationName}
        </div>

        <Minus className="h-4 w-4" />

        <div>
          <EntityBadge entityType={model.getEntityType(related.sourceEntityType)} />
        </div>
      </div>

      <div className="max-w-full overflow-hidden">
        {snippet && (
          <img
            loading="lazy"
            src={URL.createObjectURL(new Blob([snippet.data]))}
            alt={related.image.name}
            className="w-20 h-20 object-cover aspect-square rounded-sm border" />
        )}

        {/*
        <Link 
          to={related.imageId}
          className="ml-6 whitespace-nowrap block max-w-full overflow-hidden text-ellipsis italic text-sky-700 hover:underline">
          {store.getImage(related.imageId).name}
        </Link>
        */}
      </div>
    </div>
  )

}