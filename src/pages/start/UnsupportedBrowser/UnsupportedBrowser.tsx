import { AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/ui/Alert';

export const UnsupportedBrowser = () => {

  return (
    <main className="page start unsupported w-full flex items-center justify-center">
      <div className="content-wrapper">
        <Alert variant="destructive" className="max-w-2xl">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Unsupported Browser</AlertTitle>
          <AlertDescription className="leading-6 mt-2">
            IMMARKUS uses <a className="underline" href="https://developer.mozilla.org/en-US/docs/Web/API/Window/showDirectoryPicker" target="_blank">experimental 
            browser features</a> currently unavailable on Firefox, Safari and mobile devices. Please
            use Chrome or Edge on the Desktop to access this site.
          </AlertDescription>
        </Alert>
      </div>
    </main>
  )

}