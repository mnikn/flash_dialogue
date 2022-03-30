import Node, { NodeJsonData } from '.';
import { Link } from './link';
import { generateUUID } from '../../../utils/uuid';

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
        content: `branch_content_${generateUUID()}`,
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

  protected createLink(target: Node<any>): Link {
    const instance = new Link(this, target);
    instance.data = {
      optionName: `option_name_${generateUUID()}`,
      optionId: '',
      hiddenOptionFlags: [],
      disableOptionFlags: [],
    };
    return instance;
  }
}
