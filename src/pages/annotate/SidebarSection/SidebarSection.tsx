import { useState } from 'react';
import { Funnel, Image, MessagesSquare, SquareMousePointer } from 'lucide-react';
import { useSelection } from '@annotorious/react-manifold';
import * as Tabs from '@radix-ui/react-tabs';
import { Separator } from '@/ui/Separator';
import { CurrentSelection } from './CurrentSelection';
import { AnnotationList } from './AnnotationList';
import { ImageMetadata } from './ImageMetadata';
import { FilterState } from '../FilterState';

interface SidebarSectionProps {

  filterState?: FilterState;
  
  onChangeFilterState(filter?: FilterState): void;

}

export const SidebarSection = (props: SidebarSectionProps) => {

  const { selected } = useSelection();

  const [tab, setTab] = useState('selection');

  const onEdit = () => setTab('selection');

  const showSelectionPip = tab !== 'selection' && selected.length > 0;

  const showListPip = tab !== 'annotation-list' && Boolean(props.filterState);

  return (
    <Tabs.Root 
      asChild      
      value={tab}
      onValueChange={setTab}>
      <aside className="absolute top-0 right-0 h-full w-85 flex flex-col overflow-hidden">
        <section className="toolbar border-b h-11.5 flex items-center shrink-0">
          <Separator orientation="vertical" className="h-4" />

          <Tabs.List className="flex gap-1.5 py-0.5 px-3">
            <Tabs.Trigger 
              value="selection" 
              className="relative group p-1.5 flex items-center text-xs rounded-md hover:bg-muted">
              <SquareMousePointer className="h-4 w-4 mr-1" /> Selection
              {showSelectionPip && (
                <div className="absolute top-1 left-1 border border-white group-hover:border-muted size-2 rounded-full bg-orange-400" />
              )}
            </Tabs.Trigger>

            <Tabs.Trigger 
              value="annotation-list" 
              className="relative group p-1.5 flex items-center text-xs rounded-md hover:bg-muted">
              {props.filterState ? (
                <Funnel className="size-4 mr-1" /> 
              ) : (
                <MessagesSquare className="size-4 mr-1" /> 
              )} List
              {showListPip && (
                <div className="absolute top-1 left-1 border border-white group-hover:border-muted size-2 rounded-full bg-orange-400" />
              )}
            </Tabs.Trigger>

            <Tabs.Trigger value="image-notes" className="p-1.5 flex items-center text-xs rounded-md hover:bg-muted text-muted-foreground">
              <Image className="h-4 w-4 mr-1" /> Metadata
            </Tabs.Trigger>
          </Tabs.List>
        </section>

        <section 
          className="sidebar-content flex grow border-l overflow-y-auto">
          <Tabs.Content value="selection" asChild>
            <div 
              className="relative grow h-full text-sm justify-center items-center w-full pt-1 pb-3 px-4">
              <CurrentSelection />
            </div> 
          </Tabs.Content>

          <Tabs.Content value="annotation-list" asChild>
            <div 
              className="grow h-full text-sm justify-center items-center w-full">
              <AnnotationList 
                filterState={props.filterState}
                onChangeFilterState={props.onChangeFilterState}
                onEdit={onEdit} />
            </div> 
          </Tabs.Content>

          <Tabs.Content value="image-notes" asChild>
            <div className="w-full h-full">
              <ImageMetadata />
            </div>
          </Tabs.Content>
        </section>
      </aside>
    </Tabs.Root>
  )

}