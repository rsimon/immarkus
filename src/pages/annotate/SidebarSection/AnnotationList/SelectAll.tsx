import { Button } from "@/ui/Button"

export const SelectAll = () => {

  /*
  flex items-center justify-between rounded-md border border-input placeholder:text-muted-foreground outline-black disabled:cursor-not-allowed disabled:opacity-50 p-0 whitespace-nowrap [&>span]:max-w-24 [&>span]:overflow-hidden [&>span]:text-ellipsis shadow-none font-medium border-none text-xs hover:underline bg-transparent h-auto ml-1.5
  */

  return (
    <Button
      className="p-0 font-normal text-xs hover:underline text-muted-foreground bg-transparent h-auto ml-1.5">
      Select All
    </Button>
  )

}