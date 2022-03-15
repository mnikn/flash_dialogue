import { createLogger } from '../utils/logger';
import DialogueTree from '.';
import DialogueTreeModel from './model/dialogue_tree';
import ViewEngine from './view_engine';

const logger = createLogger('view-provider');
class ViewProvider {
  private owner: DialogueTree;
  private viewEngine: ViewEngine;

  constructor(owner: DialogueTree) {
    this.owner = owner;
    this.viewEngine = new ViewEngine(this);
  }

  public init() {
    logger.log('init');
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
    model.roots.forEach((root) => {
      this.viewEngine.renderRoot(root);
    });
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
}

export default ViewProvider;
