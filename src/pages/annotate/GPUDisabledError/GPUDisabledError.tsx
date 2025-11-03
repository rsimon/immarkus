import { useNavigate } from 'react-router-dom';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle
} from '@/ui/AlertDialog';
import { ShieldAlert } from 'lucide-react';

export const GPUDisabledError = () => {

  const navigate = useNavigate();

  return (
    <AlertDialog open={true}>      
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex gap-1.5 items-center text-destructive">
            <ShieldAlert className="size-5.5" /> Error
          </AlertDialogTitle>

          <AlertDialogDescription className="py-2 leading-relaxed space-y-4">
            <p>
              IMMARKUS could not launch the annotation interface. The most likely reason is 
              that <strong>hardware acceleration is disabled on your browser</strong>.
            </p>

            <div>
              <p>
                To enable hardware acceleration on <strong>Chrome</strong>:
              </p>
              <ul className="list-disc pl-4 pt-1">
                <li>Open the browser menu (three dots in the upper right corner)</li>
                <li>Go to <strong>Settings → System</strong></li>
                <li>Enable the switch <strong>Use hardware acceleration when available</strong></li>
                <li>Click <strong>Relaunch</strong> to restart Chrome</li>
              </ul>
            </div>

            <div>
              <p>
                To enable hardware acceleration on <strong>Edge</strong>:
              </p>
              <ul className="list-disc pl-4 pt-1">         
                <li>Open the browser menu (three dots in the upper right corner)</li>
                <li>Go to <strong>Settings → System and performance</strong></li>
                <li>Click <strong>System</strong></li>
                <li>Enable the switch <strong>Use graphics acceleration when available</strong></li>
                <li>You may have to restart Edge for the setting to take effect</li>
              </ul>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogAction 
            onClick={() => navigate(-1)}>
            Go Back
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )

}