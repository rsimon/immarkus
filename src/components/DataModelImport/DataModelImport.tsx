import { ReactNode, useEffect, useState } from 'react';
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

import './DataModelImport.css';

interface DataModelImportProps {

  children?: ReactNode;

  open?: boolean;

  onOpenChange?(open: boolean): void;

}

export const DataModelImport = (props: DataModelImportProps) => {

  const [open, setOpen] = useState(props.open);

  const [replace, setReplace] = useState(false);

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
        <div className="px-7 pt-6 pb-8">
          <h2 className="mb-2 font-semibold">Import Entity Classes</h2>

          <div className="py-4">
            <div className="flex items-center gap-2 justify-between">
              <Label htmlFor="replace-existing">
                Replace Current Model
              </Label>

              <Switch 
                id="replace-existing" 
                checked={replace} 
                onCheckedChange={setReplace} />
            </div>

            <p className="text-muted-foreground text-xs mt-1 pr-20">
              When you import entity classes, you can either 
              delete and replace your existing model, or add the imported
              classes to your current model.
            </p>
          </div>

          <div className={replace ? 'import-duplicates disabled mb-2' : 'mb-2'}>
            <Label htmlFor="replace-existing">
              Duplicate Classes
            </Label>

            <p className="text-muted-foreground text-xs mt-1 mb-2">
              Select how the import should merge classes that already 
              exist in your model.
            </p>

            <div className="py-1">
              <RadioGroup defaultValue="keep">
                <div className="flex items-start gap-4 mb-0.5 pl-1">
                  <RadioGroupItem 
                    className="mt-[4px]"
                    value="keep" 
                    id="keep" />

                  <div>
                    <Label htmlFor="keep">Keep Existing</Label>
                    <p className="text-xs text-muted-foreground">
                      If the import contains classes that already exist in 
                      your model, keep the existing ones and discard the imported classes.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 pl-1">
                  <RadioGroupItem 
                    className="mt-[4px]"
                    value="replace" 
                    id="replace" />

                  <div>
                    <Label htmlFor="replace">Keep Imported</Label>
                    <p className="text-xs text-muted-foreground">
                      If the import contains classes that already exist in 
                      your model, discard the existing ones and keep the imported classes.
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="mt-4">
            <Label 
              htmlFor="presets"
              className="inline-block text-xs mb-1.5 ml-0.5">
              Import from Preset
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

          <p className="w-full text-xs py-4 text-center marker:text-muted-foreground">
            — or —
          </p>

          <div>
            <Button 
              className="w-full"
              variant="outline">Upload Datamodel File</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )

}