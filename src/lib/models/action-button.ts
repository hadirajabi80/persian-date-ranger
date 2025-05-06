import {ActionButtonType} from "./action-button-type";
import {IPeriodicItem} from "./periodic-item";

export interface IActionButton extends IPeriodicItem {
  type: ActionButtonType;
  color?: string;
  size?: string;
  class?:string;
}
