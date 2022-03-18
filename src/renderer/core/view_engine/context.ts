import { createContext } from 'react';
import ViewProvider from '../view_provider';

export interface Actor {
  id: string;
  name: string;
  protraits: {
    id: string;
    pic: string;
  }[];
}

export interface GlobalSettings {
  actors: Actor[];
}

export interface Context {
  globalSettings: GlobalSettings;
  owner: ViewProvider | null;
}
const context = createContext<Context>({
  globalSettings: {
    actors: [],
  },
  owner: null,
});

export default context;
