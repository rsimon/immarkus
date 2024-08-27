import { Button } from "@/ui/Button"
import { Spline } from "lucide-react"

export const Relationships = () => {
 
  return (
    <div>
      <p className="p-1 mt-4 text-sm max-w-xl leading-6">
        You can connect two annotations through a relationship. A relationship must have a 
        Relationship Type, such as 'is next to' or 'is part of'.
      </p>

      <div>

      </div>

      <div className="flex mt-4 gap-2">
        <Button>
          <Spline size={16} className="mr-2" /> Add Relationship Type
        </Button>
      </div>
    </div>
  )

}