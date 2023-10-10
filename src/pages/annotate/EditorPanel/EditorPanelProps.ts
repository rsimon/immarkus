import { Image } from '@/model';

export interface EditorPanelProps {

  image: Image;

  onSaving(): void;

  onSaved(): void;

  onError(error: Error): void;

}