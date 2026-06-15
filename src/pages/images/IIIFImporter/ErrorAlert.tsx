import { Ban } from 'lucide-react';
import { Trans } from 'react-i18next';

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
        <Trans
          ns="images"
          i18nKey="iiifImporter.errors.help"
          components={{
            troubleshootingLink: (
              <a
                className="underline"
                href="https://github.com/rsimon/immarkus/wiki/Troubleshooting-IIIF-Manifest-Imports"
                target="_blank" />
            )
          }} />
      </div>
    </div>
  )
}