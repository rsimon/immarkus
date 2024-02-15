import { MetadataSchema } from '@/model';
import { EnumField, ExternalAuthorityField, GeoCoordinateField, MeasurementField, NumberField, TextField, URIField } from '../PropertyFields';

interface MetadataSchemaPreviewProps {

  schema: Partial<MetadataSchema>;

}

export const MetadataSchemaPreview = (props: MetadataSchemaPreviewProps) => {

  return (
    <div className="bg-muted px-12 py-6 border-l rounded-r-lg">
      <h2>
        Preview
      </h2>

      <p className="text-left text-xs leading-relaxed mt-1 mb-6">
        This is how the data entry form for your metadata schema will appear.
      </p>

      <div>
        {(props.schema.properties || []).map(definition => (
          <div className="mt-2" key={definition.name}>
            {definition.type === 'enum' ? (
              <EnumField
                id={definition.name}
                className="bg-white"
                definition={definition} />
            ) : definition.type === 'external_authority' ? (
              <ExternalAuthorityField
                id={definition.name}
                className="bg-white"
                definition={definition} />
            ) : definition.type === 'geocoordinate' ? (
              <GeoCoordinateField
                id={definition.name}
                className="bg-white"
                definition={definition} />
            ) : definition.type === 'measurement' ? (
              <MeasurementField
                id={definition.name}
                className="bg-white"
                definition={definition} />
            ) : definition.type === 'number' ? (
              <NumberField
                id={definition.name}
                className="bg-white"
                definition={definition} />
            ) : definition.type === 'text' ? (
              <TextField 
                id={definition.name}
                className="bg-white"
                definition={definition} />
            ) : definition.type === 'uri' ? (
              <URIField 
                id={definition.name}
                className="bg-white"
                definition={definition} />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}