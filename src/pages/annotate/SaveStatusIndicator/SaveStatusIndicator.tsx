import './SaveStatusIndicator.css';

export type SaveStatus = 'idle' | 'saving' | 'success' | 'error';

interface SaveStatusIndicatorProps {

  status: SaveStatus;

}

export const SaveStatusIndicator = (props: SaveStatusIndicatorProps) => {

  return (
    <div className="save-status">
      {props.status}
    </div>
  )

}