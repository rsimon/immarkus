import { 
  Select, 
  SelectContent, 
  SelectItem,
  SelectTrigger, 
  SelectValue 
} from '@/ui/Select';

export const SelectFilter = () => {

  return (
    <div className="flex text-xs">
      Show <Select defaultValue="all">
        <SelectTrigger 
          className="p-0 shadow-none font-medium border-none text-xs hover:underline bg-transparent h-auto ml-1.5">
          <SelectValue />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">all</SelectItem>
          <SelectItem value="entity">entity</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )

}