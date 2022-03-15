import Node, { NodeJsonData } from '.';

export interface RootData {
  title: string;
}


export interface RootNodeJsonData extends NodeJsonData {
  data: {
    title: string;
  },
}

export default class RootNode extends Node<RootData> {
  constructor(data?: any, id?: string) {
    super(data, id);
    if (!data) {
      this.data = {
        title: '',
      };
    }
  }

  public toRenderJson(): RootNodeJsonData {
    let baseJson = super.toRenderJson();
    return {
      ...baseJson,
      type: 'root',
    };
  }
}
