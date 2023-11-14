export const Polygon = (props: { className?: string }) => (
  <svg 
    style={{
      fill: 'none',
      stroke: 'currentColor',
      strokeLinejoin: 'round',
      strokeWidth: '4.5px'
    }}
    className={props.className ? `${props.className} align-text-bottom` : 'align-text-bottom'} viewBox="0 0 70 40">
    <path d='M 5,14 60,5 55,45 18,38 Z' />
  </svg>
)
