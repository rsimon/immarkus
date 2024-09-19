import { useEffect, useState } from 'react';
import { ImageAnnotation } from '@annotorious/react';
import { W3CRelationLinkAnnotation, W3CRelationMetaAnnotation } from '@annotorious/plugin-connectors-react';
import { isW3CRelationLinkAnnotation, isW3CRelationMetaAnnotation, useStore } from '@/store';
import { Separator } from '@/ui/Separator';
import { PluginConnectionsListItem } from './PluginConnectionsListItem';

interface PluginConnectionsListProps {

  annotation: ImageAnnotation;

}


export interface PluginConnection {

  link: W3CRelationLinkAnnotation;

  meta?: W3CRelationMetaAnnotation;

}

export const PluginConnectionsList = (props: PluginConnectionsListProps) => {

  const store = useStore();

  const [connections, setConnections] = useState<PluginConnection[]>([]);

  useEffect(() => {
    const { id } = props.annotation;

    store.findImageForAnnotation(id).then(image => {
      // Should never happen
      if (!image) return;

      store.getAnnotations(image.id).then(all => {
        const links: W3CRelationLinkAnnotation[] = all
          .filter(a => isW3CRelationLinkAnnotation(a))
          .filter(link => link.body === id || link.target === id);

        const connections: PluginConnection[] = links.map(link => ({
          link,
          meta: all.find(a => isW3CRelationMetaAnnotation(a) &&  a.target === link.id) as unknown as W3CRelationMetaAnnotation
        }));

        setConnections(connections);

      });
    });
  }, [store, props.annotation]);

  return (
    <div>
      <h3 className="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm 
        ml-0.5 flex gap-1.5 pt-4 pb-1 items-center">
        <span>Connected Annotations</span>
      </h3>

      <ul>
        {connections.map(({ link, meta }) => (
          <li key={link.id}>
            <PluginConnectionsListItem
              referenceAnnotation={props.annotation}
              link={link}
              meta={meta} />
          </li>
        ))}
      </ul>

      <Separator className="mt-3" />
    </div>
  )

}