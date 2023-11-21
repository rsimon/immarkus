import { Folder } from "@/model";

interface FolderItemProps {

  folder: Folder;

}

export const FolderItem = (props: FolderItemProps) => {

  return (
    <div className="cursor-pointer relative overflow-hidden rounded-md border w-[200px] h-[200px]">
      {props.folder.name}
    </div>
  )

}