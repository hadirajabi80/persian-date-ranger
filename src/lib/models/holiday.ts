import {IPeriodicItem} from "./periodic-item";

export interface IHoliday extends IPeriodicItem{
  color?: string;
  background?: string;
  description?: string;
}
