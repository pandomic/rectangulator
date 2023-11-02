import { ReactElement, useState } from 'react';
import { Grid } from '@mui/material';

import {DataSetPreview, LPNewModel} from '@/types';
import { HomeLayout } from '@/components/layouts';
import { Dataset, DatasetPreview } from '@/components/elements';
import { DATASETS } from '@/datasets';

export interface HomeViewProps {
  onSelectDataset?: (dataset: DataSetPreview, model: LPNewModel) => unknown;
}

export const HomeView = ({ onSelectDataset }: HomeViewProps): ReactElement => {
  const [selectedDataset, setSelectedDataset] = useState<DataSetPreview | null>(null);

  return (
    <HomeLayout>
      <DatasetPreview
        open={!!selectedDataset}
        dataset={selectedDataset}
        onClose={() => setSelectedDataset(null)}
        onConfirm={onSelectDataset}
      />
      <Grid container spacing={3} height="100%">
        {DATASETS.map((dataset) => (
          <Grid key={dataset.name} item xs={12} sm={6} md={3} lg={3} xl={4}>
            <Dataset
              dataset={dataset}
              onClick={setSelectedDataset}
            />
          </Grid>
        ))}
      </Grid>
    </HomeLayout>
  );
};
