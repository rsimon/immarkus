import { useGraphSearch } from './useGraphSearch';

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

      {sentence.ObjectType && (
        <select onChange={(e) => updateSentence({ ConditionType: e.target.value as 'WHERE' | 'IN_FOLDERS_WHERE' | 'ANNOTATED_WITH' })}>
          <option value="">Select Condition Type</option>
          <option value="WHERE">Where</option>
          <option value="IN_FOLDERS_WHERE">In Folders Where</option>
          <option value="ANNOTATED_WITH">Annotated With</option>
        </select>
      )}

      {sentence.ConditionType && sentence.ConditionType !== 'ANNOTATED_WITH' && renderAttributeDropdown()}
    </div>
  )

}