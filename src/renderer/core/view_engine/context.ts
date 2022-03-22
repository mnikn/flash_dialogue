import { createContext } from 'react';
import ViewProvider from '../view_provider';

export interface Context {
  owner: ViewProvider | null;
}
const context = createContext<Context>({
  owner: null,
});

export default context;
