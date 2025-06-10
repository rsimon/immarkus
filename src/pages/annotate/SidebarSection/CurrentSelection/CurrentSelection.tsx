import { Trash2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ImageAnnotation, createBody } from '@annotorious/react';
import { useAnnotoriousManifold, useSelection } from '@annotorious/react-manifold';
import { isW3CRelationLinkAnnotation } from '@annotorious/plugin-connectors-react';
import { EntityType } from '@/model';
import { Button } from '@/ui/Button';
import { ConfirmedDelete } from '@/components/ConfirmedDelete';
import { EntityTypeBrowserDialog } from '@/components/EntityTypeBrowser';
import { PropertiesForm } from './PropertiesForm';
import { useStore } from '@/store';
import { MultiSelectionTools } from './MultiSelectionTools';

export const CurrentSelection = () => {

  const store = useStore();

  const anno = useAnnotoriousManifold();

  const selection = useSelection<ImageAnnotation>();

  const selected: ImageAnnotation[] = 
    selection.selected?.length > 0 ? selection.selected.map(s => s.annotation) : [];

  // Returns true if there is a single, empty annotation selected
  const isEmptyAnnotationSelected = useMemo(() =>
    selection.selected?.length === 1 && (
      !selection.selected[0].annotation.bodies || 
       selection.selected[0].annotation.bodies.length === 0
    )
  , [selection]);

  const ref = useRef<HTMLButtonElement>(null);

  const [showSearchDialog, setShowSearchDialog] = useState(false);

  const [showAsEmpty, setShowAsEmpty] = useState(isEmptyAnnotationSelected);

  useEffect(() => {
    if (selected.length === 1) { 
      ref.current?.focus();

      const sel = selected[0]

      const hasRelations = store.hasRelatedAnnotations(sel.id);
      const hasBodies = sel.bodies && sel.bodies.length > 0;

      store.findAnnotation(sel.id).then(result => {
        if (result) {
          const [_, source] = result;

          const id = 'uri' in source ? `iiif:${source.manifestId}:${source.id}` : source.id;
          store.getAnnotations(id).then(all => {
            const links = all.filter(a => isW3CRelationLinkAnnotation(a));
            const hasLinks = links.find(link => link.body === sel.id || link.target === sel.id);
            setShowAsEmpty(!(hasRelations || hasBodies || hasLinks));
          });
        }
      });
    } else {
      setShowAsEmpty(true);
    }
  }, [selected.map(s => s.id).join('-'), isEmptyAnnotationSelected, store]);

  const onDelete = (annotation: ImageAnnotation) => 
    anno.deleteAnnotation(annotation.id);

  const onBulkDelete = (annotations: ImageAnnotation[]) =>
    anno.bulkDeleteAnnotations(annotations);

  const onKeyDown = (evt: React.KeyboardEvent) => {
    const ignore = ['Alt', 'Control', 'Meta', 'Shift', 'Tab'];
    if (!ignore.includes(evt.key) && !showSearchDialog)
      setShowSearchDialog(true)
  }

  const onAddEntityType = (annotations: ImageAnnotation[], entity: EntityType) => {
    const updated: ImageAnnotation[] = annotations.map(a => { 
      const body = createBody(a, {
          type: 'Dataset',
          purpose: 'classifying',
          source: entity.id
        }, new Date());

      return {
        ...a,
        bodies: [...a.bodies, body]
      }
    });

    anno.bulkUpdateAnnotations(updated);

    setShowSearchDialog(false);
  }

  return (
    <>
      {selected.length === 0 ? (
        <div className="flex rounded text-sm justify-center items-center w-full text-muted-foreground">
          No annotation selected
        </div> 
      ) : selected.length === 1 ? (
        <div 
          key={selected[0].id}
          className="flex flex-col grow h-full max-w-full">
          {showAsEmpty ? (
            <div className="flex grow justify-center items-center">
              <div>
                <Button
                  ref={ref}
                  onClick={() => setShowSearchDialog(true)}
                  onKeyDown={onKeyDown}
                  className="px-3 mr-2 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2">Add Tag</Button>

                <Button
                  onClick={() => setShowAsEmpty(false)}
                  variant="outline">Add Note</Button>
              </div>
            </div>
          ) : (
            <PropertiesForm 
              annotation={selected[0]} 
              onAddTag={() => setShowSearchDialog(true)} />
          )}

          <footer>
            <ConfirmedDelete
              variant="destructive" 
              className="w-full mt-2 mb-2"
              title="Delete Annotation"
              message="Are you sure you want to delete this annotation?"
              onConfirm={() => onDelete(selected[0])}>
              <Trash2 className="w-4 h-4 mr-2" /> Delete Annotation
            </ConfirmedDelete>
          </footer>
        </div>
      ) : (
        <MultiSelectionTools 
          selected={selected}
          onAddTag={() => setShowSearchDialog(true)} 
          onDeleteSelected={() => onBulkDelete(selected)}
          onKeyDown={onKeyDown} />
      )}

      <EntityTypeBrowserDialog 
        open={showSearchDialog} 
        onAddEntityType={entity => onAddEntityType(selected, entity)}
        onCancel={() => setShowSearchDialog(false)} />
    </>
  )

}