import { Trans, useTranslation } from 'react-i18next';
import { AppNavigationSidebar } from '@/components/AppNavigationSidebar';

export const About = () => {

  const { t } = useTranslation('about');

  return (
    <>
      <AppNavigationSidebar />

      <main className="grow page about px-12 py-6 overflow-auto">
        <h1 className="text-xl font-semibold tracking-tight mb-4">{t('title')}</h1>

        <p className="p-1 mt-3 text-sm max-w-2xl leading-6">
          <Trans
            ns="about"
            i18nKey="developedBy"
            components={{
              rainerLink: <a className="text-sky-700 hover:underline" href="https://rainersimon.io" target="_blank" />,
              regInfraLink: <a href="https://www.infrastructurelives.eu/" className="text-sky-700 hover:underline" target="_blank" />
            }} />
        </p>

        <p className="p-1 mt-3 text-sm max-w-xl leading-6">
          This research is part of a project that has received funding from the European
          Research Council (ERC) under the European Union's Horizon 2020 research and
          innovation programme (Grant agreement No. 101019509).
        </p>

        <p className="p-1 mt-3 text-sm max-w-xl leading-6">
          {t('citation.intro')}
        </p>

        <dl>
          <dt className="p-1 mt-4 mb-2 text-sm max-w-xl font-semibold leading-6">
            {t('citation.platform')}
          </dt>

          <dd className="px-1.5 text-sm max-w-xl leading-6 bg-muted py-1 rounded-sm">
            Hilde De Weerdt, Rainer Simon, Dawn Zhuang, Lee Sunkyu, Iva Stojević, Meret Meister, and Xi Wangzhi.
            IMMARKUS: Image Annotation. 2024. <a className="text-sky-700 hover:underline" href="https://immarkus.xmarkus.org" target="_blank">immarkus.xmarkus.org</a>.
          </dd>

          <dt className="px-1 mt-6 mb-2 text-sm max-w-xl font-semibold leading-6">
            {t('citation.code')}
          </dt>

          <dd className="px-1.5 text-sm max-w-xl leading-6 bg-muted py-1 rounded-sm">
            Rainer Simon. IMMARKUS: Image Annotation in X-MARKUS. 2024. <a className="text-sky-700 hover:underline" href="https://github.com/rsimon/immarkus" target="_blank">github.com/rsimon/immarkus</a>.
          </dd>

          <dt className="p-1 mt-6 mb-2 text-sm max-w-xl font-semibold leading-6">
            {t('citation.instructions')}
          </dt>

          <dd className="px-1.5 text-sm max-w-xl leading-6 bg-muted py-1 rounded-sm">
            Hilde De Weerdt, Rainer Simon, Dawn Zhuang, Lee Sunkyu, and Iva Stojević. Instructions
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
              alt={t('logos.kuLeuven')} />
          </a>

          <a
            href="https://erc.europa.eu/homepage"
            target="_blank"
            className="flex items-end gap-6"
            title="European Research Council">
            <img
              className="w-16 translate-y-2.5"
              src="/images/european_research_council_logo.svg"
              alt={t('logos.erc')} />

            <img
              className="h-10"
              src="/images/europe_flag.svg"
              alt={t('logos.europeFlag')} />
          </a>
        </div>
      </main>
    </>
  )
}
