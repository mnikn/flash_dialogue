import Eventemitter from 'eventemitter3';
import { RECENT_PROJECT_PATH } from 'renderer/constants/storage';
import DialogueTree, { DialogueTreeJson } from '.';
import { createLogger } from '../utils/logger';
import DialogueTreeModel from './model/dialogue_tree';
import RootNode from './model/node/root';

const logger = createLogger('data-provider');

class DataProvider {
  private owner: DialogueTree;

  private _currentDialogue: RootNode | null = null;

  private _currentLang: string = 'en';

  public event = new Eventemitter();

  public data: DialogueTreeModel = new DialogueTreeModel({
    dialogues: [],
    projectSettings: {
      actors: [],
      i18n: ['en'],
    },
  });

  private _saving = false;

  constructor(owner: DialogueTree) {
    this.owner = owner;
    this.save = this.save.bind(this);
  }

  get currentDialogue(): RootNode | null {
    return this._currentDialogue;
  }

  set currentDialogue(val: RootNode | null) {
    if (this._currentDialogue?.id !== val?.id) {
      this.event.emit('change:currentDialogue', val);
    }
    this._currentDialogue = val;

    if (val) {
      const i = this.data.dialogues.findIndex((item) => item.id === val?.id);
      this.data.dialogues[i] = val;
    }
  }

  get currentLang(): string {
    return this._currentLang;
  }

  set currentLang(val: string) {
    if (this._currentLang !== val) {
      this._currentLang = val;
      this.event.emit('change:currentLang', val);
    }
  }

  public init() {
    logger.log('init');
    // window.electron.ipcRenderer.on('saveFile', this.save);
  }

  public async load(data?: DialogueTreeJson) {
    if (data) {
      this.data = new DialogueTreeModel(data);
    } else {
      // get data from recent project
      const projectPath = localStorage.getItem(RECENT_PROJECT_PATH);
      const settingPath = `${projectPath}\\settings.json`;
      const res = await window.electron.ipcRenderer.readJsonFile({
        path: settingPath,
      });

      const plainData: DialogueTreeJson = {
        dialogues: [],
        projectSettings: {
          actors: [],
          i18n: [],
        },
        i18nData: {},
      };
      plainData.projectSettings = JSON.parse(res.res);

      const dialogueFolder = `${projectPath}\\dialogues`;
      const files = await window.electron.ipcRenderer.readFolder({
        path: dialogueFolder,
      });

      for (const f of files) {
        const path = `${dialogueFolder}\\${f}`;
        const dialogueDataRes = await window.electron.ipcRenderer.readJsonFile({
          path,
        });
        plainData.dialogues.push(JSON.parse(dialogueDataRes.res));
      }
      if (plainData.dialogues.length <= 0) {
        plainData.dialogues.push(
          new RootNode({
            title: 'Dialogue 1',
          }).toRenderJson()
        );
      }

      const i18nFolder = `${projectPath}\\i18n`;
      const i18nFiles = await window.electron.ipcRenderer.readFolder({
        path: i18nFolder,
      });
      for (const f of i18nFiles) {
        const path = `${i18nFolder}\\${f}`;
        const i18nDataRes = await window.electron.ipcRenderer.readJsonFile({
          path,
        });

        const lang = f.split('.')[0];
        plainData.i18nData[lang] = JSON.parse(i18nDataRes.res);
      }

      this.data = new DialogueTreeModel(plainData);
    }

    this.currentDialogue = this.data.dialogues[0];
  }

  public async save() {
    this._saving = true;

    let projectPath = localStorage.getItem(RECENT_PROJECT_PATH);
    if (!projectPath) {
      const res = await window.electron.ipcRenderer.selectFolder();
      localStorage.setItem(RECENT_PROJECT_PATH, res[0]);
      projectPath = res[0];
    }

    const settingPath = `${projectPath}\\settings.json`;
    await window.electron.ipcRenderer.saveJsonFile({
      data: JSON.stringify(this.data.projectSettings, null, 2),
      path: settingPath,
    });

    const dialogueFolder = `${projectPath}\\dialogues`;

    await window.electron.ipcRenderer.deleteFolderFiles({
      path: dialogueFolder,
    });
    this.data.dialogues.forEach(async (dialogue) => {
      const path = `${dialogueFolder}\\dialogue_${dialogue.data?.title}.json`;
      await window.electron.ipcRenderer.saveJsonFile({
        data: JSON.stringify(dialogue.toRenderJson(), null, 2),
        path: path,
      });
    });

    const i18nFolder = `${projectPath}\\i18n`;
    await window.electron.ipcRenderer.deleteFolderFiles({
      path: i18nFolder,
    });
    this.data.projectSettings.i18n.forEach(async (item) => {
      const path = `${i18nFolder}\\${item}.json`;
      await window.electron.ipcRenderer.saveJsonFile({
        data: JSON.stringify(this.data.i18nData[item] || {}, null, 2),
        path: path,
      });
    });

    this._saving = false;
  }

  public async createNewDialogue() {
    const newDialogue = new RootNode();
    this.data.dialogues.push(newDialogue);

    newDialogue.data = {
      title: `Dialogue ${this.data.dialogues.length}`,
    };
    this.currentDialogue = newDialogue;
  }

  get saving(): boolean {
    return this._saving;
  }
}

export default DataProvider;
