import EventEmitter from "events";

export enum Events {
  updateTitle = 'updateTitle'
}

export function createEventBus() {
  return new EventEmitter<{
    [Events.updateTitle]: [title: string]
  }>()
}
