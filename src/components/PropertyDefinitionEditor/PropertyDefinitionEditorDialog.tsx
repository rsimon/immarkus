import { ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DialogTitle } from '@radix-ui/react-dialog';
import { PropertyDefinition } from '@/model';
import { PropertyDefinitionEditor } from './PropertyDefinitionEditor';
import {
  Dialog,
  DialogContent,
  DialogTrigger
} from '@/ui/Dialog';

interface PropertyEditorDialogProps {

  editorHint: string;

  previewHint: string;

  property?: PropertyDefinition;

  schema: PropertyDefinition[];

  onSave(definition: PropertyDefinition): void;

  onClose?(): void;

  children: ReactNode;

}

export const PropertyDefinitionEditorDialog = (props: PropertyEditorDialogProps) => {

  const { t } = useTranslation('common');

  const [open, setOpen] = useState(false);

  const onUpdate = (property: PropertyDefinition) => {
    props.onSave(property);
    setOpen(false);

    if (props.onClose)
      props.onClose();  
  }

  const onOpenStateChange = (open: boolean) => {
    setOpen(open);
    
    if (!open && props.onClose)
      props.onClose();  
  }

  return (
    <Dialog open={open} onOpenChange={onOpenStateChange}>
      <DialogTrigger asChild>
        {props.children}
      </DialogTrigger>


      <DialogContent className="p-0 max-w-4xl my-8 rounded-lg">
        <DialogTitle className="hidden">
          {t('propertyDefinitionEditor.dialogTitle')}
        </DialogTitle>

        <PropertyDefinitionEditor 
          editorHint={props.editorHint}
          previewHint={props.previewHint}
          property={props.property} 
          schema={props.schema}
          onSave={onUpdate} />
      </DialogContent>
    </Dialog>
  )

}