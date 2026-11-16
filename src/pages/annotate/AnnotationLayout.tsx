import type { ReactElement } from 'react';
import { Mosaic } from 'react-mosaic-component2';
import type { MosaicNode } from 'react-mosaic-component2';

interface AnnotationLayoutProps {

  workspace: ReactElement;

  sidebar: ReactElement;

}

type AnnotationPane = 'workspace' | 'sidebar';

const initialLayout: MosaicNode<AnnotationPane> = {
  direction: 'row',
  first: 'workspace',
  second: 'sidebar',
  splitPercentage: 75
};

export const AnnotationLayout = (props: AnnotationLayoutProps) => {

  const renderTile = (pane: AnnotationPane) =>
    pane === 'workspace' ? props.workspace : props.sidebar;

  return (
    <div className="relative h-full w-full min-h-0 min-w-0">
      <Mosaic<AnnotationPane>
        className="mosaic-blueprint-theme annotation-layout"
        mosaicId="annotation-layout"
        initialValue={initialLayout}
        resize={{ minimumPaneSizePercentage: 15 }}
        renderTile={renderTile} />
    </div>
  )

}
