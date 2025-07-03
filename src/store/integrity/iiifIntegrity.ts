import { fileExistsInDirectory, renameFile, writeJSONFile } from '../utils';

/**
 * Note that the FileSystem API does not seem to include a method
 * to simply rename a file directly. Therefore, we have to write a
 * new file, and delete the old one.
 */
export const rewriteFile = async (
  dirHandle: FileSystemDirectoryHandle,
  oldFilename: string,
  newFilename: string,
  data: any
): Promise<void> => {
  try {
    const oldFileHandle = await dirHandle.getFileHandle(oldFilename);

    // Delete old file
    await dirHandle.removeEntry(oldFilename);

    // Write new file with updated data
    const newFile = await dirHandle.getFileHandle(newFilename, { create: true });
    
    await writeJSONFile(newFile, data);
  } catch (error) {
    console.error('Error rewriting file:', error);
    throw error;
  }
}

export const repairManifestId = async (
  dirHandle: FileSystemDirectoryHandle, 
  file: File, 
  data: any, 
  expectedId: string
) => {
  const invalidId = file.name.substring('_iiif.'.length, file.name.indexOf('.json'));
  console.log(`Reparing legacy manifest ID: ${invalidId} -> ${expectedId}`);

  // Step 1: fix ID in the data
  data.id = expectedId;

  const fixedManifestFilename = `_iiif.${expectedId}.json`;

  // Step 2: rewrite the manifest descriptor file
  await rewriteFile(dirHandle, file.name, fixedManifestFilename, data);

  // Step 3: rename the annotation file, if any
  const invalidAnnotationsFile = `_iiif.${invalidId}.annotations.json`;
  const exists = await fileExistsInDirectory(dirHandle, invalidAnnotationsFile);
  if (exists) {
    const fixedAnnotationsFile = `_iiif.${expectedId}.annotations.json`;
    await renameFile(dirHandle, invalidAnnotationsFile, fixedAnnotationsFile);
  }

}