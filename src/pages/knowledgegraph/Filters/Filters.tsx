interface FiltersProps {

  onToggleIsolated(): void;

}

export const Filters = (props: FiltersProps) => {

  return (
    <button 
      className="absolute top-8 right-8"
      onClick={props.onToggleIsolated}>Filter</button>
  )

}