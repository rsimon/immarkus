import { AppNavigationSidebar } from '@/components/AppNavigationSidebar';

export const About = () => {

  return (
    <div className="page-root">
      <AppNavigationSidebar />

      <main className="page about px-12 py-6">
        <h1 className="text-xl font-semibold tracking-tight mb-4">About</h1>

        <p className="p-1 mt-3 text-sm max-w-xl leading-6">
          IMMARKUS: Image Annotation has been developed by Prof. Dr. Hilde De 
          Weerdt, <a className="text-sky-700 hover:underline" href="https://rainersimon.io" target="_blank">Dr. Rainer Simon</a>, 
          Dr. Lee Sunkyu, Dr. Iva Stojević, Meret Meister, and Xi Wangzhi as part of the 
          Regionalizing Infrastructures in Chinese History 
          (<a href="https://www.infrastructurelives.eu/" className="text-sky-700 hover:underline" target="_blank">RegInfra</a>) project.
        </p>

        <p className="p-1 mt-3 text-sm max-w-xl leading-6">
          This research is part of a project that has received funding from the European 
          Research Council (ERC) under the European Union's Horizon 2020 research and 
          innovation programme (Grant agreement No. 101019509).
        </p>

        <h2 className="p-1 mt-6 font-semibold max-w-xl leading-6">
          How to cite this software:
        </h2>

        <h3 className="p-1 mt-4 text-sm max-w-xl font-semibold leading-6">Platform</h3>
        <p className="px-1 text-sm max-w-xl leading-6">
          Hilde De Weerdt, Rainer Simon, Lee Sunkyu, Iva Stojević, Meret Meister, and Xi Wangzhi.
          IMMARKUS: Image Annotation. 2024. <a className="text-sky-700 hover:underline" href="https://immarkus.xmarkus.org" target="_blank">immarkus.xmarkus.org</a>.
        </p>

        <h3 className="p-1 mt-4 text-sm max-w-xl font-semibold leading-6">Code</h3>
        <p className="px-1 text-sm max-w-xl leading-6">
          Rainer Simon. IMMARKUS: Image Annotation in X-MARKUS. 2024. <a className="text-sky-700 hover:underline" href="https://github.com/rsimon/immarkus" target="_blank">github.com/rsimon/immarkus</a>.    
        </p>

        <h3 className="p-1 mt-4 text-sm max-w-xl font-semibold leading-6">Instructions</h3>
        <p className="px-1 text-sm max-w-xl leading-6">
          Hilde De Weerdt, Rainer Simon, Lee Sunkyu, and Iva Stojević. Instructions 
          for Image Annotation in IMMARKUS. 2024. <a className="text-sky-700 hover:underline" href="https://immarkus.xmarkus.org" target="_blank">immarkus.xmarkus.org</a>.
        </p>

        <h3 className="p-1 mt-4 text-sm max-w-xl font-semibold leading-6">Instructional videos</h3>
      </main>
    </div>
  )
}