import RootNode from '../model/node/root';
import ViewProvider from '../view_provider';
import { render, unmountComponentAtNode } from 'react-dom';
import View from './view';

class ViewEngine {
  protected owner: ViewProvider;
  public rendering: boolean = false;
  constructor(owner: ViewProvider) {
    this.owner = owner;
  }

  public renderDialogue(dialogue: RootNode) {
    if (!this.owner.containerElement) {
      return;
    }
    render(
      <View
        container={this.owner.containerElement}
        dialogue={dialogue}
        owner={this.owner}
      />,
      this.owner.containerElement
    );
    this.rendering = true;
  }

  public stop() {
    unmountComponentAtNode(this.owner.containerElement as HTMLDivElement);
    this.rendering = false;
  }
}

export default ViewEngine;
