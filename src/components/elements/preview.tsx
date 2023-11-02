import { ReactElement, useState, useMemo } from 'react';

import {
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Grid,
  Switch,
  Card,
  Box,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';

import {
  CartesianSize,
  DataSetPreview,
  GroupDimensions,
  LPModelInput,
  LPModelSettings,
  LPNewModel
} from '@/types';

import { groupDataSet, classifyDataSet } from '@/data';
import { buildNewModel } from '@/models';
import { computeGroupDimensions, computeLabelDimensions } from "@/layouts";
import { DEFAULT_THEME } from "@/themes";

export interface DatasetPreviewProps {
  open?: boolean;
  dataset?: DataSetPreview | null;
  onClose?: () => unknown;
  onConfirm?: (dataset: DataSetPreview, model: LPNewModel) => unknown;
}

const PREVIEW_CHECKS: Record<keyof LPModelSettings, { title: string, impact: 'high' | 'moderate' | 'low' }> = {
  enableObjectiveSquareness: {
    title: 'Try keeping the diagram square',
    impact: 'high',
  },
  enableIntersectingSetsConstraints: {
    title: 'Enable Intersecting Sets Constraints',
    impact: 'moderate',
  },
  enableSetLabelConstraints: {
    title: 'Enable Set Label Constraints',
    impact: 'moderate',
  },
  enableNonIntersectingSetsConstraints: {
    title: 'Enable Set Exclusion Constraints',
    impact: 'low',
  },
  enableFullyContainedSetsConstraints: {
    title: 'Enable Fully Contained Sets Constraints',
    impact: 'low',
  },
  enableGroupExclusionConstraints: {
    title: 'Enable Group Exclusion Constraints',
    impact: 'low',
  },
};

const IMPACT_MAP = {
  high: {
    title: 'High Performance Impact',
    color: 'error.main',
  },
  moderate: {
    title: 'Moderate Performance Impact',
    color: 'warning.main',
  },
  low: {
    title: 'Low Performance Impact',
    color: 'success.main',
  }
}

export const DatasetPreview = ({ open, dataset, onConfirm, onClose }: DatasetPreviewProps): ReactElement => {
  const [previewSettings, setPreviewSettings] = useState<LPModelSettings>({
    enableObjectiveSquareness: true,
    enableIntersectingSetsConstraints: true,
    enableNonIntersectingSetsConstraints: true,
    enableFullyContainedSetsConstraints: true,
    enableSetLabelConstraints: true,
    enableGroupExclusionConstraints: true,
  });

  const numRows = Math.max(...Array.from(dataset?.labelsWithData.values() ?? []).map((val) => val.size));
  const labels = Array.from(dataset?.labelsWithData.keys() ?? []);

  const computedModel = useMemo(() => {
    if (!dataset) return null;

    const groupedData = groupDataSet(dataset);
    const classifiedData = classifyDataSet(groupedData);

    const groupSizesMapData: [string, GroupDimensions][] = [...classifiedData.groups.values()].map(
      (group) => [group.groupAlias, computeGroupDimensions(DEFAULT_THEME, group)],
    );
    const groupSizes = new Map<string, GroupDimensions>([...groupSizesMapData])

    const labelSizesMapData: [string, CartesianSize][] = [...classifiedData.sets.values()].map(
      (set) => [set.alias, computeLabelDimensions(DEFAULT_THEME, set.name, Infinity)],
    );
    const setLabelSizes = new Map<string, CartesianSize>([...labelSizesMapData]);

    const modelInput: LPModelInput = {
      groupSizes,
      setLabelSizes,
      groupMargin: DEFAULT_THEME.groupItemSpacing,
      setLabelHeight: Math.floor(DEFAULT_THEME.setLabelPadding * 2 + DEFAULT_THEME.fontSize),
      settings: previewSettings,
    };

    return buildNewModel(classifiedData, modelInput);
  }, [dataset, previewSettings]);

  return (
    <Dialog
      open={!!open}
      onClose={onClose}
      fullScreen
    >
      <DialogTitle>
        Dataset Preview: {dataset?.name}
      </DialogTitle>
      <DialogContent>
        <Card>
          <CardContent>
            <Typography variant="body1" color="text.secondary">
              Preview Settings
            </Typography>
            <Box mt={2}>
              <Grid container spacing={3}>
                <Grid item xs={6} sm={6} md={6} lg={6} xl={6}>
                  <List dense>
                    {Object.entries(PREVIEW_CHECKS).map(([attr, impact]) => (
                      <ListItem key={attr}>
                        <ListItemText
                          primary={impact.title}
                          secondary={
                            <Typography variant="caption" color={IMPACT_MAP[impact.impact].color}>
                              {IMPACT_MAP[impact.impact].title}
                            </Typography>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            size="small"
                            defaultChecked
                            onChange={(_, checked) => {
                              setPreviewSettings((prev) => ({ ...prev, [attr]: checked }));
                            }}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </Grid>
                <Grid item xs={6} sm={6} md={6} lg={6} xl={6}>
                  <Typography variant="body1" color="text.secondary" component="div">
                    Constraints: <strong>{computedModel?.constraints.length ?? 0}</strong>
                  </Typography>
                  <Typography variant="body1" color="text.secondary" component="div">
                    Binary Variables: <strong>{computedModel?.binaries.size ?? 0}</strong>
                  </Typography>
                  <Typography variant="body1" color="text.secondary" component="div">
                    General Variables: <strong>{computedModel?.generals.size ?? 0}</strong>
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
        <Box mb={3} mt={3}>
          <DialogContentText>
            {dataset?.description}
          </DialogContentText>
        </Box>
        <TableContainer component={Paper}>
          {dataset && (
            <Table size="small">
              <TableHead>
                <TableRow>
                  {labels.map((label) => (
                    <TableCell key={label}>{label}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {new Array(numRows).fill(0).map((_, idx) => (
                  <TableRow key={idx}>
                    {labels.map((label) => (
                      <TableCell key={`row-${idx}-cell-${label}`} component="th" scope="row">
                        {Array.from(dataset.labelsWithData.get(label) ?? [])?.[idx]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button
          onClick={() => onConfirm?.(dataset!, computedModel!)}
          variant="contained"
          color="primary"
          autoFocus
        >
          Visualize
        </Button>
      </DialogActions>
    </Dialog>
  );
};
