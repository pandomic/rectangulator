import { contextBridge, ipcRenderer } from 'electron';
import { Solution } from 'highs';

import { LPNewModel } from '@/types';

const exposedApis = {
  optimizeMIPModel: (model: LPNewModel): Promise<Solution> =>
    ipcRenderer.invoke('optimizeMIPModel', model) as Promise<Solution>,
  encodeMIPModel: (model: LPNewModel): Promise<string> =>
    ipcRenderer.invoke('encodeMIPModel', model) as Promise<string>,
  showCSVSelectionDialog: (): Promise<string | undefined> =>
    ipcRenderer.invoke('showCSVSelectionDialog') as Promise<string | undefined>,
};

contextBridge.exposeInMainWorld('IPC', exposedApis);

declare global {
  interface Window {
    IPC: typeof exposedApis,
  }
}
