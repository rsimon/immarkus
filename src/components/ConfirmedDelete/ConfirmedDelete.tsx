import { ReactNode } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/ui/Button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/ui/AlertDialog';


interface DeleteButtonProps {

  children?: ReactNode;

  className?: string;

  label: string;

  open?: boolean;

  variant?: 'link' | 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost';

  onConfirm(): void;

  onOpenChange?(open: boolean): void;

}

export const ConfirmedDelete = (props: DeleteButtonProps) => {

  const isControlled = props.open !== undefined;

  return (
    <AlertDialog 
      open={isControlled ? props.open : undefined} 
      onOpenChange={isControlled ? props.onOpenChange : undefined}>
      {props.children && ( 
        <AlertDialogTrigger asChild>
          <Button
            className={props.className}
            type="button"
            variant={props.variant}>
            {props.children}
          </Button>
        </AlertDialogTrigger>
      )}
      
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            {props.label}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>

          <AlertDialogAction 
            className="bg-destructive hover:bg-destructive/90"
            onClick={props.onConfirm}>
            <Trash2 className="w-4 h-4 mr-2" />  Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )

}