import { Actions } from "./config";

export interface IProps {
  mod: boolean;
  setAction: (action: Actions) => void;
  // actionLoading: boolean;
  showToast: (text: string) => void;
  customize: () => void;
  download: () => void;
}

export interface IConfigs {
  mods: string[];
}
