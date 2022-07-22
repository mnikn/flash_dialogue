import Eventemitter from 'eventemitter3';
import { FileTreeFile, FileTreeFolder } from '../data_provider';

export enum EventType {
  SHOW_EDID = 'show_edit',
  SHOW_DIALOGUE_SETTINGS = 'show_dialogue_settings',
  SAVE_PROJECT = 'save_project',
  NEW_PROJECT = 'new_project',
  OPEN_PROJECT = 'open_project',

  PREVIEW_DIALOGUE_JSON = 'preview_dialogue_json',

  SHOW_SETTINGS = 'show_settings',

  SHOW_NAME_DIALOG = 'show_name_dialog',
}

const eventemitter = new Eventemitter();

export const showEdit = () => {
  eventemitter.emit(EventType.SHOW_EDID);
};
export const listenEdit = (callback: () => void) => {
  eventemitter.on(EventType.SHOW_EDID, callback);
  return () => eventemitter.off(EventType.SHOW_EDID, callback);
};

export const saveProject = () => {
  eventemitter.emit(EventType.SAVE_PROJECT);
};
export const listenSaveProject = (callback: () => void) => {
  eventemitter.on(EventType.SAVE_PROJECT, callback);
  return () => eventemitter.off(EventType.SAVE_PROJECT, callback);
};

export const previewDialogueJson = () => {
  eventemitter.emit(EventType.PREVIEW_DIALOGUE_JSON);
};
export const listenPreviewDialogueJson = (callback: () => void) => {
  eventemitter.on(EventType.PREVIEW_DIALOGUE_JSON, callback);
  return () => eventemitter.off(EventType.PREVIEW_DIALOGUE_JSON, callback);
};

export const showProjectSettings = () => {
  eventemitter.emit(EventType.SHOW_SETTINGS);
};
export const listenShowProjectSettings = (callback: () => void) => {
  eventemitter.on(EventType.SHOW_SETTINGS, callback);
  return () => eventemitter.off(EventType.SHOW_SETTINGS, callback);
};

export const showDialogueSettings = () => {
  eventemitter.emit(EventType.SHOW_DIALOGUE_SETTINGS);
};
export const listenShowDialogueSettings = (callback: () => void) => {
  eventemitter.on(EventType.SHOW_DIALOGUE_SETTINGS, callback);
  return () => eventemitter.off(EventType.SHOW_DIALOGUE_SETTINGS, callback);
};

export const showNameDialog = (data: any) => {
  eventemitter.emit(EventType.SHOW_NAME_DIALOG, data);
};
export const listenShowNameDialog = (
  callback: (arg: {
    sourceData: FileTreeFile | FileTreeFolder | null;
    actionData: 'create_file' | 'create_folder' | 'rename_file' | 'rename_folder';
  }) => void
) => {
  eventemitter.on(EventType.SHOW_NAME_DIALOG, callback);
  return () => eventemitter.off(EventType.SHOW_NAME_DIALOG, callback);
};
