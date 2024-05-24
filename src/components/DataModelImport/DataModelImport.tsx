import { ReactNode, useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/ui/Dialog';
import { Label } from '@/ui/Label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/Select';
import { Button } from '@/ui/Button';
import { Switch } from '@/ui/Switch';

interface DataModelImportProps {

  children?: ReactNode;

  open?: boolean;

  onOpenChange?(open: boolean): void;

}

export const DataModelImport = (props: DataModelImportProps) => {

  const [open, setOpen] = useState(props.open);

  useEffect(() => {
    setOpen(props.open);
  }, [props.open]);

  const onOpenChange = (open: boolean) => {
    setOpen(open);

    if (props.onOpenChange)
      props.onOpenChange(open);
  }

  return (
    <Dialog 
      open={open} 
      onOpenChange={onOpenChange}>

      {props.children && (
        <DialogTrigger asChild>
          {props.children}
        </DialogTrigger>
      )}

      <DialogContent className="p-0 my-8 rounded-lg">
        <div className="px-6 py-3">
          <p className="text-left text-xs leading-relaxed mt-1">
            Import stuff here
          </p>

          <div className="mt-4">
            <Label 
              htmlFor="presets"
              className="inline-block text-xs mb-1.5 ml-0.5">
              Property Name
            </Label>

            <Select>
              <SelectTrigger className="w-full bg-white">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="text">
                  Preset A
                </SelectItem>

                <SelectItem value="number">
                  Preset B
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <p>-- or --</p>

          <div>
            <Button 
              className="w-full"
              variant="secondary">Upload File</Button>
          </div>

          <div className="p-3">
            <div className="flex items-center gap-2 justify-between">
              <Label htmlFor="replace-existing">
                Replace existing
              </Label>

              <Switch 
                id="replace-existing" />
            </div>

            <p className="text-muted-foreground text-xs mt-1 pr-12">
              Include sub-folders inside your workfolder as nodes in the graph.
            </p>
          </div>

          <div>
            <Button>
              Import
            </Button>

            <Button variant="outline">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )

}