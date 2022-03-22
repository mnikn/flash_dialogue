import Node from '.';

export interface LinkData {
  [key: string]: any;
}

export interface NodeLinkJsonData {
  sourceId: string | null;
  targetId: string | null;
  data: LinkData;
}

export class Link {
  public source: Node<any> | string | null = null;
  public target: Node<any> | string | null = null;
  public data: LinkData = {};

  constructor(
    source: Node<any> | string | null,
    target: Node<any> | string | null
  ) {
    this.source = source;
    this.target = target;
  }

  toJson(): NodeLinkJsonData {
    let sourceId: string | null = null;
    if (this.source instanceof Node) {
      sourceId = (this.source as Node<any>).id;
    } else {
      sourceId = this.source;
    }

    let targetId: string | null = null;
    if (this.target instanceof Node) {
      targetId = (this.target as Node<any>).id;
    } else {
      targetId = this.target;
    }
    return {
      sourceId: sourceId,
      targetId: targetId,
      data: this.data,
    };
  }
}
