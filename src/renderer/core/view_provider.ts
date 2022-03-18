import Eventemitter from 'eventemitter3';
import { createLogger } from '../utils/logger';
import DialogueTree from '.';
import DialogueTreeModel from './model/dialogue_tree';
import ViewEngine from './view_engine';
import RootNode from './model/node/root';
import Node from './model/node';

const logger = createLogger('view-provider');
class ViewProvider {
  public owner: DialogueTree;
  private viewEngine: ViewEngine;

  private _editing: boolean = false;

  private _selectingNode: Node<any> | null = null;

  public event = new Eventemitter();

  constructor(owner: DialogueTree) {
    this.owner = owner;
    this.viewEngine = new ViewEngine(this);
  }

  public init() {
    logger.log('init');
    this.owner.dataProvider.event.on('change:currentDialogue', (val) => {
      if (!this.viewEngine.rendering) {
        return;
      }

      if (val) {
        this.viewEngine.stop();
        this.viewEngine.renderDialogue(val);
      }
    });
  }

  public render(model: DialogueTreeModel) {
    logger.log('start render');

    const containerElement = document.querySelector(
      `#${this.owner.config.containerId}`
    ) as HTMLElement;
    if (!containerElement) {
      logger.error('container element not found!');
      return;
    }
    // model.dialogues.forEach((dialogue) => {
    //   this.viewEngine.renderDialogue(dialogue);
    // });

    if (model.dialogues.length > 0) {
      this.viewEngine.renderDialogue(model.dialogues[0]);
    }
  }

  get containerElement(): HTMLDivElement | null {
    const containerElement = document.querySelector(
      `#${this.owner.config.containerId}`
    ) as HTMLDivElement;
    if (!containerElement) {
      logger.error('container element not found!');
    }
    return containerElement || null;
  }

  get editing(): boolean {
    return this._editing;
  }

  set editing(val: boolean) {
    if (this._editing !== val) {
      this.event.emit('change:editing', val);
    }
    this._editing = val;
  }

  get selectingNode(): Node<any> | null {
    return this._selectingNode;
  }

  set selectingNode(val: Node<any> | null) {
    if (this._selectingNode !== val) {
      this.event.emit('change:selectingNode', val);
    }
    this._selectingNode = val;
  }
}

export default ViewProvider;
