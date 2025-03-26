interface CombineProps {

  className?: string;

}

/**
 * https://iconoir.com/ – MIT License 
 */
export const Combine = (props: CombineProps) => {

  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg"
      className={props.className} 
      viewBox="0 0 24 24" 
      fill="none">
      <path 
        d="M15 9H20.4C20.7314 9 21 9.26863 21 9.6V20.4C21 20.7314 20.7314 21 20.4 21H9.6C9.26863 21 9 20.7314 9 20.4V15" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" />
      <path 
        d="M15 9V3.6C15 3.26863 14.7314 3 14.4 3H3.6C3.26863 3 3 3.26863 3 3.6V14.4C3 14.7314 3.26863 15 3.6 15H9" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" />
    </svg>
  )

}