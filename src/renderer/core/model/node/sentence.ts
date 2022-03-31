import Node, { NodeJsonData } from '.';
import { Link } from './link';
import { generateUUID } from '../../../utils/uuid';

export interface SentenceData {
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

export interface SentenceNodeJsonData extends NodeJsonData {
  data: SentenceData;
}

export default class SentenceNode extends Node<SentenceData> {
  constructor(data?: any, id?: string) {
    super(data, id);
    if (!data) {
      this.data = {
        content: `sentence_content_${generateUUID()}`,
        actors: [],
        actorPosition: 'left',
      };
    }
  }

  protected createLink(target: Node<any>): Link {
    const instance = new Link(this, target);
    instance.data = {
      transferFlags: [],
    };
    return instance;
  }

  public toRenderJson(): SentenceNodeJsonData {
    const baseJson = super.toRenderJson();
    return {
      ...baseJson,
      type: 'sentence',
    };
  }
}
