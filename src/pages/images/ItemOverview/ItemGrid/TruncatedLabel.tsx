import { useEffect, useRef, useState } from 'react';
import { Tooltip, TooltipTrigger } from '@/ui/Tooltip';
import { TooltipContent } from '@radix-ui/react-tooltip';

interface TruncatedLabelProps {

  value: string;

}

export const TruncatedLabel = (props: TruncatedLabelProps) => {

  const elRef = useRef(null);

  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    if (elRef.current) {
      setIsTruncated(elRef.current.scrollWidth > elRef.current.clientWidth);
    }
  }, [props.value]);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <h3 
          ref={elRef}
          className="overflow-hidden whitespace-nowrap text-ellipsis">
          {props.value}
        </h3>
      </TooltipTrigger>

      {isTruncated && (
        <TooltipContent 
          align="start"
          alignOffset={-6}
          sideOffset={-21}
          className="bg-gray-200 py-px px-1.5 rounded">
          {props.value}
        </TooltipContent>
      )}
    </Tooltip>
  )

}