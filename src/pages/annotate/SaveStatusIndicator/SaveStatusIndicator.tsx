import { useEffect, useState } from 'react'; 
import { Check, X } from 'lucide-react';

import './SaveStatusIndicator.css';

export type SaveStatus = 'idle' | 'saving' | 'success' | 'failed';

interface SaveStatusIndicatorProps {

  status: SaveStatus;

  fadeOut?: number;

}

export const SaveStatusIndicator = (props: SaveStatusIndicatorProps) => {

  const { status } = props;

  const fadeOut = props.fadeOut || 5000;

  const [opacity, setOpacity] = useState(1);

  const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!fadeOut)
      return;

    if (timer)
      clearTimeout(timer);

    if (status === 'success')
      setTimer(setTimeout(() => setOpacity(0), fadeOut));
    else
      setOpacity(1);
  }, [status]);

  return (
    <div className="save-status-wrapper" style={{ opacity: 1 }}>
      {status === 'idle' ? (
        <div className="save-status failed text-xs font-semibold">
          <X size={16} /><span>Error</span>
        </div>
      ) : status === 'success' ? (
        <div className="save-status success text-xs font-semibold">
          <Check size={16} /><span>Saved</span>
        </div>
      ) : status === 'failed' ? (
        <div className="save-status failed text-xs font-semibold">
          <X size={16} /><span>Error</span>
        </div>
      ) : (
        <div className="save-status text-xs font-semibold">
          <span>Saving</span>
        </div>
      )}
    </div>
  )

}