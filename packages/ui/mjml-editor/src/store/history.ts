import type { TemplateDoc } from "../schema/types";

export interface HistoryState {
  history: string[];
  future: string[];
}

const serialize = (doc: TemplateDoc) => JSON.stringify(doc);

export const pushHistory = (state: HistoryState, doc: TemplateDoc) => {
  const next = serialize(doc);
  return {
    history: [...state.history, next].slice(-100),
    future: [],
  };
};

export const undoHistory = (state: HistoryState, current: TemplateDoc) => {
  if (state.history.length === 0) {
    return null;
  }
  const previous = state.history[state.history.length - 1];
  return {
    doc: JSON.parse(previous) as TemplateDoc,
    history: state.history.slice(0, -1),
    future: [serialize(current), ...state.future].slice(0, 100),
  };
};

export const redoHistory = (state: HistoryState, current: TemplateDoc) => {
  if (state.future.length === 0) {
    return null;
  }
  const next = state.future[0];
  return {
    doc: JSON.parse(next) as TemplateDoc,
    history: [...state.history, serialize(current)].slice(-100),
    future: state.future.slice(1),
  };
};
