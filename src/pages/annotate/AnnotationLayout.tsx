import { useState } from 'react';
import type { ReactElement } from 'react';
import { Mosaic } from 'react-mosaic-component2';
import type { MosaicNode } from 'react-mosaic-component2';

interface AnnotationLayoutProps {

  workspace: ReactElement;

  sidebar: ReactElement;

}

type AnnotationPane = 'workspace' | 'sidebar';

interface AnnotationLayoutConfig {

  initialValue: MosaicNode<AnnotationPane>;

  minimumPaneSizePercentage: number;

}

// Tailwind's w-85 resolves to 21.25rem (340px at the default root size).
const INITIAL_SIDEBAR_WIDTH = 340;
const MINIMUM_PANE_SIZE_PX = 200;
const MINIMUM_PANE_SIZE_PERCENTAGE = 15;

const createInitialLayout = (viewportWidth: number): AnnotationLayoutConfig => {

  const sidebarPercentage = INITIAL_SIDEBAR_WIDTH / viewportWidth * 100;
  const minimumPaneSizePercentage = Math.min(
    MINIMUM_PANE_SIZE_PERCENTAGE,
    MINIMUM_PANE_SIZE_PX / viewportWidth * 100
  );
  const boundedSidebarPercentage = Math.max(
    minimumPaneSizePercentage,
    Math.min(100 - minimumPaneSizePercentage, sidebarPercentage)
  );

  return {
    initialValue: {
      direction: 'row',
      first: 'workspace',
      second: 'sidebar',
      splitPercentage: 100 - boundedSidebarPercentage
    },
    minimumPaneSizePercentage
  }

}

export const AnnotationLayout = (props: AnnotationLayoutProps) => {

  const [layout] = useState(() => createInitialLayout(window.innerWidth));

  const renderTile = (pane: AnnotationPane) =>
    pane === 'workspace' ? props.workspace : props.sidebar;

  return (
    <div className="relative h-full w-full min-h-0 min-w-0">
      <Mosaic<AnnotationPane>
        className="mosaic-blueprint-theme annotation-layout"
        mosaicId="annotation-layout"
        initialValue={layout.initialValue}
        resize={{ minimumPaneSizePercentage: layout.minimumPaneSizePercentage }}
        renderTile={renderTile} />
    </div>
  )

}
