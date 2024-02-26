import { Download } from 'lucide-react';
import { useStore } from '@/store';
import { Button } from '@/ui/Button';
import { exportAnnotationsAsExcel } from './exportExcel';
import { exportAnnotationsAsJSONLD } from './exportJSONLD';

export const ExportAnnotations = () => {

  const store = useStore();

  return (
    <ul className="py-2">
      <li>
        <section className="w-full py-2 flex flex-row gap-20 justify-between">
          <div>
            <h3 className="font-medium mb-1 leading-relaxed">
              All Annotations
            </h3>

            <p className="text-sm">
              All annotations, on all images in your current work folder, as a flat list
              in <a className="underline underline-offset-4 hover:text-primary" href="https://www.w3.org/TR/annotation-model/" target="_blank">W3C Web Annotation format</a>.
            </p>
          </div>

          <div>
            <Button 
              className="whitespace-nowrap flex gap-2"
              onClick={() => exportAnnotationsAsJSONLD(store)}>
              <Download className="h-4 w-4" /> JSON-LD
            </Button>
          </div>
        </section>
      </li>

      <li>
        <section className="w-full py-2 flex flex-row gap-20 justify-between">
          <div>
            <h3 className="font-medium mb-1 leading-relaxed">
              Annotations and Images
            </h3>

            <p className="text-sm">
              All annotations, on all images in your current work folder, as an Excel file. This export 
              will also include the annotated images snippets.
            </p>
          </div>

          <div>
            <Button 
              className="whitespace-nowrap flex gap-2"
              onClick={() => exportAnnotationsAsExcel(store)}>
              <Download className="h-4 w-4" /> XLS
            </Button>
          </div>
        </section>
      </li>
    </ul>
  )

}