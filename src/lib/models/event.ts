import {EventPriority} from "./event-priority";
import {IPeriodicItem} from "./periodic-item";

export interface IEvent extends IPeriodicItem {
  description?: string;
  categoryName?: string;
  location?: string;
  priority?: EventPriority;
  reminders?: number[];
}
