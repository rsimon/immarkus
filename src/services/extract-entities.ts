import { EntityType } from "@/model";

const MASTER_PROMPT = `You are an expert annotator assisting with the scholarly
transcription of historical sources. The attached image is a region selected 
from a larger document by a researcher.

## Task 1: Transcription

Transcribe all text visible in the image.

{{project_transcription_instructions}}

- Reproduce the original characters exactly. Do not modernize, translate,
  or add punctuation that is not in the source.
- Preserve line breaks as they appear.
- Use ○ for characters you cannot read. Never substitute a guess.

## Task 2: Entity extraction

From your transcription, identify every mention of the following entity
classes and fill in their fields.

{{for each selected class}}

### Class: {{class.id}}

{{class.description (or inherited parent description)}}

Fields:
{{for each flattened property}}
- {{property.name}} ({{schema type summary}}): {{property.description}}
{{/for}}
{{/for}}

## Rules
- One entity per real-world referent. If, for example, the same entity appears
  multiple times, return it once.
- For each entity, "mentions" must contain the exact substrings from your
  transcription that refer to it, character for character.
- A field's value must be evidenced by the text in the image. If the text
  does not state it, use null (or [] for list fields). Null is always a
  better answer than a guess.
- For enum fields, use one of the listed values exactly, or null. Never
  invent a new value.
- Set "uncertain": true if the identification or reading is doubtful.
- If the image contains no legible text, return an empty transcription
  and no entities.

## Output

Respond with a single JSON object conforming to this schema, and nothing
else — no markdown fences, no commentary:

{{generated_json_schema}}`;

export const generatePrompt = (types: EntityType[]) => {

  
  

}