import Node, { NodeJsonData } from '.';

export interface BranchData {
  content: string;
  actors: {
    id: string;
    portrait: {
      id: string;
      pic: string;
    };
  }[];
  actorPosition: 'left' | 'center' | 'right';
}

export interface BranchNodeJsonData extends NodeJsonData {
  data: BranchData;
}

export default class BranchNode extends Node<BranchData> {
  constructor(data?: any, id?: string) {
    super(data, id);
    if (!data) {
      this.data = {
        content: '',
        actors: [],
        actorPosition: 'left',
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
