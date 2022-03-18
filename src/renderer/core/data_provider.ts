import Eventemitter from 'eventemitter3';
import { RECENT_FILE_PATH } from 'renderer/constants/storage';
import DialogueTree, { DialogueTreeJson } from '.';
import { createLogger } from '../utils/logger';
import DialogueTreeModel from './model/dialogue_tree';
import RootNode from './model/node/root';
const logger = createLogger('data-provider');

class DataProvider {
  private owner: DialogueTree;

  private _currentDialogue: RootNode | null = null;

  public event = new Eventemitter();

  public data: DialogueTreeModel = new DialogueTreeModel({
    dialogues: [],
    projectSettings: {
      actors: [],
    },
  });

  constructor(owner: DialogueTree) {
    this.owner = owner;
    this.save = this.save.bind(this);
  }

  get currentDialogue(): RootNode | null {
    return this._currentDialogue;
  }

  set currentDialogue(val: RootNode | null) {
    if (this._currentDialogue !== val) {
      this.event.emit('change:currentDialogue', val);
    }
    this._currentDialogue = val;

    if (val) {
      const i = this.data.dialogues.findIndex((item) => item.id === val?.id);
      this.data.dialogues[i] = val;
    }
  }

  public init() {
    logger.log('init');
    window.electron.ipcRenderer.on('saveFile', this.save);
  }

  public load(data: DialogueTreeJson) {
    this.data = new DialogueTreeModel(data);
    this.currentDialogue = this.data.dialogues[0];
  }

  public async save() {
    window.electron.ipcRenderer
      .saveJsonFile({
        data: JSON.stringify(this.data?.toJson(), null, 2),
      })
      .then((res: any) => {
        if (res.path) {
          localStorage.setItem(RECENT_FILE_PATH, res.path);
        }
      });
  }

  public async createNewDialogue() {
    const newDialogue = new RootNode();
    this.data.dialogues.push(newDialogue);

    newDialogue.data = {
      title: `Dialogue ${this.data.dialogues.length}`,
    };
    this.currentDialogue = newDialogue;
  }
}

export default DataProvider;
