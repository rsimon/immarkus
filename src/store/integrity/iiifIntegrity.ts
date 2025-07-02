import { fileExistsInDirectory, renameFile } from "../utils";

export const repairManifestId = async (
  dirHandle: FileSystemDirectoryHandle, 
  file: File, 
  data: any, 
  expectedId: string
) => {
  const invalidId = file.name.substring('_iiif.'.length, file.name.indexOf('.json'));
  console.log(`Reparing legacy manifest ID: ${invalidId} -> ${expectedId}`);

  const fixedManifestFilename = `_iiif.${expectedId}.json`;

  // Step 1: rename the file
  await renameFile(dirHandle, file.name, fixedManifestFilename);

  // Step 2: rename the annotation file, if any
  const invalidAnnotationsFile = `_iiif.${invalidId}.annotations.json`;
  const exists = await fileExistsInDirectory(dirHandle, invalidAnnotationsFile);
  if (exists) {
    const fixedAnnotationsFile = `_iiif.${expectedId}.annotations.json`;
    await renameFile(dirHandle, invalidAnnotationsFile, fixedAnnotationsFile);
  } 

  // Step 3: overwrite ID in `data`
  data.id = expectedId;
}