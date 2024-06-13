import { useGraphSearch } from "./useGraphSearch";

interface GraphSearchEditorProps {

}

export const GraphSearchEditor = (props: GraphSearchEditorProps) => {

  const {
    sentence,
    updateSentence,
  } = useGraphSearch();

  const renderAttributeDropdown = () => (
    <select onChange={(e) => updateSentence({ Attribute: e.target.value })}>
      <option value="">Select Attribute</option>
      <option value="Date">Date</option>
      <option value="Name">Name</option>
    </select>
  );

  return (
    <div className="absolute top-4 left-4 bg-red-300 z-50 p-5">
      <select onChange={(e) => updateSentence({ ObjectType: e.target.value as 'FOLDER' | 'IMAGE' })}>
        <option value="">Select Object Type</option>
        <option value="FOLDER">Folder</option>
        <option value="IMAGE">Image</option>
      </select>
    </div>
  )

}