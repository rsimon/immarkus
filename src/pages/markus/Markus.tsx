import { AppNavigationSidebar } from '@/components/AppNavigationSidebar';

export const Markus = () => {

  return (
    <div className="page-root">
      <AppNavigationSidebar />

      <main className="page markus px-12 py-6">
        <h1 className="text-xl font-semibold tracking-tight mb-4">X-MARKUS</h1>

        <div className="max-w-2xl leading-relaxed text-sm">
          <p className="text-muted-foreground mb-4">
            IMMARKUS is part of X-MARKUS, a cross-media annotation environment consisting of:
          </p>

          <ul className="mb-8">
            <li className="mb-4">
              <strong>MARKUS</strong>. Hou Ieong Brent Ho and Hilde De Weerdt. MARKUS: Text 
              Analysis and Reading Platform. 2014- <a 
                className="text-sky-700 hover:underline" 
                target="_blank" 
                href="http://dh.chinese-empires.eu/">dh.chinese-empires.eu</a>.
            </li>

            <li className="mb-4">
              <strong>CO-MARKUS</strong>. Hilde De Weerdt, Hou Ieong (Brent) Ho, Sander Molenaar. 
              COMARKUS: Contextual Annotation in X-MARKUS. 2024. <a 
                className="text-sky-700 hover:underline" 
                target="_blank" 
                href="https://comarkus.xmarkus.org">comarkus.xmarkus.org</a>
            </li>

            <li className="mb-4">
              <strong>COMPARATIVUS</strong>. Hilde De Weerdt, Mees Gelein, and Brent Ho. 
              COMPARATIVUS: A Text Comparison Platform 2017. <a 
                className="text-sky-700 hover:underline" 
                target="_blank" 
                href="http://dh.chinese-empires.eu/comparativus/">dh.chinese-empires.eu/comparativus</a> 
            </li>
  
            <li className="mb-4">
              <strong>PARALLELS</strong>. Hilde De Weerdt and Mees Gelein. Parallells: Version and 
              Edition Comparison. 2021. <a 
                className="text-sky-700 hover:underline" 
                target="_blank"
                href="https://dh.chinese-empires.eu/parallells">dh.chinese-empires.eu/parallells</a>
            </li>
          </ul>

          <p className="text-muted-foreground mb-4 mt-8">
            All platforms feature instructional materials. For a discussion of design principles 
            and use cases:
          </p>
          
          <p className="mb-4">
            Hilde De Weerdt. "Creating, Linking, and Analyzing Chinese and Korean Datasets: Digital 
            Text Annotation in MARKUS and COMPARATIVUS." Journal of Chinese History 4, no. 2 (2020): 519–27.
            <a
              className="text-sky-700 hover:underline" 
              target="_blank" 
              href="https://doi.org/10.1017/jch.2020.23">https://doi.org/10.1017/jch.2020.23</a>.
          </p>
  
          <p className="mb-4">
            Hilde De Weerdt, Xiong Huei-Lan & Liu Jialong. "Rethinking Space and Power in East Asia: Digital 
            Approaches to the History of Infrastructure." Ming Studies, 81 (2020), 76-87. 
            <a 
              className="text-sky-700 hover:underline" 
              target="_blank" 
              href="https://doi.org/10.1080/0147037X.2020.1736862">https://doi.org/10.1080/0147037X.2020.1736862</a>.
          </p>

          <p className="mb-4">
            Hilde De Weerdt, Mees Gelein, Gabe van Beijeren, Hu Jing, and Brent Ho. "Reading The Essentials of
            Governance Digitally," v.2. 2022. 
            <a 
              className="text-sky-700 hover:underline" 
              target="_blank" 
              href="https://chinese-empires.eu/zgzy">https://chinese-empires.eu/zgzy</a>.
          </p>
        </div>
      </main>
    </div>
  )
}