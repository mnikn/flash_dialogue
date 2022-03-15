import Node, { NodeJsonData } from '.';

export interface BranchData {
  content: string;
}

export interface BranchNodeJsonData extends NodeJsonData {
  data: {
    content: string;
  };
}

export default class BranchNode extends Node<BranchData> {
  constructor(data?: any, id?: string) {
    super(data, id);
    if (!data) {
      this.data = {
        content: '',
      };
    }
  }

  public toRenderJson(): BranchNodeJsonData {
    let baseJson = super.toRenderJson();
    return {
      ...baseJson,
      type: 'branch',
    };
  }
}
