import { Ban } from 'lucide-react';

interface ErrorAlertProps {
  
  message: string;

}
export const ErrorAlert = (props: ErrorAlertProps) => {

  return (
    <div>
      <div className="font-semibold mb-2 flex gap-1.5">
        <Ban className="size-3.5 mt-[3px]" /> {props.message}
      </div>

      <div>
        IMMARKUS could not import from this URL. See our <a 
          className="underline"
          href="https://github.com/rsimon/immarkus/wiki/Troubleshooting-IIIF-Manifest-Imports" 
          target="_blank">troubleshooting 
        guide</a> for information on common import problems and possible solutions.
      </div>
    </div>
  )
}