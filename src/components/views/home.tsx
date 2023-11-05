import { ReactElement, useState } from 'react';
import { Grid, Box, Button } from '@mui/material';

import { DataSetPreview, LPNewModel } from '@/types';
import { HomeLayout } from '@/components/layouts';
import { Dataset, DatasetPreview } from '@/components/elements';
import { DATASETS } from '@/datasets';
import { parseData, ParserType } from '@/data';

export interface HomeViewProps {
  onSelectDataset?: (dataset: DataSetPreview, model: LPNewModel) => unknown;
}

export const HomeView = ({ onSelectDataset }: HomeViewProps): ReactElement => {
  const [selectedDataset, setSelectedDataset] = useState<DataSetPreview | null>(null);

  const handleSelectCustomDataset = async () => {
    const content = await window.IPC.showCSVSelectionDialog();

    if (!content) return;

    const parsedDataset = parseData(content, ParserType.CSV);

    const customDataset = {
      name: 'Custom Dataset',
      description: `A custom dataset with ${parsedDataset.labels.size} labels and ${parsedDataset.dataWithLabels.size} data points`,
      ...parsedDataset,
    };

    setSelectedDataset(customDataset);
  };

  return (
    <HomeLayout>
      <DatasetPreview
        open={!!selectedDataset}
        dataset={selectedDataset}
        onClose={() => setSelectedDataset(null)}
        onConfirm={onSelectDataset}
      />
      <Box>
        <Button fullWidth variant="outlined" onClick={handleSelectCustomDataset}>
          Upload a Dataset
        </Button>
      </Box>
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
