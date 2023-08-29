import { Folder } from 'lucide-react';
import { Button } from '@/components/Button';

import './Open.css';

interface OpenProps {

  onOpenFolder(): void;

}

export const Open = (props: OpenProps) => {

  return (
    <main className="page start open">
      <div className="cta">
        <h1 className="font-medium mb-2 text-lg">Welcome to I-MARKUS</h1>
        <p className="text-xs text-muted-foreground mb-6 max-w-md">
          Open an existing work folder, or a new folder with image files.
        </p>
        <Button onClick={props.onOpenFolder}>
          <Folder size={18} className="mr-2" /> Open Folder
        </Button>
      </div>
    </main>
  )

}