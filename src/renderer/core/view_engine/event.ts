import Eventemitter from 'eventemitter3';

export enum EventType {
  SHOW_EDID = 'show_edit',
}

const eventemitter = new Eventemitter();

export const showEdit = () => {
  eventemitter.emit(EventType.SHOW_EDID);
};
export const listenEdit = (callback: () => void) => {
  eventemitter.on(EventType.SHOW_EDID, callback);
  return () => eventemitter.off(EventType.SHOW_EDID, callback);
}
