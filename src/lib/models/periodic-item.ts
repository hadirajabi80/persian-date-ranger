import {EventPeriods} from "./event-periods";
import {DateFormat} from "./date-format";
import {Weekday} from "./week-day";

export interface IPeriodicItem {
  id?: number;
  title: string;
  period: EventPeriods;
  startDate: string;
  endDate?: string;
  enterDateFormat: DateFormat;
  repeatOnDays?: Weekday[];
}
