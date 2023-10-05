import { useState } from 'react';
import { useFormik } from 'formik';
import { Relation } from '@/model';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Label } from '@/components/Label';
import { Textarea } from '@/components/Textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/Dialog';

interface CreateRelationProps {

  onCreate(e: Relation): void;

}

export const CreateRelation = (props: CreateRelationProps) => {

  const [open, setOpen] = useState(false);

  const formik = useFormik({
    initialValues: {
      label: '',
      id: '',
      notes: ''
    },

    onSubmit: values => {
      props.onCreate(values);
      setOpen(false);
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="mt-4">
          Create New Relation
        </Button>
      </DialogTrigger>

      <DialogContent>
      <DialogHeader>
          <DialogTitle>Create New Relation</DialogTitle>
          <DialogDescription>
            Create a new semantic relation for use in image annotations. Click save when you are done.
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4 py-4" onSubmit={formik.handleSubmit}>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label 
              htmlFor="label" 
              className="text-right">
              Label
            </Label>

            <Input 
              id="label" 
              className="col-span-3" 
              value={formik.values.label} 
              onChange={formik.handleChange} />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label 
              htmlFor="id" 
              className="text-right">
              ID
            </Label>

            <Input 
              id="id" 
              className="col-span-3" 
              value={formik.values.id} 
              onChange={formik.handleChange} />
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label 
              htmlFor="notes" 
              className="text-right">
              Notes
            </Label>

            <Textarea 
              id="notes" 
              className="col-span-3" 
              rows={5}
              value={formik.values.notes} 
              onChange={formik.handleChange} />
          </div>

          <DialogFooter>
            <Button type="submit">Save Relation</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )

}