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

        <p className="p-1 mt-3 text-sm max-w-xl leading-6">
          To cite the software when you use it in your research or teaching, please use 
          the following bibliographic information:
        </p>

        <dl>
          <dt className="p-1 mt-4 mb-2 text-sm max-w-xl font-semibold leading-6">
            Platform
          </dt>

          <dd className="px-1.5 text-sm max-w-xl leading-6 bg-muted py-1 rounded-sm">
            Hilde De Weerdt, Rainer Simon, Lee Sunkyu, Iva Stojević, Meret Meister, and Xi Wangzhi.
            IMMARKUS: Image Annotation. 2024. <a className="text-sky-700 hover:underline" href="https://immarkus.xmarkus.org" target="_blank">immarkus.xmarkus.org</a>.
          </dd>
          
          <dt className="px-1 mt-6 mb-2 text-sm max-w-xl font-semibold leading-6">
            Code
          </dt>

          <dd className="px-1.5 text-sm max-w-xl leading-6 bg-muted py-1 rounded-sm">
            Rainer Simon. IMMARKUS: Image Annotation in X-MARKUS. 2024. <a className="text-sky-700 hover:underline" href="https://github.com/rsimon/immarkus" target="_blank">github.com/rsimon/immarkus</a>.    
          </dd>

          <dt className="p-1 mt-6 mb-2 text-sm max-w-xl font-semibold leading-6">
            Instructions
          </dt>

          <dd className="px-1.5 text-sm max-w-xl leading-6 bg-muted py-1 rounded-sm">
            Hilde De Weerdt, Rainer Simon, Lee Sunkyu, and Iva Stojević. Instructions 
            for Image Annotation in IMMARKUS. 2024. <a className="text-sky-700 hover:underline" href="https://github.com/rsimon/immarkus/wiki" target="_blank">github.com/rsimon/immarkus/wiki</a>.
          </dd>
        </dl>

        <div className="max-w-xl flex justify-between items-end mt-6 mb-16 pr-3">
          <a 
            href="https://www.kuleuven.be/" 
            target="_blank" 
            title="KU Leuven">
            <img
              className="h-10" 
              src="/images/ku_leuven_logo.svg" 
              alt="KU Leuven logo" />
          </a>

          <a 
            href="https://erc.europa.eu/homepage" 
            target="_blank" 
            className="flex items-end gap-6"
            title="European Research Council">
            <img 
              className="w-16 translate-y-2.5"
              src="/images/european_research_council_logo.svg" 
              alt="Logo of the European Research Council" />

            <img
              className="h-10"
              src="/images/europe_flag.svg"
              alt="Flag of Europe" />
          </a>
        </div>
      </main>
    </div>
  )
}