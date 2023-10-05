import { useState } from 'react';
import { useFormik } from 'formik';
import { Button } from '@/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/ui/Dialog';
import { Entity } from '@/model';
import { getRandomColor } from '../ColorPalette';

interface CreateEntityProps {

  onCreate(e: Entity): void;

}

export const CreateEntity = (props: CreateEntityProps) => {

  const [open, setOpen] = useState(false);

  const formik = useFormik({
    initialValues: {
      label: '',
      id: '',
      parentId: '',
      notes: ''
    },

    onSubmit: values => {
      props.onCreate({
        ...values,
        color: getRandomColor()
      });
      setOpen(false);
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          Create New Entity
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Entity</DialogTitle>
          <DialogDescription>
            Create a new semantic entity for use in image annotations. Click save when you are done.
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4 py-4" onSubmit={formik.handleSubmit}>
          <div className="grid grid-cols-4 items-center gap-4">
            <label 
              htmlFor="label" 
              className="text-right">
              Label
            </label>

            <input 
              id="label" 
              className="col-span-3" 
              value={formik.values.label} 
              onChange={formik.handleChange} />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <label 
              htmlFor="id" 
              className="text-right">
              ID
            </label>

            <input 
              id="id" 
              className="col-span-3" 
              value={formik.values.id} 
              onChange={formik.handleChange} />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <label 
              htmlFor="parentId" 
              className="text-right">
              Parent ID (optional)
            </label>

            <input 
              id="parentId" 
              className="col-span-3" 
              value={formik.values.parentId} 
              onChange={formik.handleChange} />
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <label 
              htmlFor="notes" 
              className="text-right">
              Notes
            </label>

            <textarea 
              id="notes" 
              className="col-span-3" 
              rows={5}
              value={formik.values.notes} 
              onChange={formik.handleChange} />
          </div>

          <DialogFooter>
            <Button type="submit">Save Entity</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )

}