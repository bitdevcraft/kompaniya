"use client";

import type { UniqueIdentifier } from "@dnd-kit/core";

import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";

export type EmailUIStore = {
  activeId: UniqueIdentifier | "";
  selectionIds: UniqueIdentifier[];
  hoverActiveId: UniqueIdentifier | "";
  dragActiveId: UniqueIdentifier | "";
  setActiveId: (id: UniqueIdentifier | "") => void;
  setSelectionIds: (ids: UniqueIdentifier[]) => void;
  setHoverActiveId: (id: UniqueIdentifier | "") => void;
  setDragActiveId: (id: UniqueIdentifier | "") => void;
  resetInteraction: () => void;
};

const devtoolsOptions = {
  name: "EmailUIStore",
  enabled: process.env.NODE_ENV === "development",
};

export const useEmailUIStore = create<EmailUIStore>()(
  devtools(
    subscribeWithSelector((set) => ({
      activeId: "",
      selectionIds: [],
      hoverActiveId: "",
      dragActiveId: "",
      setActiveId: (id) =>
        set(() => ({
          activeId: id,
          selectionIds: id ? [id] : [],
        })),
      setSelectionIds: (ids) =>
        set(() => ({
          selectionIds: ids,
          activeId: ids[0] ?? "",
        })),
      setHoverActiveId: (id) =>
        set(() => ({
          hoverActiveId: id,
        })),
      setDragActiveId: (id) =>
        set(() => ({
          dragActiveId: id,
        })),
      resetInteraction: () =>
        set(() => ({
          activeId: "",
          selectionIds: [],
          hoverActiveId: "",
          dragActiveId: "",
        })),
    })),
    devtoolsOptions,
  ),
);
