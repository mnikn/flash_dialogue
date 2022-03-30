import Node, { NodeJsonData } from '../node';
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
  // get children() {
  //   return this._children;
  // }
  // set children(val: Node<any>[]) {
  //   if (val.length > 1) {
  //     throw new Error('sentence node children can not have multi');
  //   }

  //   // remove origin children parent and assign new one
  //   this._children.forEach((item) => {
  //     item.parent = null;
  //   });

  //   this._children = val.map((item) => {
  //     item.parent = this;
  //     return item;
  //   });
  // }

  protected createLink(target: Node<any>): Link {
    const instance = new Link(this, target);
    instance.data = {
      transferFlags: [],
    };
    return instance;
  }

  public toRenderJson(): SentenceNodeJsonData {
    let baseJson = super.toRenderJson();
    return {
      ...baseJson,
      type: 'sentence',
    };
  }
}
