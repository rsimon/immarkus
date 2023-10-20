// import { useEffect, useRef, useState } from 'react';
// import { Pencil, X } from 'lucide-react';
// import { createBody, useAnnotationStore, useSelection } from '@annotorious/react';
// import { EditorPaneProps } from '..';
// import { Badge } from '@/ui/Badge';
// import { Button } from '@/ui/Button';
// import { Input } from '@/ui/Input';
// import { Separator } from '@/ui/Separator';
// import { Textarea } from '@/ui/Textarea';
// import { DeleteWithConfirmation } from '../../../annotate/CurrentSelection/DeleteButton/DeleteButton';
// import { useToast } from '@/ui/Toaster';

export const AnnotationsTab = () => {
  /*

  const textarea = useRef<HTMLTextAreaElement>();

  const input = useRef<HTMLInputElement>();

  const { toast } = useToast();

  const store = useAnnotationStore()

  const { selected } = useSelection();

  const empty = selected.length === 0;

  const comment = selected.length > 0 ? 
    selected[0].annotation.bodies.find(b => b.purpose === 'commenting')?.value : '';

  const tags = selected.length > 0 ?
    selected.reduce((tags, { annotation }) => (
      [...tags, ...annotation.bodies.filter(b => b.purpose === 'tagging').map(b => b.value)]
    ), [] as string[]) : [];

  const [tagsEditable, setTagsEditable] = useState(false);

  const [hasChanged, setHasChanged] = useState(false);

  useEffect(() => {
    setHasChanged(false);
    setTagsEditable(false);
  }, [selected.map(({ annotation }) => annotation.id).join()]);

  const onSave = (evt: React.FormEvent) => {
    evt.preventDefault()

    const { annotation } = selected[0];

    // Don't add the same tag twice
    const hasNewTag = input.current.value && !tags.includes(input.current.value);
    const tag = hasNewTag ? [createBody(annotation, {
      value: input.current.value,
      purpose: 'tagging'
    })] : [];

    if (input.current.value && !hasNewTag)
      toast({
        title: 'Duplicate Tag',
        description: `The annotation already contains the tag '${input.current.value}'.`,
      });

    const comments = textarea.current.value ? [createBody(annotation, {
      value: textarea.current.value,
      purpose: 'commenting'
    })] : [];

    if (tag.length > 0 || hasChanged) {
      const updated = {
        ...annotation,
        bodies: [
          ...annotation.bodies.filter(b => b.purpose !== 'commenting'),
          ...comments,
          ...tag
        ]
      };

      store.updateAnnotation(updated);

      setHasChanged(false);
      input.current.value = '';
    }
  }

  const onDeleteTag = (tag: string) => {
    const { annotation } = selected[0];

    const updated = {
      ...annotation,
      bodies: annotation.bodies.filter(b => 
        !(b.purpose === 'tagging' && b.value === tag))
    }

    store.updateAnnotation(updated);
  }

  const onDelete = () =>
    store.bulkDeleteAnnotation(selected.map(s => s.annotation.id));
  */

  return null /* empty ? (
    <div className="flex rounded text-sm justify-center items-center w-full text-muted-foreground">
      No annotation selected
    </div> 
  ) : (
    <div className="w-full" key={selected.map(({ annotation }) => annotation.id).join('.')}>
      <form onSubmit={onSave}>
        <fieldset className="mb-6">
          <h2 className="text-sm font-medium mb-2">
            Comment
          </h2>

          <Textarea 
            ref={textarea}
            rows={6} 
            onChange={() => setHasChanged(true)}
            defaultValue={comment}/>

          <Button 
            className="mt-2"
            type="submit"
            disabled={!hasChanged}>
            Save
          </Button>
        </fieldset>

        <Separator className="mb-2" />

        <fieldset className="mb-6">
          <h2 className="text-sm font-medium mb-2">
            Tags 
            <Button 
              type="button"
              variant="ghost" 
              size="icon" 
              className="ml-1 align-sub"
              onClick={() => setTagsEditable(edit => !edit)}>
              <Pencil className="h-4 w-4" />
            </Button>
          </h2>
          <ul className="mb-4 inline-flex gap-1 flex-wrap">
            {tags.map(tag => (
              <li key={tag} className="inline">
                {tagsEditable ? (
                  <button type="button" onClick={() => onDeleteTag(tag)}>
                    <Badge variant="outline" className="hover:bg-muted cursor-pointer">
                      {tag}
                      <X size={12} className="ml-1 -mr-1" />
                    </Badge>
                  </button>
                ) : (
                  <Badge variant="secondary">
                    {tag}
                  </Badge>
                )}
              </li>
            ))}
          </ul>
          <div className="flex w-full max-w-sm items-center space-x-2">
            <Input 
              ref={input}
              placeholder="Tag..." />

            <Button 
              type="submit" 
              className="whitespace-nowrap">
              Add
            </Button>
          </div>
        </fieldset>

        <Separator className="mb-2" />

        <DeleteWithConfirmation 
          onDelete={onDelete} />
      </form>
    </div>
  ) */

}