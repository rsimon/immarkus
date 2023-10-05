import { useState } from 'react';
import { Settings } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/Select';
import { EntityProperty } from '@/model';

interface PropertyDetailsProps {

  property?: EntityProperty;

}

export const PropertyDetails = (props: PropertyDetailsProps) => {

  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 text-muted-foreground hover:text-black">
          <Settings className="w-3.5 h-3.5 " />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Property</DialogTitle>
          <DialogDescription>
            Define a schema property for this entity type.
          </DialogDescription>

          <div className="grid gap-2 pt-4">
            <label 
              htmlFor="name"
              className="text-sm font-medium leading-none 
                peer-disabled:cursor-not-allowed pt-2
                peer-disabled:opacity-70">
              Property Name
            </label>

            <input
              id="name"
              className="flex h-10 w-full rounded-md border border-input 
                bg-transparent px-3 py-1 text-sm shadow-sm transition-colors 
                file:border-0 file:bg-transparent file:text-sm file:font-medium 
                placeholder:text-muted-foreground focus-visible:outline-none 
                focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring 
                disabled:cursor-not-allowed disabled:opacity-50" />

            <label 
              htmlFor="type"
              className="text-sm font-medium leading-none 
                peer-disabled:cursor-not-allowed pt-4
                peer-disabled:opacity-70">
              Property Type
            </label>

            <Select>
              <SelectTrigger className="w-full h-10 shadow-sm">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="string">Text</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="enum">Choice</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </DialogHeader>

        <DialogFooter className="mt-2 sm:justify-start">
          <Button>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

}