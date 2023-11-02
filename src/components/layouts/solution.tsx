import { CSSProperties, ReactElement, ReactNode } from 'react';
import { Box, AppBar, Toolbar, Typography, Button } from '@mui/material';

const styles: Record<string, CSSProperties> = {
  root: {
    width: '100%',
    height: '100%',
  },
};

export interface SolutionLayoutProps {
  children: ReactNode;
  showToolbar?: boolean;
  elapsed?: string;
  onSaveModel?: () => void;
  onSaveImage?: () => void;
  onBack?: () => void;
}

export const SolutionLayout = ({ children, showToolbar, elapsed, onBack, onSaveModel, onSaveImage }: SolutionLayoutProps): ReactElement => {
  return (
    <div style={styles.root}>
       <Box display="flex" flexDirection="column" height="100%">
          <AppBar position="static">
            <Toolbar>
              <Box display="flex" alignItems="center" width="100%">
                <img src="logo_white.png" alt="Logo" width="50" height="50" />
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                  Rectangulator
                </Typography>
                <Box flexGrow={1} />
                <img src="logo_tuw_white.png" alt="Logo" width="40" height="40" />
              </Box>
            </Toolbar>
          </AppBar>
          <Box flexGrow={1} width="100%" p={3}>
            {children}
          </Box>
         {showToolbar && (
          <Toolbar>
            <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
              <Button onClick={onBack}>Back</Button>
              <Typography>Finished in: {elapsed}</Typography>
              <Box>
                <Button onClick={onSaveModel}>Download Model</Button>
                <Button color="primary" variant="contained" onClick={onSaveImage}>Save</Button>
              </Box>
            </Box>
          </Toolbar>
         )}
        </Box>
    </div>
  );
};
