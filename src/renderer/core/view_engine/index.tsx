import RootNode from '../model/node/root';
import ViewProvider from '../view_provider';
import { render } from 'react-dom';
import View from './view';

class ViewEngine {
  protected owner: ViewProvider;
  constructor(owner: ViewProvider) {
    this.owner = owner;
  }

  public renderRoot(root: RootNode) {
    if (!this.owner.containerElement) {
      return;
    }
    render(
      <View container={this.owner.containerElement} rootNode={root} />,
      this.owner.containerElement
    );
  }
}

export default ViewEngine;
