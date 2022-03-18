import Node from '.';

export interface LinkData {
  [key: string]: any;
}

export class Link {
  public source: Node<any> | null = null;
  public target: Node<any> | null = null;
  public data: LinkData = {};

  constructor(source: Node<any> | null, target: Node<any> | null) {
    this.source = source;
    this.target = target;
  }

  toJson(): any {
    return {
      sourceId: this.source?.id || null,
      targetId: this.target?.id || null,
      data: this.data,
    };
  }
}
