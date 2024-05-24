import { ReactNode, useEffect, useState } from 'react';
import { Import } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/ui/Dialog';
import { Label } from '@/ui/Label';
import { Button } from '@/ui/Button';
import { RadioGroup, RadioGroupItem } from '@/ui/RadioGroup';
import { Switch } from '@/ui/Switch';
import { Separator } from '@/ui/Separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/Select';

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
        <div className="px-7 py-6">
          <p className="text-left text-xs leading-relaxed mt-1 mr-8">
            Select a Preset or import Entity Classes from a data model file. You can 
            choose to either add the imported model to your existing classes
            or replace your current model.
          </p>

          <div className="mt-4">
            <Label 
              htmlFor="presets"
              className="inline-block text-xs mb-1.5 ml-0.5">
              Choose Preset
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

          <p className="w-full text-xs text-center py-5 text-muted-foreground">— or —</p>

          <div>
            <Button 
              className="w-full"
              variant="outline">Upload File</Button>
          </div>

          <Separator className="mt-8" />

          <div className="py-6">
            <div className="flex items-center gap-2 justify-between">
              <Label htmlFor="replace-existing">
                Overwrite Current Model
              </Label>

              <Switch id="replace-existing" />
            </div>

            <p className="text-muted-foreground text-xs mt-1 pr-12">
              Warning: this will delete all your existing Entity Classes. 
            </p>
          </div>

          <div className="mb-8">
            <Label htmlFor="replace-existing">
              Handle Duplicates
            </Label>

            <div className="py-1">
              <RadioGroup defaultValue="keep">
                <div className="flex items-start gap-3 mb-0.5">
                  <RadioGroupItem 
                    className="mt-1"
                    value="keep" 
                    id="keep" />

                  <div>
                    <Label htmlFor="keep">Keep</Label>
                    <p className="text-xs text-muted-foreground">
                      If the import contains classes that already exist in 
                      your model, keep the existing ones and ignore the imported classes.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <RadioGroupItem 
                    className="mt-1"
                    value="replace" 
                    id="replace" />

                  <div>
                    <Label htmlFor="replace">Replace</Label>
                    <p className="text-xs text-muted-foreground">
                      If the import contains classes that already exist in 
                      your model, discard the existing ones and keep the imported classes.
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </div>
          </div>

          <div className="flex gap-2">
            <Button>
              <Import className="h-4 w-4 mr-2" /> Import
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