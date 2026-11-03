import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle
} from '@/ui/Dialog';
import { Textarea } from '@/ui/Textarea';

interface PromptPreviewControlProps {

  prompt?: string;

  disabled?: boolean;

  canRun?: boolean;

  onRunPrompt(prompt: string): void;

}

export const PromptPreviewControl = (props: PromptPreviewControlProps) => {
  const { t } = useTranslation('smartTools');
  const [open, setOpen] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState(props.prompt || '');

  useEffect(() => {
    if (!open)
      setEditedPrompt(props.prompt || '');
  }, [open, props.prompt]);

  if (!props.prompt)
    return null;

  const onRunPrompt = () => {
    props.onRunPrompt(editedPrompt);
    setOpen(false);
  }

  return (
    <>
      <div className="flex justify-center pt-1">
        <Button
          type="button"
          variant="link"
          className="h-auto p-0 text-xs text-muted-foreground"
          disabled={props.disabled}
          onClick={() => setOpen(true)}>
          {t('promptPreview.title')}
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogTitle>{t('promptPreview.dialogTitle')}</DialogTitle>
          <DialogDescription>{t('promptPreview.description')}</DialogDescription>

          <Textarea
            className="min-h-72 max-h-[60vh] resize-y bg-background font-mono text-xs"
            value={editedPrompt}
            onChange={event => setEditedPrompt(event.target.value)}
            aria-label={t('promptPreview.dialogTitle')} />

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setEditedPrompt(props.prompt || '')}>
              {t('promptPreview.reset')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}>
              {t('annotate.controls.cancel')}
            </Button>
            <Button
              type="button"
              disabled={!props.canRun || !editedPrompt.trim()}
              onClick={onRunPrompt}>
              {t('promptPreview.run')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
