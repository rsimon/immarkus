import { EntityProperty } from '@/model';
import { Input } from '@/ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/Select';

export interface PropertyDetailsProps {

  property: EntityProperty;

}

export const PropertyDetails = (props: PropertyDetailsProps) => {

  return (
    <div className="grid gap-2 pt-4">
      <label 
        htmlFor="name"
        className="text-sm font-medium leading-none 
          peer-disabled:cursor-not-allowed pt-2
          peer-disabled:opacity-70">
        Property Name
      </label>

      <Input id="name" />

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
  )

}