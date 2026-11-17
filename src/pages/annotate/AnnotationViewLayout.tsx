import { useState } from 'react';
import type { ReactElement } from 'react';
import { Mosaic } from 'react-mosaic-component2';
import type { MosaicNode } from 'react-mosaic-component2';

interface AnnotationViewLayoutProps {

  main: ReactElement;

  sidebar: ReactElement;

}

type AnnotationViewPane = 'main' | 'sidebar';

interface AnnotationViewLayoutConfig {

  initialValue: MosaicNode<AnnotationViewPane>;

  minimumPaneSizePercentage: number;

}

// Keep original Tailwind w-85 width = 340px
const INITIAL_SIDEBAR_WIDTH = 340;
const MINIMUM_PANE_SIZE_PX = 200;
const MINIMUM_PANE_SIZE_PERCENTAGE = 15;

const createInitialLayout = (viewportWidth: number): AnnotationViewLayoutConfig => {
  const sidebarPercentage = INITIAL_SIDEBAR_WIDTH / viewportWidth * 100;

  const minimumPaneSizePercentage = Math.min(
    MINIMUM_PANE_SIZE_PERCENTAGE,
    MINIMUM_PANE_SIZE_PX / viewportWidth * 100);

  const boundedSidebarPercentage = Math.max(
    minimumPaneSizePercentage,
    Math.min(100 - minimumPaneSizePercentage, sidebarPercentage));

  return {
    initialValue: {
      direction: 'row',
      first: 'main',
      second: 'sidebar',
      splitPercentage: 100 - boundedSidebarPercentage
    },
    minimumPaneSizePercentage
  }
}

export const AnnotationViewLayout = (props: AnnotationViewLayoutProps) => {

  const [layout] = useState(() => createInitialLayout(window.innerWidth));

  const renderTile = (pane: AnnotationViewPane) =>
    pane === 'main' ? props.main : props.sidebar;

  return (
    <div className="relative h-full w-full min-h-0 min-w-0">
      <Mosaic<AnnotationViewPane>
        className="mosaic-blueprint-theme annotation-layout"
        mosaicId="annotation-layout"
        initialValue={layout.initialValue}
        resize={{ minimumPaneSizePercentage: layout.minimumPaneSizePercentage }}
        renderTile={renderTile} />
    </div>
  )

}
