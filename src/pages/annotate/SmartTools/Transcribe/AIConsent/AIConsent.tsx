import { useState } from 'react';
import { TriangleAlert } from 'lucide-react';
import { Checkbox } from '@/ui/Checkbox';
import { Label } from '@/ui/Label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle
} from '@/ui/AlertDialog';

interface AIConsentProps {

  optIn: boolean;

  onChangeOptIn(optIn: boolean): void;

}

export const AIConsent = (props: AIConsentProps) => {

  const [open, setOpen] = useState(!props.optIn);
  
  const [checked, _setChecked] = useState(props.optIn);

  const setChecked = (checked: boolean) => {
    _setChecked(checked);
    props.onChangeOptIn(checked);
  }

  return (
    <AlertDialog 
      open={open}
      onOpenChange={setOpen}>
      
      <AlertDialogContent
        className="max-w-2xl">
        <AlertDialogTitle className="flex gap-2 items-center text-destructive">
          <TriangleAlert className="size-5" /> Before You Use Auto Transcribe
        </AlertDialogTitle>

        <AlertDialogDescription className="leading-relaxed space-y-4">
          <p>
            The IMMARKUS Auto Transcribe tool allows you to connect to external 
            AI platforms (e.g. Google, Microsoft Azure, OpenAI). Please read and 
            confirm the following before continuing:
          </p>

          <ol className="space-y-4 list-decimal pl-5">
            <li className="pl-1">
              <strong>External Processing</strong>: When you use the Auto Transcribe tool, 
              any images or image portions you submit will be sent to the selected 
              third-party services for processing.
            </li>

            <li className="pl-1">
              <strong>Your Own Keys</strong>: For services that require an API key, you 
              must provide your own key. The key is stored locally in your browser 
              and used only to connect directly to the intended AI service. IMMARKUS 
              does not transmit or store your key elsewhere.
            </li>

            <li className="pl-1">
              <strong>Image Rights & Responsibility</strong>: Ensure that you have the 
              right to upload and process any materials you use. Do not send copyrighted, 
              personal, or sensitive data to external service unless you understand and 
              accept their terms of use.
            </li>

            <li className="pl-1">
              <strong>No Hidden Transfers</strong>: IMMARKUS itself does not send your 
              data anywhere. Only the AI services you choose to connect to will receive 
              the data you submit.
            </li>
          </ol>

          <p>
            By continuing, you confirm that you have read and understood this information 
            and accept responsibility for your use of external AI services.
          </p>

          <div className="p-4 flex gap-2 items-center font-medium border rounded mb-6">
            <Checkbox
              id="ai-opt-in"
              checked={checked}
              onCheckedChange={checked => setChecked(checked as boolean)} />
            <Label htmlFor="ai-opt-in">I Understand and Agree</Label>
          </div>

          <AlertDialogAction className="w-full">
            Close
          </AlertDialogAction>
        </AlertDialogDescription>
      </AlertDialogContent>
    </AlertDialog>
  )

}