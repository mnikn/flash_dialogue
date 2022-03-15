import DialogueTreeModel from './model/dialogue_tree';
import { RootNodeJsonData } from './model/node/root';
import ViewProvider from './view_provider';

export interface Config {
  containerId: string;
  viewEngine?: 'svg';
}


export interface DialogueTreeJson {
  roots: RootNodeJsonData[];
}

const DEFAULT_CONFIG: Config = {
  containerId: '',
  viewEngine: 'svg',
};

class DialogueTree {
  public config: Config = DEFAULT_CONFIG;
  private viewProvider: ViewProvider;
  private model: DialogueTreeModel | null = null;

  constructor(config: Config) {
    this.config = { ...this.config, ...config };
    this.viewProvider = new ViewProvider(this);
  }

  public init() {
    this.viewProvider.init();
  }

  public load(data: DialogueTreeJson) {
    this.model = new DialogueTreeModel(data);
    this.viewProvider.render(this.model);
  }
}

export default DialogueTree;
