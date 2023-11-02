import { ReactElement, useState } from 'react';

import { DataSetPreview, LPNewModel } from '@/types';
import { HomeView } from '@/components/views/home';
import { SolutionView } from '@/components/views/solution';

enum View {
  HOME = 'home',
  SOLUTION = 'solution',
}

export const IndexView = (): ReactElement => {
  const [model, setModel] = useState<LPNewModel | null>(null);
  const [dataset, setDataset] = useState<DataSetPreview | null>(null);
  const [view, setView] = useState<View>(View.HOME);

  if (view === View.HOME) {
    return (
      <HomeView
        onSelectDataset={(dataset, model) => {
          setModel(model);
          setDataset(dataset);
          setView(View.SOLUTION);
        }}
      />
    );
  }

  if (view === View.SOLUTION && model && dataset) {
    return (
      <SolutionView
        model={model}
        dataset={dataset}
        onBack={() => setView(View.HOME)}
      />
    );
  }

  return <HomeView />;
};
