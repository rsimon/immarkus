import { Mosaic, MosaicWindow } from 'react-mosaic-component';

import './AnnotateMosaic.css';
import 'react-mosaic-component/react-mosaic-component.css';

const TITLE_MAP: Record<string, string> = {
  a: 'Left Window',
  b: 'Top Right Window',
  c: 'Bottom Right Window',
  new: 'New Window',
};

export const AnnotateMosaic = () => {

  return (
    <div className="page annotate h-full w-full">
      <main className="absolute top-0 left-0 h-full right-[340px] flex flex-col">
        <section className="toolbar border-b">

        </section>

        <section 
          className="workspace bg-muted flex-grow shadow-inner">

          <Mosaic
            renderTile={(id, path) => (
              <MosaicWindow path={path} createNode={() => 'new'} title={TITLE_MAP[id]}>
                <h1>{TITLE_MAP[id]}</h1>
              </MosaicWindow>
            )}
            initialValue={{
              direction: 'row',
              first: 'a',
              second: {
                direction: 'column',
                first: 'b',
                second: 'c',
              },
            }} />
        </section>
      </main>

      <aside className="absolute top-0 right-0 h-full w-[340px] flex flex-col">
        <section className="toolbar">

        </section>

        <section className="sidebar-content flex-grow border-l">

        </section>
      </aside>
    </div>
  )

}