import {EventPriority} from "./event-priority";
import {EventPeriods} from "./event-periods";
import {Weekday} from "./week-day";
import {DateFormat} from "./date-format";

export interface IEvent {
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  enterDateFormat: DateFormat;
  period: EventPeriods;
  categoryId?: string;
  location?: string;
  priority?: EventPriority;
  reminders?: number[];
  repeatOnDays?: Weekday[];
}
