import { ElectronAPI } from "@electron-toolkit/preload";
import { Notification } from "electron";

declare global {
  type _ElectronAPI = ElectronAPI

  class _Notification extends Notification {}
}
