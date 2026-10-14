import { useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/ui/Toaster';

export const useFailedManifestToast = () => {
  const { t } = useTranslation('knowledgegraph');

  const { toast } = useToast();

  const reportedFailures = useRef<Set<string>>(new Set());

  return useCallback((failedUris: string[], totalCount: number) => {
    const newFailures = [...new Set(failedUris)]
      .filter(uri => !reportedFailures.current.has(uri));

    if (newFailures.length === 0) return;

    newFailures.forEach(uri => reportedFailures.current.add(uri));

    toast({
      duration: Infinity,
      title: t('iiifError.title'),
      description: (
        <div className="space-y-2">
          <p>
            {t('iiifError.description', {
              failed: failedUris.length,
              count: totalCount
            })}
          </p>
          <ul className="list-disc ml-4">
            {newFailures.map(uri => (
              <li key={uri} className="ml-4">
                <a
                  href={uri}
                  target="_blank"
                  rel="noreferrer"
                  className="block truncate hover:underline">
                  {uri}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )
    });
  }, [t, toast]);
};
