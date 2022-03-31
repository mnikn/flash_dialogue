import { DialogueTreeJson } from '..';
import RootNode from './node/root';
import SentenceNode from './node/sentence';
import BranchNode from './node/branch';
import { NodeJsonData } from './node';
import { Link } from './node/link';

export interface Actor {
  id: string;
  name: string;
  protraits: {
    id: string;
    pic: string;
  }[];
}

export interface ProjectSettings {
  actors: Actor[];
  i18n: string[];
}

class DialogueTreeModel {
  public dialogues: RootNode[] = [];
  public projectSettings: ProjectSettings = {
    actors: [],
    i18n: ['en'],
  };

  public i18nData: { [key: string]: string } = {};

  constructor(jsonData: DialogueTreeJson) {
    this.dialogues = jsonData.dialogues.map((item) => {
      const dialogue = this.parseJsonData(item) as RootNode;
      dialogue.iterate((c) => {
        c.links.forEach((l) => {
          if (typeof l.source === 'string') {
            l.source = dialogue.findChildNode(l.source);
          }
          if (typeof l.target === 'string') {
            l.target = dialogue.findChildNode(l.target);
          }
        });
      });
      return dialogue;
    });

    this.projectSettings = {
      ...this.projectSettings,
      ...jsonData.projectSettings,
    };

    this.i18nData = jsonData.i18nData;
  }

  private parseJsonData(node: NodeJsonData) {
    if (node.type === 'root') {
      const json = node;
      const instance = new RootNode();
      instance.children = json.children.map((item: any) => {
        return this.parseJsonData(item);
      });
      if (node.id) {
        instance.id = node.id;
      }
      instance.data = {
        ...instance.data,
        ...(node.data as any),
      };
      instance.links = json.links.map((l) => {
        const lInstance = new Link(l.sourceId, l.targetId);
        lInstance.data = l.data;
        return lInstance;
      });
      return instance;
    }

    const json = node;
    switch (json.type) {
      case 'sentence': {
        const instance = new SentenceNode();
        instance.children = (json.children || []).map((item: any) => {
          return this.parseJsonData(item);
        });
        if (node.id) {
          instance.id = node.id;
        }
        instance.links = json.links.map((l) => {
          const lInstance = new Link(l.sourceId, l.targetId);
          lInstance.data = l.data;
          return lInstance;
        });
        instance.data = {
          ...instance.data,
          ...(json.data as any),
        };
        return instance;
      }
      case 'branch': {
        const instance = new BranchNode();
        instance.children = (json.children || []).map((item: any) => {
          return this.parseJsonData(item);
        });
        if (node.id) {
          instance.id = node.id;
        }
        instance.links = json.links.map((l) => {
          const lInstance = new Link(l.sourceId, l.targetId);
          lInstance.data = l.data;
          return lInstance;
        });
        instance.data = {
          ...instance.data,
          ...(json.data as any),
        };
        return instance;
      }
      default: {
        break;
      }
    }
    return new SentenceNode();
  }

  public toJson(): any {
    return {
      dialogues: this.dialogues.map((item) => {
        return item.toRenderJson();
      }),
      projectSettings: {},
    };
  }
}

export default DialogueTreeModel;
