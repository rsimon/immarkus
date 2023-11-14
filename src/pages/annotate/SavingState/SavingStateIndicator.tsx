import { useEffect, useState } from 'react'; 
import { Check, X } from 'lucide-react';
import { useSavingState } from './useSavingState';

interface SavingStateIndicatorProps {

  fadeOut?: number;

}

export const SavingStateIndicator = (props: SavingStateIndicatorProps) => {

  const { savingState } = useSavingState();

  const fadeOut = props.fadeOut || 1500;

  const [opacity, setOpacity] = useState(1);

  const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!fadeOut)
      return;

    if (timer)
      clearTimeout(timer);

    if (savingState.value === 'success')
      setTimer(setTimeout(() => setOpacity(0), fadeOut));
    else
      setOpacity(1);
  }, [savingState]);

  return (
    <div className="saving-indicator" style={{ opacity }}>
      {savingState.value === 'success' ? (
        <div className="save-status success text-xs font-semibold">
          <Check size={16} /><span>Saved</span>
        </div>
      ) : savingState.value === 'failed' ? (
        <div className="save-status failed text-xs font-semibold">
          <X size={16} /><span>Error</span>
        </div>
      ) : savingState.value === 'saving' ? (
        <div className="save-status saving text-xs font-semibold">
          <span>Saving</span>
        </div>
      ) : null}
    </div>
  )

}