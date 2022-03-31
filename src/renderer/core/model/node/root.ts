import Node, { NodeJsonData } from '.';
import { Link } from './link';

export interface RootData {
  title: string;
}

export interface RootNodeJsonData extends NodeJsonData {
  data: {
    title: string;
  };
}

export default class RootNode extends Node<RootData> {
  constructor(data?: RootData, id?: string) {
    super(data, id);
    if (!data) {
      this.data = {
        title: '',
      };
    }
  }

  public toRenderJson(): RootNodeJsonData {
    const baseJson = super.toRenderJson();
    return {
      ...baseJson,
      type: 'root',
    };
  }

  protected createLink(target: Node<any>): Link {
    const instance = new Link(this, target);
    instance.data = {
      transferFlags: [],
    };
    return instance;
  }
}
