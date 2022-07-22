import csv from 'csvtojson';
import Eventemitter from 'eventemitter3';
import { parse } from 'json2csv';
import {
  RECENT_DIALOGUE_PATH,
  RECENT_PROJECT_PATH,
} from 'renderer/constants/storage';
import DialogueTree, { DialogueTreeJson } from '.';
import { createLogger } from '../utils/logger';
import DialogueTreeModel, {
  parseDialogueJsonData,
} from './model/dialogue_tree';
import RootNode from './model/node/root';

export interface FileTreeFolder {
  type: 'folder';
  partName: string;
  currentPath: string;
  children: (FileTreeFile | FileTreeFolder)[];
}

export interface FileTreeFile {
  type: 'file';
  partName: string;
  currentPath: string | null;
}

function iterFileNode(
  node: FileTreeFolder | FileTreeFile,
  fn: (val: FileTreeFolder | FileTreeFile) => void
) {
  if (!node) {
    return;
  }

  fn(node);
  if (node.type === 'folder') {
    node.children.forEach((n) => iterFileNode(n, fn));
  }
}

function findFileInTree(
  tree: FileTreeFolder | FileTreeFile,
  path: string
): FileTreeFile | null {
  if (tree.type === 'file') {
    if (tree.currentPath === path) {
      return tree;
    }
    return null;
  }
  if (tree.type === 'folder') {
    return tree.children.reduce(
      (res: FileTreeFile | null, t) => res || findFileInTree(t, path),
      null
    );
  }
  return null;
}

const logger = createLogger('data-provider');

class DataProvider {
  private owner: DialogueTree;

  private _currentDialogue: RootNode | null = null;

  private _projectTree: FileTreeFolder = {
    type: 'folder',
    partName: '',
    currentPath: '',
    children: [],
  };
  private _recentOpenFiles: FileTreeFile[] = [];

  private _currentDialogueFile: FileTreeFile | null = null;

  private _currentLang: string = 'en';

  public event = new Eventemitter();

  public data: DialogueTreeModel = new DialogueTreeModel({
    dialogues: [],
    i18nData: [],
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

  get recentOpenFiles(): FileTreeFile[] {
    return this._recentOpenFiles;
  }

  set recentOpenFiles(val: FileTreeFile[]) {
    this._recentOpenFiles = val;
    this.event.emit('change:recentOpenFiles', val);
  }

  get projectTree(): FileTreeFolder {
    return this._projectTree;
  }

  set projectTree(val: FileTreeFolder) {
    this._projectTree = val;
    this.event.emit('change:projectTree', val);
  }

  get currentDialogueFile(): FileTreeFile | null {
    return this._currentDialogueFile;
  }

  set currentDialogueFile(val: FileTreeFile | null) {
    this._currentDialogueFile = val;
    this.event.emit('change:currentDialogueFile', val);
    if (val !== null) {
      localStorage.setItem(RECENT_DIALOGUE_PATH, val.currentPath || '');
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
      this.data = await this.getProjectData(projectPath || '');

      if (localStorage.getItem(RECENT_DIALOGUE_PATH)) {
        await this.loadDialouge(localStorage.getItem(RECENT_DIALOGUE_PATH));
      }
    }
    // this.currentDialogue = this.data.dialogues[0];
  }

  public async loadDialouge(path: string) {
    const projectPath = localStorage.getItem(RECENT_PROJECT_PATH);
    const res = await window.electron.ipcRenderer.call('readFile', {
      path: projectPath + '\\' + path,
    });
    if (res.res) {
      this.currentDialogueFile = findFileInTree(this.projectTree, path);

      localStorage.setItem(RECENT_DIALOGUE_PATH, path);
      const instance = parseDialogueJsonData(JSON.parse(res.res));
      this.currentDialogue = instance;
      this.currentDialogueFile = findFileInTree(this.projectTree, path);
    }
    console.log(res);
  }

  public async getProjectData(projectPath: string): Promise<DialogueTreeModel> {
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

    const folderRes = await window.electron.ipcRenderer.call(
      'readFolderRecursive',
      {
        path: projectPath,
        extensions: ['.fd'],
      }
    );
    this.projectTree = folderRes.res;
    iterFileNode(this.projectTree, (v: any) => {
      v.expanded = true;
    });

    // const dialogueFolder = `${projectPath}\\dialogues`;
    // const files = await window.electron.ipcRenderer.readFolder({
    //   path: dialogueFolder,
    // });

    // for (const f of files) {
    //   const path = `${dialogueFolder}\\${f}`;
    //   const dialogueDataRes = await window.electron.ipcRenderer.readJsonFile({
    //     path,
    //   });
    //   plainData.dialogues.push(JSON.parse(dialogueDataRes.res));
    // }
    // if (plainData.dialogues.length <= 0) {
    //   plainData.dialogues.push(
    //     new RootNode({
    //       title: 'Dialogue 1',
    //     }).toRenderJson()
    //   );
    // }

    logger.log('start load translations');
    const translationFilePath = `${projectPath}\\translation.csv`;
    const readFileRes = await window.electron.ipcRenderer.call('readFile', {
      path: translationFilePath,
    });
    const translations: any = {};
    if (readFileRes.res) {
      const str = await csv({
        output: 'csv',
      }).fromString(readFileRes.res);
      str.forEach((s, i) => {
        s.forEach((s2, j) => {
          if (j === 0) {
            translations[s2] = {};
          } else {
            translations[s[0]][plainData.projectSettings.i18n[j - 1]] = s2;
          }
        });
      });
      plainData.i18nData = translations;
    }
    logger.log('load translations end');

    return new DialogueTreeModel(plainData);
  }

  public async save() {
    this._saving = true;

    let projectPath = localStorage.getItem(RECENT_PROJECT_PATH);
    if (!projectPath) {
      const res = await window.electron.ipcRenderer.selectFolder();
      if (!res) {
        this._saving = false;
        return;
      }
      localStorage.setItem(RECENT_PROJECT_PATH, res[0]);
      projectPath = res[0];
    }

    const settingPath = `${projectPath}\\settings.json`;
    await window.electron.ipcRenderer.saveJsonFile({
      data: JSON.stringify(this.data.projectSettings, null, 2),
      path: settingPath,
    });

    if (this.currentDialogueFile && this.currentDialogue) {
      await window.electron.ipcRenderer.call('saveFile', {
        path: `${projectPath}\\${this.currentDialogueFile.currentPath}`,
        data: JSON.stringify(this.currentDialogue.toRenderJson(), null, 2),
      });
    }
    // const dialogueFolder = `${projectPath}\\dialogues`;
    // await window.electron.ipcRenderer.deleteFolderFiles({
    //   path: dialogueFolder,
    // });
    // this.data.dialogues.forEach(async (dialogue) => {
    //   const path = `${dialogueFolder}\\dialogue_${dialogue.data?.title}.json`;
    //   await window.electron.ipcRenderer.saveJsonFile({
    //     data: JSON.stringify(dialogue.toRenderJson(), null, 2),
    //     path: path,
    //   });
    // });

    const options = { fields: ['__id', ...this.data.projectSettings.i18n] };

    const data: any[] = [];
    Object.keys(this.data.i18nData).forEach((key) => {
      data.push({
        __id: key,
        ...this.data.i18nData[key],
      });
    });
    const storeData = parse(data, options);
    const translationFilePath = `${projectPath}\\translation.csv`;
    await window.electron.ipcRenderer.call('saveFile', {
      path: translationFilePath,
      data: storeData,
    });

    this._saving = false;
  }

  public async createNewDialogue(name: string, folder?: FileTreeFolder) {
    const projectPath = localStorage.getItem(RECENT_PROJECT_PATH);
    const newDialogue = new RootNode();
    this.data.dialogues.push(newDialogue);

    newDialogue.data = {
      title: `Dialogue ${this.data.dialogues.length}`,
    };
    this.currentDialogue = newDialogue;

    const newFile: FileTreeFile = {
      type: 'file',
      partName: name + '.fd',
      currentPath: folder
        ? folder.currentPath + '\\' + name + '.fd'
        : name + '.fd',
    };
    await window.electron.ipcRenderer.call('saveFile', {
      path: projectPath + '\\' + newFile.currentPath,
      data: JSON.stringify(newDialogue.toRenderJson(), null, 2),
    });
    if (folder) {
      folder.children.push(newFile);
    } else {
      this.projectTree.children.push(newFile);
    }

    this.projectTree = { ...this.projectTree };
    this.currentDialogueFile = newFile;
  }

  get saving(): boolean {
    return this._saving;
  }
}

export default DataProvider;
