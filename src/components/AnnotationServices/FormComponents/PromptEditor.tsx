import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Play } from 'lucide-react';
import { Alert } from '@/ui/Alert';
import { Button } from '@/ui/Button';
import { Textarea } from '@/ui/Textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle
} from '@/ui/Dialog';

interface PromptEditorProps {

  prompt?: string;

  disabled?: boolean;

  canRun?: boolean;

  onRunPrompt(prompt: string): void;

}

export const PromptEditor = (props: PromptEditorProps) => {
  const { t } = useTranslation('smartTools');

  const [open, setOpen] = useState(false);

  const [editedPrompt, setEditedPrompt] = useState(props.prompt || '');

  useEffect(() => {
    if (!open) setEditedPrompt(props.prompt || '');
  }, [open, props.prompt]);

  const isEdited = editedPrompt !== (props.prompt || '');

  const onRunPrompt = () => {
    props.onRunPrompt(editedPrompt);
    setOpen(false);
  }

  return props.prompt ? (
    <>
      <div className="flex justify-center pt-1">
        <Button
          type="button"
          variant="link"
          className="h-auto p-0 mb-1 font-normal text-xs disabled:text-muted-foreground"
          disabled={props.disabled}
          onClick={() => setOpen(true)}>
          {t('promptEditor.title')}
        </Button>
      </div>

      <Dialog 
        open={open} 
        onOpenChange={setOpen}>
        <DialogContent className="w-fit md:w-fit max-w-[95vw]">
          <DialogTitle className="flex items-center gap-2 w-0 min-w-full">
            {t('promptEditor.dialogTitle')}
          </DialogTitle>

          <DialogDescription className="w-0 min-w-full">
            {t('promptEditor.description')}
          </DialogDescription>

          <Textarea
            className="h-72 w-3xl field-sizing-fixed min-w-70 max-w-[calc(95vw-3rem)] resize bg-slate-100 font-mono text-xs focus-visible:outline-slate-300 focus-visible:outline-1"
            value={editedPrompt}
            spellCheck={false}
            onChange={event => setEditedPrompt(event.target.value)}
            aria-label={t('promptEditor.dialogTitle')} />

          <Alert className="py-2 px-3 rounded-md w-0 min-w-full text-sm leading-relaxed border-amber-700/15 text-amber-700 bg-amber-700/10">
            <div className="space-y-1.5">
              <div className="font-semibold flex gap-2">
                <AlertTriangle
                  aria-hidden
                  className="mt-0.5 size-4 shrink-0 text-amber-700" />
                {t('promptEditor.alertTitle')}
              </div>

              <p>
                {t('promptEditor.alertHint')}
              </p>
            </div>
          </Alert>

          <DialogFooter className="gap-2 flex sm:justify-between items-center">
            <div>
              <Button
                type="button"
                variant="outline"
                className="gap-2 font-normal text-xs disabled:hidden"
                disabled={!isEdited}
                onClick={() => setEditedPrompt(props.prompt || '')}>
                {isEdited && (
                  t('promptEditor.reset')
                )}
              </Button>
            </div>

            <div>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}>
                {t('annotate.controls.cancel')}
              </Button>

              <Button
                type="button"
                className="gap-2"
                disabled={!props.canRun}
                onClick={onRunPrompt}>
                <Play aria-hidden className="size-4" />
                {isEdited ? t('promptEditor.runEdited') : t('promptEditor.runOriginal')}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  ) : null;

}