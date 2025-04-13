import {
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import moment, {Moment} from "moment";
import {DateFormat} from "../models/date-format";
import {Subject} from "rxjs";

@Component({
  selector: 'gregorian-date-calendar',
  templateUrl: './gregorian-date-calendar.component.html',
  styleUrls: ['./gregorian-date-calendar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GregorianDateCalendarComponent implements OnInit, OnChanges {

  @Input() showNearMonthDays: boolean = true;
  @Input() showGotoToday: boolean = true;
  @Input() enableChangeMonth: boolean = true;
  @Input() enableChangeYear: boolean = true;
  @Input() enableNavigateMonth: boolean = true;
  @Input() enableNavigateYear: boolean = true;
  @Input() currentMonthShadow: boolean = false;
  @Input() closeOnSelectDate: boolean = false;
  @Input() rangePicker: boolean = false;
  @Input() startDate: any;
  @Input() endDate: any;
  @Input() showCurrentDate: boolean = false;
  @Input() holidays: { format: string, date: any[] } | undefined;

  @Input() minDate: string;
  @Input() maxDate: string;

  @Input() selectedYear: number = Number(moment().year());
  @Input() selectedMonth: number = Number(moment().month());
  @Input() selectedDay: number = Number(moment().date());

  @Input() calendarMode: boolean = false;
  @Input() datePickerMode: boolean = false;
  @Input() dateFormat: DateFormat = "YYYY/MM/DD";
  @Input() defaultValue: boolean = false;

  @Input() datesBetween: string[] = [];

  @Output() showDateValue: EventEmitter<string> = new EventEmitter<string>();

  currentMonth: number = Number(moment().month());

  weekDaysTitles: { index: number, title: string }[] = [
    { index: 0, title: 'Su' },
    { index: 1, title: 'Mo' },
    { index: 2, title: 'Tu' },
    { index: 3, title: 'We' },
    { index: 4, title: 'Th' },
    { index: 5, title: 'Fr' },
    { index: 6, title: 'Sa' }
  ];
  daysOfWeek: any[] = [];

  shownYear: number = this.selectedYear;
  shownMonth: number = this.selectedMonth;
  shownDay: number = this.selectedDay;

  showYears: boolean = false;
  showMonths: boolean = false;
  showDatePicker: boolean = true;
  selectedMonthTitle: string = '';

  inputYear: number = this.selectedYear;

  private hoverSubject = new Subject<void>();
  hoveredDay: number | null = null;
  hoveredMonth: number | null = null;
  hoveredYear: number | null = null;

  monthsTitles: {fullName: string, shortName: string}[] = [
    { fullName: 'January', shortName: 'Jan' },
    { fullName: 'February', shortName: 'Feb' },
    { fullName: 'March', shortName: 'Mar' },
    { fullName: 'April', shortName: 'Apr' },
    { fullName: 'May', shortName: 'May' },
    { fullName: 'June', shortName: 'Jun' },
    { fullName: 'July', shortName: 'Jul' },
    { fullName: 'August', shortName: 'Aug' },
    { fullName: 'September', shortName: 'Sep' },
    { fullName: 'October', shortName: 'Oct' },
    { fullName: 'November', shortName: 'Nov' },
    { fullName: 'December', shortName: 'Dec' }
  ];

  weeks: any[] = [];
  regex = /^(1[0-4]\d{2})[\/-]?(0[1-9]|1[0-2])[\/-]?(0[1-9]|[12]\d|3[01])$/;

  constructor(private cd: ChangeDetectorRef) {
    if (this.rangePicker) {
      this.hoverSubject.subscribe(() => {
        this.onHoverAction();
      });
    }
  }

  ngOnInit() {
    this.inputYear = this.selectedYear;
    this.initWeekTitles();
    this.selectMonth(this.shownMonth);
    this.emitSelectedDate(this.defaultValue);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['holidays'] && changes['holidays'].currentValue) {
      this.holidays = changes['holidays'].currentValue;
      this.selectMonth(this.shownMonth);
    }

    if (changes['selectedMonth'] && changes['selectedMonth'].currentValue !== undefined) {
      this.selectMonth(changes['selectedMonth'].currentValue);
    }

    if (changes['selectedYear'] && changes['selectedYear'].currentValue !== undefined) {
      this.shownYear = changes['selectedYear'].currentValue;
      this.selectYear(this.shownYear);
    }

    if (changes['minDate'] && changes['minDate'].currentValue) {
      this.minDate = changes['minDate'].currentValue;
      let parsedDate;
      if (this.dateFormat === 'timestamp') {
        parsedDate = moment(this.minDate).valueOf();
      } else {
        parsedDate = moment(this.minDate, this.dateFormat);
      }
      this.shownMonth = parsedDate.month();
      this.updateCalendarWeeks();
    }

    if (changes['maxDate'] && changes['maxDate'].currentValue) {
      this.maxDate = changes['maxDate'].currentValue;
      this.updateCalendarWeeks();
    }

    if (changes['rangePicker'] && changes['rangePicker'].currentValue) {
      this.rangePicker = changes['rangePicker'].currentValue;
      if (this.rangePicker) {
        this.hoverSubject.subscribe(() => {
          this.onHoverAction();
        });
      }
    }
  }

  private initWeekTitles(): void {
    this.daysOfWeek = [];
    for (const day of this.weekDaysTitles) {
      this.daysOfWeek.push({dayTitle: day.title});
    }
  }

  updateCalendarWeeks(): void {
    const weeksArray: any[][] = [];
    weeksArray.push(this.daysOfWeek);

    const daysInMonth = moment({year: this.shownYear, month: this.shownMonth}).daysInMonth();
    const firstDay = moment(`${this.shownYear}/${this.shownMonth + 1}/1`, 'YYYY/M/D');
    const lastDay = moment(`${this.shownYear}/${this.shownMonth + 1}/${daysInMonth}`, 'YYYY/M/D');

    const startOffset = firstDay.day();

    const tempFirst = moment(firstDay);
    tempFirst.subtract(startOffset, 'days');
    let currentDay = moment(tempFirst);
    while (currentDay.isBefore(lastDay) || currentDay.isSame(lastDay, 'day')) {
      const week: any[] = [];

      for (let i = 0; i < 7; i++) {
        if (this.showNearMonthDays || currentDay.month() === this.shownMonth) {
          week.push({
            year: currentDay.year(),
            month: currentDay.month(),
            day: currentDay.date(),
            currentDay: this.checkToday(currentDay),
            holiday: this.checkHoliday(currentDay),
            datesBetween: this.isInHoverRange(currentDay),
            currentMonth: this.showNearMonthDays ? (currentDay.month() === this.shownMonth) : true,
            disabled: !this.isWithinRange(currentDay)
          });
        } else {
          week.push('');
        }
        currentDay.add(1, 'days');
      }
      weeksArray.push(week);
    }
    this.weeks = weeksArray;
  }

  setCalendarView(view: 'years' | 'months' | 'datePicker'): void {
    this.showYears = (view === 'years');
    this.showMonths = (view === 'months');
    this.showDatePicker = (view === 'datePicker');
  }

  openYearSelection(): void {
    this.setCalendarView('years');
    this.inputYear = this.shownYear;
  }

  changeYear(offset: number): void {
    this.shownYear += offset;
    this.inputYear = this.shownYear;
    this.updateCalendarWeeks();
  }

  changeMonth(offset: number): void {
    this.shownMonth += offset;
    if (this.shownMonth > 11) {
      this.shownMonth = 0;
      this.shownYear += 1;
    } else if (this.shownMonth < 0) {
      this.shownMonth = 11;
      this.shownYear -= 1;
    }
    this.selectMonth(this.shownMonth);
  }

  selectMonth(monthIndex: number): void {
    this.shownMonth = monthIndex;
    this.selectedMonthTitle = this.monthsTitles[this.shownMonth]?.shortName  || '';
    this.updateCalendarWeeks();
    this.cd.markForCheck();
  }

  selectYear(newYear: number): void {
    if (newYear && this.isNumeric(newYear.toString())) {
      this.shownYear = Number(newYear);
      this.updateCalendarWeeks();
      this.setCalendarView('datePicker');
      this.cd.markForCheck();
    } else {
      this.setCalendarView('datePicker');
      this.inputYear = this.shownYear;
    }
  }

  onDaySelected(weekDay: any): void {
    this.selectedYear = weekDay.year;
    this.selectedMonth = weekDay.month;
    this.selectedDay = weekDay.day;
    this.emitSelectedDate();
  }

  onHoverDay(weekDay: any): void {
    this.hoveredDay = weekDay.day;
    this.hoveredMonth = weekDay.month;
    this.hoveredYear = weekDay.year;
    this.hoverSubject.next();
  }

  onRangeDaySelected(weekDay: any): void {
    let formatted: any = moment(`${this.selectedYear}/${this.selectedMonth + 1}/${this.selectedDay}`,
      'YYYY/MM/DD');
    if (this.dateFormat === 'timestamp') {
      formatted = formatted.valueOf();
    } else {
      formatted = formatted.format(this.dateFormat);
    }
    this.checkSelectedDateRange(formatted);
  }

  private checkSelectedDateRange(selectedDate: string): void {
    if (this.rangePicker && this.startDate && !this.endDate) {
      this.endDate = selectedDate;
    } else if (this.rangePicker) {
      this.startDate = selectedDate;
      this.endDate = null;
    }
  }

  private onHoverAction(): void {
    if (this.startDate && !this.endDate) {
      let selectedDate: any = moment(`${this.selectedYear}/${this.selectedMonth + 1}/${this.selectedDay}`, 'YYYY/MM/DD');
      let current = moment(selectedDate);

      let hoveredDate: any = moment(`${this.hoveredYear}/${this.hoveredMonth! + 1}/${this.hoveredDay}`, 'YYYY/MM/DD');
      let hovered = moment(hoveredDate);

      const tmpDates: string[] = [];
      while (current.isSameOrBefore(hovered, 'day')) {
        tmpDates.push(current.format(this.dateFormat));
        current.add(1, 'days');
      }

      if (JSON.stringify(tmpDates) !== JSON.stringify(this.datesBetween)) {
        this.datesBetween = tmpDates;
        this.updateCalendarWeeks();
      }
    }
  }

  emitSelectedDate(emitValue: boolean = true): void {
    let dateStr: any = moment(`${this.selectedYear}/${this.selectedMonth + 1}/${this.selectedDay}`, 'YYYY/MM/DD');
    if (this.dateFormat === 'timestamp') {
      dateStr = dateStr.valueOf();
    } else {
      dateStr = dateStr.format(this.dateFormat);
    }
    if (emitValue) {
      this.showDateValue.emit(dateStr);
    }
  }

  gotoToday(): void {
    const {year, month, day} = this.getCurrentGregorianDate();
    this.shownYear = year;
    this.shownMonth = month;
    this.selectedDay = day;

    this.selectMonth(this.shownMonth);
    this.selectYear(this.shownYear);
  }

  close(): void {
    if (this.showYears) {
      this.setCalendarView('datePicker');
    }
  }

  private checkToday(date: Moment): boolean {
    if (!this.showCurrentDate) {
      return false;
    }
    const current = this.getCurrentGregorianDate();
    return (current.year === date.year()
      && current.month === date.month()
      && current.day === date.date());
  }

  private checkHoliday(date: Moment): boolean {
    if (!this.holidays || !this.holidays.date || this.holidays.date.length === 0) {
      return false;
    }
    return this.holidays.date.indexOf(date.format(this.holidays.format)) !== -1;
  }

  private isInHoverRange(date: Moment): boolean {
    if (this.datesBetween && this.datesBetween.length > 0) {
      return this.datesBetween.indexOf(date.format(this.dateFormat)) !== -1;
    }
    return false;
  }

  isSelectedDay(weekDay: any): boolean {
    return (
      this.selectedYear === weekDay.year &&
      this.selectedMonth === weekDay.month &&
      this.selectedDay === weekDay.day
    );
  }

  private getCurrentGregorianDate(): { year: number, month: number, day: number } {
    const currentDate = moment();
    return {
      year: currentDate.year(),
      month: currentDate.month(),
      day: currentDate.date(),
    };
  }

  private isNumeric(input: string): boolean {
    return /^\d+$/.test(input);
  }

  private isWithinRange(dateMoment: Moment): boolean {
    if (!this.minDate && !this.maxDate) {
      return true;
    }
    let valid = true;

    if (this.minDate) {
      const min = this.parseDate(this.minDate);
      if (dateMoment.isBefore(min, 'day')) {
        return false;
      }
    }
    if (this.maxDate) {
      const max = this.parseDate(this.maxDate);
      if (dateMoment.isAfter(max, 'day')) {
        return false;
      }
    }
    return valid;
  }

  private parseDate(dateStr: string): moment.Moment {
    if (this.dateFormat === 'timestamp') {
      return moment(Number(dateStr));
    } else {
      return moment(dateStr, this.dateFormat, true);
    }
  }
}
