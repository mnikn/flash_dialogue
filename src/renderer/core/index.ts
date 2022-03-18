import DataProvider from './data_provider';
import { RootNodeJsonData } from './model/node/root';
import { GlobalSettings } from './view_engine/context';
import ViewProvider from './view_provider';

export interface Config {
  containerId: string;
  viewEngine?: 'svg';
}

export interface DialogueTreeJson {
  dialogues: RootNodeJsonData[];
  projectSettings: GlobalSettings;
}

const DEFAULT_CONFIG: Config = {
  containerId: '',
  viewEngine: 'svg',
};

class DialogueTree {
  public config: Config = DEFAULT_CONFIG;
  public viewProvider: ViewProvider;
  public dataProvider: DataProvider;

  constructor(config: Config) {
    this.config = { ...this.config, ...config };
    this.dataProvider = new DataProvider(this);
    this.viewProvider = new ViewProvider(this);
  }

  public init() {
    this.dataProvider.init();
    this.viewProvider.init();
  }

  public load(data: DialogueTreeJson) {
    this.dataProvider.load(data);
    this.viewProvider.render(this.dataProvider.data);
  }
}

export default DialogueTree;
