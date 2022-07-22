import Eventemitter from 'eventemitter3';
import DialogueTree from '.';
import { createLogger } from '../utils/logger';
import DialogueTreeModel from './model/dialogue_tree';
import Node from './model/node';
import RootNode from './model/node/root';
import ViewEngine from './view_engine';

interface DragTarget {
  node: Node<any>;
  type: 'child' | 'parent';
}

const logger = createLogger('view-provider');
class ViewProvider {
  public owner: DialogueTree;
  private viewEngine: ViewEngine;

  private _editing: boolean = false;

  private _selectingNode: Node<any> | null = null;

  private _draging: boolean = false;

  private _dragTarget: DragTarget | null = null;

  private _zoom: number = 1;

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

    this.viewEngine.renderDialogue(
      this.owner.dataProvider.currentDialogue || new RootNode()
    );
    // if (model.dialogues.length > 0) {
    //   this.viewEngine.renderDialogue(model.dialogues[0]);
    // }
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

  get draging(): boolean {
    return this._draging;
  }

  set draging(val: boolean) {
    if (this._draging !== val) {
      this.event.emit('change:draging', val);
    }
    this._draging = val;
  }

  get dragTarget(): DragTarget | null {
    return this._dragTarget;
  }

  set dragTarget(val: DragTarget | null) {
    if (this._dragTarget !== val) {
      this.event.emit('change:dragTarget', val);
    }
    this._dragTarget = val;
  }

  get zoom(): number {
    return this._zoom;
  }

  set zoom(val: number) {
    if (this._zoom !== val) {
      this.event.emit('change:zoom', val);
    }
    this._zoom = val;
  }
}

export default ViewProvider;
