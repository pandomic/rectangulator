import React from 'react';
import ReactDOM from 'react-dom/client';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import './resources/reset.css';
import './resources/index.css';

import { IndexView } from './components/views';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(<IndexView />);
