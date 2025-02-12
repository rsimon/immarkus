# IMMARKUS Data Model and File Structure

IMMARKUS stores all user data **locally on the user's computer in JSON files**. This architecture choice was made for several reasons:
- It keeps the architecture simple & privacy-friendly: local-only, with no need for cloud storage or an online database.
- It avoids the use of built-in browser storage technologies like [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) or [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API), which 
browsers may delete without notice to the user (e.g. after a certain period of inactivity).
- It simplifies handling of large files, especially images.

---

## 1. Core Project Files

When the user launches IMMARKUS, they must specify a **project folder**. The browser will prompt the user to grant 
access and, if the user confirms, IMMARKUS can access this folder and all files in it (incl. in subfolders).
This folder serves as the root directory for all project-related data. 

IMMARKUS stores core project-level information in two key files:

### _immarkus.model.json
This file contains the **data model definitions**, including:
- **Entity classes** and their properties.
- **Relationship types** between entities.
- Definitions for **image and folder metadata** schemas.

These definitions are editable by the user in IMMARKUS's **Data Model** tab.

### _immarkus.relations.json
This file stores **relationships between annotations** across the project. Note that relations can link annotations on different images (in different folders). Therefore, relationships are stored at the global (root) level. See section [5 Relationship Data Format](#5-relationship-data-format) for details of the relationship data model.

---

## 2. Image-Specific Files

IMMARKUS recursively loads images from the root project folder and its subfolders. Annotations and metadata for each image are stored in JSON files named `[image-filename].json`. These files adhere to the [W3C Web Annotation Data Model](https://www.w3.org/TR/annotation-model/).

### Structure of Image Annotation Files
Each annotation file contains one or more annotations including the following key elements:

- `id`: a UUID identifier for the annotation.
- `target`: the annotated area of interest.
  - `target.source`: the image filename.
  - `target.selector`: the annotated image area. IMMARKUS uses:
    - W3C `FragmentSelector` for rectangular regions.
    - W3C `SvgSelector` for polygon and ellipse regions.
- `body`: the annotation payload. Each body can be one of the following:
  - **Entity Tag:** used to classify the image region with an Entity Class from the user's data model.
    - `type`: `Dataset`
    - `purpose`: `classifying`
    - `source`: the Entity Class ID in the data model.
    - `properties`: A JSON object containing user-defined properties for the entity.
  - **Note:** A free-text comment added by the user.
    - `type`: `TextualBody`
    - `purpose`: `commenting`
    - `value`: The comment text.

### Image Metadata Annotation
In addition to region-specific annotations, each image may have a metadata annotation. This annotation:
- has a `target` without a `selector` (since it applies to the entire image).
- contains one `body` with:
  - `purpose`: `describing`
  - `source`: the metadata schema name in the data model.
  - `properties`: a JSON object containing user-defined metadata.

#### Example 1: An image annotation with two Entity tags and a note
```jsonc
{
  "@context": "http://www.w3.org/ns/anno.jsonld",
  "type": "Annotation",
  "id": "cc21de14-b392-4e10-81ab-43f6f00eac64",
  "target": {
    "source": "image-filename",
    "selector": {
      "type": "FragmentSelector",
      "conformsTo": "http://www.w3.org/TR/media-frags/",
      "value": "xywh=pixel:<x,y,width,height>"
    }
  },
  "body": [
    {
      "type": "Dataset",
      "purpose": "classifying",
      "source": "my-entity-class-a",
      "properties": {
        // Entity-specific properties
      }
    },
    {
      "type": "Dataset",
      "purpose": "classifying",
      "source": "my-entity-class-b",
      "properties": {
        // Entity-specific properties
      }
    },
    {
      "type": "TextualBody",
      "purpose": "commenting",
      "value": "A note..."
    }
  ]
}
```

#### Example 2: Image Metadata Annotation
```jsonc
{
  "@context": "http://www.w3.org/ns/anno.jsonld",
  "type": "Annotation",
  "id": "6ef8d60f-5f54-4e70-a72d-db9cebb6d8e2",
  "target": {
    "source": "image-filename"
  },
  "body": {
    "source": "artwork",
    "properties": {
      // Schema-specific properties
    },
    "purpose": "describing"
  }
}
```
---

## 3. IIIF-Specific Files

IMMARKUS supports annotations on IIIF resources. When a user imports a IIIF manifest, only minimal metadata is stored locally. The manifest itself is always fetched online from the repository.

### IIIF Manifest Metadata

Imported IIIF sources are recorded in a JSON file named `_iiif.[manifest-id].json`. This file contains:

- A unique `id` (generated by IMMARKUS, distinct from the manifest's URI!)
- The manifest's `name`, `uri`, and presentation API version.
- A list of `canvases`, each with:
  - An `id` (generated by IMMARKUS).
  - The canvas's `uri` and `name`.

#### Example:

```json
{
  "id": "manifest-id",
  "name": "manifest-title",
  "uri": "manifest-uri",
  "type": "PRESENTATION_MANIFEST",
  "majorVersion": 2,
  "canvases": [
    {
      "id": "canvas-id",
      "uri": "canvas-uri",
      "name": "canvas-label",
      "manifestId": "manifest-id"
    }
  ]
}
```

### IIIF Annotations

Annotations on IIIF resources are stored in a JSON file named `_iiif.[manifest-id].annotations.json`. These files have the same structure as image annotation files, with one key difference: the `source` field in the `target` object uses the format
 
`iiif:manifest-id:canvas-id`

where:
  - `iiif:` identifies the source as a IIIF resource.
  - `manifest-id` is the internal manifest ID from the IIIF manifest metadata file.
  - `canvas-id` is the internal canvas ID from the IIIF manifest metadata file.

#### Example:

```json
{
  "target": {
    "source": "iiif:manifest-id:canvas-id",
    "selector": {
      "type": "FragmentSelector",
      "value": "xywh=pixel:<x,y,width,height>"
    }
  }
}
```

---

## 4. Folder Metadata

IMMARKUS also supports metadata at the folder level. Each folder (including the root project folder) can contain a JSON file named `_immarkus.folder.meta.json`. This file stores user-provided metadata for the folder, using the same W3C Web Annotation format as the image metadata annotation.

### Structure of Folder Metadata Files

- The annotation has no explicit `target` (the folder is implied).
- The `body` contains:
  - `source`: identifies the metadata schema from the data model.
  - `properties`: a JSON object containing user-defined metadata.

#### Example:

```json
{
  "@context": "http://www.w3.org/ns/anno.jsonld",
  "type": "Annotation",
  "id": "ccfd804c-2733-4725-a779-51f4326a9fe4",
  "body": {
    "source": "artwork",
    "properties": {
      "Image_title_ch": "Test"
    },
    "purpose": "describing"
  }
}
```
---

## 5. Relationship Data Format

Relationships in IMMARKUS are stored in the root-level `_immarkus.relations.json` file and adhere to the [W3C Web Annotation Data Model](https://www.w3.org/TR/annotation-model/). Each relationship is represented as a pair of annotations: one for the link, and one for the tag that defines the link type.

## Linking Annotation

An annotation with a `motivation` of `linking`, which defines the directional connection between two annotations.

- `target`: The ID of the annotation where the relationship **starts**.
- `body`: the ID of the annotation where the relationship **ends**.

Note that the "arrow" goes from `target` to `body`. This directionality may feel counter-intuitive, but is mandated by the W3C Model, which defines that the `body` must be "about" the `target`.

## Tagging Annotation

An annotation with a `motivation` of `tagging`, which "annotates" the linking annotation with the relationship type.

- `target`: The ID of the linking annotation being tagged.
- `body`: the name of the relationship type in the user's data model.

#### Example:

```jsonc
[
  {
    "id": "6e626ac2-5369-48d3-b88b-90cbd13d2568",
    "motivation": "linking",
    "body": "cc21de14-b392-4e10-81ab-43f6f00eac64",
    "target": "861a3351-6685-483a-b23d-ba81359c378c",
    "created": "2024-11-07T10:47:12.075Z"
  },
  {
    "id": "b4d15381-2570-446d-aa01-e8027b2a5d94",
    "motivation": "tagging",
    "body": {
      "value": "is part of"
    },
    "target": "6e626ac2-5369-48d3-b88b-90cbd13d2568",
    "created": "2024-11-07T10:47:12.075Z"
  },
  {
    "id": "f6743e97-91db-414d-bd69-6a4060461450",
    "motivation": "linking",
    "body": "696674b1-709f-4cd9-99b4-0db55c4537a3",
    "target": "0f6282bf-58e9-417e-84ce-fe3bb008b691",
    "created": "2024-12-11T12:42:21.247Z"
  },
  {
    "id": "a8b85320-c3b8-41c0-a204-7d404e033925",
    "motivation": "tagging",
    "body": {
      "value": "is located at"
    },
    "target": "f6743e97-91db-414d-bd69-6a4060461450",
    "created": "2024-12-11T12:42:21.248Z"
  }
]
```
---

## Summary

IMMARKUS organizes project data via structured JSON files:

- **Project-level files** define the global data model and relationships.
- **Image-specific files** store annotations and metadata using W3C Web Annotation standards.
- **IIIF metadata files** maintain references to imported IIIF manifests and their annotations.
- **Folder metadata files** store descriptive metadata at the directory level.

