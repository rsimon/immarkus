import { Progress } from '@/components/Progress';

import './Loading.css';

interface LoadingProps {

  progress: number;

}

export const Loading = (props: LoadingProps) => {

  return (
    <main className="page start loading">
      <div className="content-wrapper">
        <p className="mb-4 text-md">Loading...</p>
        <Progress className="progress" value={props.progress} />
      </div>
    </main>
  )

}