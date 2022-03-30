import DataProvider from './data_provider';
import { ProjectSettings } from './model/dialogue_tree';
import { RootNodeJsonData } from './model/node/root';
import ViewProvider from './view_provider';

export interface Config {
  containerId: string;
  viewEngine?: 'svg';
}

export interface DialogueTreeJson {
  dialogues: RootNodeJsonData[];
  projectSettings: ProjectSettings;
  i18nData: { [key: string]: string };
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

  public async load(data?: DialogueTreeJson) {
    console.log(data);
    await this.dataProvider.load();
    this.viewProvider.render(this.dataProvider.data);
  }
}

export default DialogueTree;
