export const Rectangle = (props: { className?: string }) => (
  <svg
    style={{
      fill: 'none',
      stroke: 'currentColor',
      strokeLinejoin: 'round',
      strokeWidth: '4.5px'
    }} 
    className={props.className} viewBox="0 0 70 44">
    <rect x="16" y="8" width="40" height="36" />
  </svg>
)