import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Annotorious, ImageAnnotation, Origin, serializeW3CImageAnnotation} from '@annotorious/react';
import { useAnnotoriousManifold } from '@annotorious/react-manifold';
import { LoadedImage } from '@/model';
import { useStore } from '@/store';
import { Checkbox } from '@/ui/Checkbox';
import { Label } from '@/ui/Label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/Select';
import { AIConsent, useAIOptIn } from '../AIConsent';

interface AutoAnnotateProps {

  images: LoadedImage[];

}

export const AutoAnnotate = (props: AutoAnnotateProps) => {

  const { t } = useTranslation('smartTools');

  // Should never happen
  if (props.images.length < 1) return null;

  const [optIn, setOptIn] = useAIOptIn('annotate');

  const [selectedImage, setSelectedImage] = useState<LoadedImage | undefined>(
    props.images.length === 1 ? props.images[0] : undefined
  );

  return (
    <div className="px-4 pb-2">
      <div className="pt-6 pb-1 px-0.5 flex gap-3 items-start leading-relaxed">
        {props.images.length === 1 ? (
            <p className="font-medium">
              {t('autoAnnotate.annotateThisImage')}
            </p>
        ) : (
          <p className="font-medium">
            {t('autoAnnotate.selectImageToAnnotate')}
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

        <div>Hello wrold</div>
      </Annotorious>
    </div>
  )

}