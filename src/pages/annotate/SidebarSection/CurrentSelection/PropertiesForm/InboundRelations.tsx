import { Separator } from "@/ui/Separator"
import { Spline } from "lucide-react"

export const InboundRelations = () => {

  return (
    <div>
      <h3 className="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm 
        ml-0.5 flex gap-1.5 py-4 items-center">
        <Spline className="h-4 w-4" /> 
        <span>Inbound Relations</span>
      </h3>

      <div>

      </div>

      <Separator />
    </div>
  )

}