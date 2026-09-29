import { useEffect, useState } from 'react';
import { AnnotationServiceStatus } from './Types';
import { AnnotationServiceOptions } from '@/services';

export const useIsProcessing = (status: AnnotationServiceStatus, options: AnnotationServiceOptions) => {

  const [isProcessing, setIsProcessing] = useState(Boolean(status?.state));

  useEffect(() => setIsProcessing(false), [options]);

  useEffect(() => setIsProcessing(Boolean(status?.state)), [status]);

  return isProcessing;
  
}