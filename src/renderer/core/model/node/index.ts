import { generateUUID } from '../../..//utils/uuid';
import { Link } from './link';

export interface NodeJsonData {
  id?: string;
  type: string;
  children: NodeJsonData[];
  data: {
    [key: string]: any;
  };
}

class Node<T> {
  protected _parent: Node<T> | null = null;
  protected _children: Node<T>[] = [];
  public id = generateUUID();

  public data: T | null = null;

  protected _links: Link[] = [];

  constructor(data?: T, id?: string) {
    if (data) {
      this.data = data;
    }
    if (id) {
      this.id = id;
    }
  }

  get parent() {
    return this._parent;
  }

  set parent(val: Node<T> | null) {
    this._parent = val;
  }

  get children() {
    return this._children;
  }

  set children(val: Node<any>[]) {
    // remove origin children parent and assign new one
    this._children.forEach((item) => {
      item.parent = null;
    });

    this._children = val.map((item) => {
      item.parent = this;
      return item;
    });

    this._links = val.map((item) => {
      const matchLink = this._links.find(
        (l) => l.source === this && l.target === item
      );
      if (matchLink) {
        return matchLink;
      }
      const instance = this.createLink(item);
      return instance;
    });
  }

  get links(): Link[] {
    return this._links;
  }

  public toRenderJson(): any {
    return {
      id: this.id,
      children: this.children.map((item) => {
        return item.toRenderJson();
      }),
      parentId: this.parent?.id || null,
      data: this.data,
      links: this.links.map((item) => item.toJson()),
    };
  }

  findChildNode(id: string) {
    return this.doFindChildNode(this, id);
  }

  private doFindChildNode(node: Node<any> | null, id: string) {
    if (!node) {
      return null;
    }
    if (node.id === id) {
      return node;
    }

    let res: any = null;
    node.children.forEach((item) => {
      res = res || this.doFindChildNode(item, id);
    });

    return res;
  }

  protected createLink(target: Node<any>): Link {
    const instance = new Link(this, target);
    return instance;
  }

  iterateChildren(callback: (node: Node<any>) => void) {
    this.doIterateChildren(this, callback);
  }

  private doIterateChildren(
    node: Node<any>,
    callback: (val: Node<any>) => void
  ) {
    if (!node) {
      return;
    }

    node.children.forEach((item) => {
      callback(item);
      this.doIterateChildren(item, callback);
    });
  }

  deleteChildNode(id: string) {
    this.iterateChildren((item) => {
      if (item.id === id && item.parent) {
        item.parent.children = item.parent.children.filter(
          (n) => n.id !== item.id
        );
      }
    });
  }
}

export default Node;
