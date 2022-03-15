import Node, { NodeJsonData } from '../node';

export interface SetenceData {
  content: string;
  hasActor: boolean;
  actor?: {
    id: string;
    portrait: string;
    position: string;
  };
}

export interface SentenceNodeJsonData extends NodeJsonData {
  data: SetenceData;
}

export default class SentenceNode extends Node<SetenceData> {
  constructor(data?: any, id?: string) {
    super(data, id);
    if (!data) {
      this.data = {
        content: '',
        hasActor: false,
      };
    }
  }
  get children() {
    return this._children;
  }
  set children(val: Node<any>[]) {
    if (val.length > 1) {
      throw new Error('sentence node children can not have multi');
    }

    // remove origin children parent and assign new one
    this._children.forEach((item) => {
      item.parent = null;
    });

    this._children = val.map((item) => {
      item.parent = this;
      return item;
    });
  }

  public toRenderJson(): SentenceNodeJsonData {
    let baseJson = super.toRenderJson();
    return {
      ...baseJson,
      type: 'sentence',
    };
  }
}
