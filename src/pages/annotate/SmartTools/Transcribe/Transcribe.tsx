import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Annotorious } from '@annotorious/react';
import { AIConsent, useAIOptIn, useImportAnnotations } from '@/components/AnnotationServices';
import { LoadedImage } from '@/model';
import { Checkbox } from '@/ui/Checkbox';
import { Label } from '@/ui/Label';
import { TranscriptionDialog } from './TranscriptionDialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/Select';

interface TranscribeProps {

  images: LoadedImage[];

}

export const Transcribe = (props: TranscribeProps) => {
  const { t } = useTranslation('smartTools');

  // Should never happen
  if (props.images.length < 1) return null;

  const [optIn, setOptIn] = useAIOptIn('transcribe');

  const [selectedImage, setSelectedImage] = useState<LoadedImage | undefined>(
    props.images.length === 1 ? props.images[0] : undefined
  );

  const importAnnotations = useImportAnnotations();

  return (
    <div className="px-4 pb-2">
      <div className="pt-6 pb-1 px-0.5 flex gap-3 items-start leading-relaxed">
        {props.images.length === 1 ? (
            <p className="font-medium">
              {t('transcribe.transcribeThisImage')}
            </p>
        ) : (
          <p className="font-medium">
            {t('transcribe.selectImageToTranscribe')}
          </p>
        )}
      </div>

      <div className="border border-slate-300 p-2 rounded space-y-1 leading-relaxed mt-2">
        <div className="flex gap-2 items-center">
          <Checkbox 
            id="ai-opt-in-compact"
            checked={optIn}
            onCheckedChange={checked => setOptIn(checked as boolean)} />

          <Label htmlFor="ai-opt-in-compact">
            <strong className="font-semibold text-xs">{t('aiConsent.enableExternalAI')}</strong>
          </Label>
        </div>
        
        <p>
          {t('aiConsent.disclaimer')}
        </p>
      </div>

      <Annotorious>
        {props.images.length > 1 && (
          <Select
            value={selectedImage?.id}
            onValueChange={id => setSelectedImage(props.images.find(i => i.id === id))}>
            <SelectTrigger className="mt-2 w-full bg-white whitespace-nowrap *:overflow-hidden *:text-ellipsis">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              {props.images.map(image => (
                <SelectItem
                  key={image.id}  
                  value={image.id}
                  className="whitespace-nowrap overflow-hidden">
                  {image.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <AIConsent 
          optIn={optIn}
          onChangeOptIn={setOptIn} />

        <TranscriptionDialog 
          disabled={!selectedImage || !optIn}
          image={selectedImage} 
          onImport={annotations => importAnnotations(annotations, selectedImage)} />
      </Annotorious>
    </div>
  )

}