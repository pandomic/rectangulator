import { CSSProperties, ReactElement, ReactNode } from 'react';
import { Box, AppBar, Toolbar, Typography } from '@mui/material';

const styles: Record<string, CSSProperties> = {
  root: {
    width: '100%',
    height: '100%',
  },
  svg: {
    width: '100%',
    height: '100%',
  },
};

export interface HomeLayoutProps {
  children: ReactNode;
}

export const HomeLayout = ({ children }: HomeLayoutProps): ReactElement => {
  return (
    <div style={styles.root}>
       <Box display="flex" flexDirection="column">
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
        </Box>
    </div>
  );
};
