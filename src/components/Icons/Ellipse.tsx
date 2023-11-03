export const Ellipse = (props: { className?: string }) => (
  <svg
    style={{
      fill: 'none',
      stroke: 'currentColor',
      strokeLinejoin: 'round',
      strokeWidth: '4.5px'
    }} 
    className={props.className} viewBox="0 0 70 44">
    <ellipse cx="34" cy="26" rx="26" ry="22" />
  </svg>
)