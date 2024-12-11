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

  asChild?: boolean;

  children?: ReactNode;

  className?: string;

  title?: string;

  message: string;

  open?: boolean;

  variant?: 'link' | 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost';

  onConfirm(evt: React.MouseEvent): void;

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
          {props.asChild ? (
            props.children
          ) : (
            <Button
              className={props.className}
              type="button"
              variant={props.variant}>
              {props.children}
            </Button>
          )}
        </AlertDialogTrigger>
      )}
      
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{props.title || 'Are you sure?'}</AlertDialogTitle>
          <AlertDialogDescription>
            {props.message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>

          <AlertDialogAction 
            className="bg-destructive hover:bg-destructive/90"
            onClick={props.onConfirm}>
            <Trash2 className="w-4 h-4 mr-2" /> Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )

}