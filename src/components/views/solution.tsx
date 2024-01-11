import { ReactElement, useState, useEffect, useMemo, useRef } from 'react';
import { Box, Typography, Button, CircularProgress, Alert } from '@mui/material';
import { saveSvgAsPng } from 'save-svg-as-png';

import { DataSetPreview, LPNewModel, LPSolution } from '@/types';
import { SolutionLayout } from '@/components/layouts';
import { SolutionRenderer } from '@/components/elements';
import { classifyDataSet, groupDataSet } from '@/data';
import { DEFAULT_THEME } from '@/themes';

export interface SolutionViewProps {
  model: LPNewModel;
  dataset: DataSetPreview;
  onBack?: () => void;
}

export const SolutionView = ({ model, dataset, onBack }: SolutionViewProps): ReactElement => {
  const [error, setError] = useState(false);
  const [computing, setComputing] = useState(true);
  const [solution, setSolution] = useState<LPSolution | null>(null);
  const [time, setTime] = useState<string | null>(null);

  const svgRef = useRef<SVGElement>(null);

  const computeSolution = async () => {
    const startSeconds = new Date().getTime() / 1000;
    const computedSolution = await window.IPC.optimizeMIPModel(model);
    const endSeconds = new Date().getTime() / 1000;

    if (computedSolution.Status !== 'Optimal') {
      setError(true);
      setComputing(false);
      return;
    }

    const date = new Date(0);
    date.setSeconds(endSeconds - startSeconds);

    setTime(date.toISOString().substring(11, 19));
    setSolution(computedSolution);
    setComputing(false);
  };

  const classifiedDataset = useMemo(() => {
    return classifyDataSet(groupDataSet(dataset));
  }, [dataset]);

  const handleSaveImage = () => {
    const svg = svgRef.current;
    if (!svg || !solution) return;
    saveSvgAsPng(svg, `${dataset.name}.png`);
  };

  const handleSaveModel = async () => {
    const modelContent = await window.IPC.encodeMIPModel(model);

    const link = document.createElement("a");
    const file = new Blob([modelContent], { type: 'text/plain' });

    link.href = URL.createObjectURL(file);
    link.download = 'model.lp';

    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleRetry = () => {
    setError(false);
    setComputing(true);
    computeSolution();
  };

  useEffect(() => {
    computeSolution();
  }, [model]);

  return (
    <SolutionLayout
      showToolbar={!computing && !error && !!solution}
      elapsed={time ?? '00:00:00'}
      onBack={onBack}
      onSaveImage={handleSaveImage}
      onSaveModel={handleSaveModel}
    >
      {computing && (
        <Box width="100%" height="100%" display="flex" flexDirection="column" alignItems="center" justifyContent="center">
          <Box>
            <CircularProgress size={60} />
          </Box>
          <Typography variant="h4" component="div" align="center">
            We are optimizing the diagram, this may take a while...
          </Typography>
        </Box>
      )}
      {!computing && !error && solution && (
        <SolutionRenderer
          ref={svgRef}
          theme={DEFAULT_THEME}
          dataset={classifiedDataset}
          solution={solution}
        />
      )}
      {!computing && error && (
        <Box width="100%" height="100%" display="flex" flexDirection="column">
          <Alert
            severity="warning"
            action={
              <Button color="inherit" size="small" onClick={handleRetry}>
                Retry
              </Button>
            }
          >
            We were unable to find an optimal solution for your problem.
            Consider reducing the dataset size or splitting it into multiple parts.
          </Alert>
          <Box mt={2}>
            <Button variant="outlined" size="large" fullWidth onClick={onBack}>
              Return to Home
            </Button>
          </Box>
        </Box>
      )}
    </SolutionLayout>
  );
};
