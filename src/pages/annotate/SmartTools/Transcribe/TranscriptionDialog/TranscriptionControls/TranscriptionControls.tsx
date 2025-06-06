import { Button } from '@/ui/Button';

interface TranscriptionControlsProps {

  onSubmitImage(): void;

}

export const TranscriptionControls = (props: TranscriptionControlsProps) => {

  return (
    <div>
      <Button onClick={props.onSubmitImage}>Submit Image</Button>
    </div>
  )

}