import { useIIIFResource } from "@/utils/iiif";

interface IIIFPreviewImageProps {

  id: string;

}

export const IIIFPreviewImage = (props: IIIFPreviewImageProps) => {

  const resource = useIIIFResource(props.id);

  return null;

}