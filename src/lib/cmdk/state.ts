import type { Mode } from "./types";

export interface CmdkState {
  mode: Mode;
  isOpen: boolean;
  selectedIndex: number;
  query: string;
  visibleCount: number;
}

const state: CmdkState = {
  mode: "command",
  isOpen: false,
  selectedIndex: 0,
  query: "",
  visibleCount: 0,
};

export function getState(): CmdkState {
  return state;
}

export function setMode(mode: Mode): void {
  state.mode = mode;
  state.selectedIndex = 0;
  state.query = "";
}

export function resetForOpen(): void {
  state.selectedIndex = 0;
  state.query = "";
}
