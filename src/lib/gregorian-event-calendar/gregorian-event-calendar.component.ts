import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {DateFormat} from "../models/date-format";
import {IEvent} from "../models/event";
import {IEventCategory} from "../models/event-category";
import moment, {Moment} from "jalali-moment";
import {Subject} from "rxjs";
import {EventPeriods} from "../models/event-periods";
import {Weekday} from "../models/week-day";
import {IActionButton} from "../models/action-button";
import {IPeriodicItem} from "../models/periodic-item";

@Component({
  selector: 'gregorian-event-calendar',
  templateUrl: './gregorian-event-calendar.component.html',
  styleUrl: './gregorian-event-calendar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GregorianEventCalendarComponent implements OnInit, OnChanges, AfterViewInit {

  @Input() showNearMonthDays: boolean = true;
  @Input() showGotoToday: boolean = true;
  @Input() enableChangeMonth: boolean = true;
  @Input() enableChangeYear: boolean = true;
  @Input() enableNavigateMonth: boolean = true;
  @Input() currentMonthShadow: boolean = false;
  @Input() rangePicker: boolean = false;
  @Input() startDate: any;
  @Input() endDate: any;
  @Input() showCurrentDate: boolean = true;
  @Input() holidays: { format: string, date: any[] } | undefined;
  @Input() dayClass: string = '';
  @Input() eventClass: string = '';
  @Input() selectedDateClass: string = '';
  @Input() dateContainerClass: string = '';
  @Input() showCurrentDayDetails = true;

  @Input() minDate: string;
  @Input() maxDate: string;

  @Input() dateFormat: DateFormat = "YYYY/MM/DD";
  @Input() defaultValue: boolean = false;
  @Input() showFullDayTitle: boolean = false;
  @Input() showActionsByHover: boolean = false;

  @Input() datesBetween: string[] = [];

  @Input() events: IEvent[] = [];
  @Input() eventCategories: IEventCategory[] = [];
  @Input() maxEventsPerDay: number = 3;

  @Input() outputFormatConfig: { [key: string]: string } = {};
  @Input() actionButtons: IActionButton[] = [];

  @Output() moreEventsEmit: EventEmitter<IEvent[]> = new EventEmitter<IEvent[]>();
  @Output() selectedEventEmit: EventEmitter<IEvent> = new EventEmitter<IEvent>();

  @Output() showDateValue: EventEmitter<string> = new EventEmitter<string>();
  @Output() getByOutputFormatConfig: EventEmitter<any> = new EventEmitter<any>();

  @Output() changeMonthEmit: EventEmitter<any> = new EventEmitter<any>();
  @Output() changeYearEmit: EventEmitter<any> = new EventEmitter<any>();
  @Output() goToTodayEmit: EventEmitter<any> = new EventEmitter<any>();
  @Output() actionButtonsEmit: EventEmitter<any> = new EventEmitter<any>();

  @Input() selectedYear: number = Number(moment().year());
  @Input() selectedMonth: number = Number(moment().month());
  @Input() selectedDay: number = Number(moment().date());

  currentMonth: number = Number(moment().month());

  weekDaysTitles: { index: number, title: string, fullTitle: string }[] = [
    {index: 0, title: 'Su', fullTitle: 'Sunday'},
    {index: 1, title: 'Mo', fullTitle: 'Monday'},
    {index: 2, title: 'Tu', fullTitle: 'Tuesday'},
    {index: 3, title: 'We', fullTitle: 'Wednesday'},
    {index: 4, title: 'Th', fullTitle: 'Thursday'},
    {index: 5, title: 'Fr', fullTitle: 'Friday'},
    {index: 6, title: 'Sa', fullTitle: 'Saturday'},
  ];

  daysOfWeek: any[] = [];

  shownYear: number = this.selectedYear;
  shownMonth: number = this.selectedMonth;

  selectedMonthTitle: string = '';

  private hoverSubject = new Subject<void>();
  hoveredDay: number | null = null;
  hoveredMonth: number | null = null;
  hoveredYear: number | null = null;

  showMonthList = false;
  showYearsList = false;

  monthsTitles: { id: number, fullName: string, shortName: string }[] = [
    {id: 1, fullName: 'January', shortName: 'Jan'},
    {id: 2, fullName: 'February', shortName: 'Feb'},
    {id: 3, fullName: 'March', shortName: 'Mar'},
    {id: 4, fullName: 'April', shortName: 'Apr'},
    {id: 5, fullName: 'May', shortName: 'May'},
    {id: 6, fullName: 'June', shortName: 'Jun'},
    {id: 7, fullName: 'July', shortName: 'Jul'},
    {id: 8, fullName: 'August', shortName: 'Aug'},
    {id: 9, fullName: 'September', shortName: 'Sep'},
    {id: 10, fullName: 'October', shortName: 'Oct'},
    {id: 11, fullName: 'November', shortName: 'Nov'},
    {id: 12, fullName: 'December', shortName: 'Dec'}
  ];

  weeks: any[] = [];
  regex = /^(1[0-4]\d{2})[\/-]?(0[1-9]|1[0-2])[\/-]?(0[1-9]|[12]\d|3[01])$/;

  @ViewChild('scrollContainer') scrollContainer?: ElementRef;

  years: number[] = [];

  minYear = 1300;
  maxYear = Number(moment().year()) + 100;

  constructor(private cd: ChangeDetectorRef) {
    if (this.rangePicker) {
      this.hoverSubject.subscribe(() => {
        this.onHoverAction();
      });
    }
  }

  ngOnInit() {
    this.initWeekTitles();
    this.selectMonth(this.shownMonth);

    this.emitSelectedDate(this.defaultValue);
  }

  ngAfterViewInit() {
    this.generateInitialYears();
    setTimeout(() => {
      this.scrollToSelectedYear();
    }, 0);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['holidays'] && changes['holidays'].currentValue) {
      this.holidays = changes['holidays'].currentValue;
      this.selectMonth(this.shownMonth);
    }

    if (changes['selectedMonth'] && changes['selectedMonth'].currentValue) {
      this.selectMonth(changes['selectedMonth'].currentValue - 1);
    }

    if (changes['selectedYear'] && changes['selectedYear'].currentValue) {
      this.shownYear = changes['selectedYear'].currentValue;
      this.selectYear(this.shownYear);
    }

    if (changes['minDate'] && changes['minDate'].currentValue) {
      this.minDate = changes['minDate'].currentValue;
      let parsedDate;
      if (this.dateFormat === 'timestamp') {
        parsedDate = moment(this.minDate, this.dateFormat).valueOf();
      } else {
        parsedDate = moment(this.minDate, this.dateFormat);
      }
      this.shownMonth = parsedDate.month();
      this.shownYear = parsedDate.year();
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

    if (changes['eventCategories']) {
      this.eventCategories = changes['eventCategories'].currentValue;
      this.updateCalendarWeeks();
    }

    if (changes['events']) {
      this.events = changes['events'].currentValue;
      this.updateCalendarWeeks();
    }

    if (changes['actionButtons']) {
      this.actionButtons = changes['actionButtons'].currentValue;
      this.updateCalendarWeeks();
    }

    if (changes['showActionsByHover']) {
      this.showActionsByHover = changes['showActionsByHover'].currentValue;
      this.updateCalendarWeeks();
    }
  }

  private initWeekTitles(): void {
    this.daysOfWeek = [];
    for (const day of this.weekDaysTitles) {
      this.daysOfWeek.push({dayTitle: this.showFullDayTitle ? day.fullTitle : day.title});
    }
  }

  updateCalendarWeeks(): void {
    const weeksArray: any[][] = [];
    weeksArray.push(this.daysOfWeek);

    const daysInMonth = moment({year: this.shownYear, month: this.shownMonth}).daysInMonth();
    const firstDay = moment(`${this.shownYear}/${this.shownMonth + 1}/1`, 'YYYY/M/D');
    const lastDay = moment(`${this.shownYear}/${this.shownMonth + 1}/${daysInMonth}`, 'YYYY/M/D');

    const startOffset = firstDay.day();

    let currentDay = moment(firstDay).subtract(startOffset, 'days');

    while (currentDay <= lastDay) {
      const week: any[] = [];
      for (let i = 0; i < 7; i++) {
        if (this.showNearMonthDays || currentDay.month() === this.shownMonth) {

          const dayEvents = this.getPeriodicItemsForDate<IEvent>(currentDay, this.events);
          const dayActions = this.getPeriodicItemsForDate<IActionButton>(currentDay, this.actionButtons);

          week.push({
            year: currentDay.year(),
            month: currentDay.month(),
            day: currentDay.date(),
            currentDay: this.checkToday(currentDay),
            holiday: this.checkHoliday(currentDay),
            datesBetween: this.isInHoverRange(currentDay),
            currentMonth: this.showNearMonthDays ? currentDay.month() === this.shownMonth : true,
            disabled: !this.isWithinRange(currentDay),
            isHovered: !this.showActionsByHover,
            events: dayEvents.map(ev => ({
              title: ev.title,
              color: this.getEventColor(ev),
              startDate: ev.startDate,
              endDate: ev.endDate,
              priority: ev.priority,
              description: ev.description,
              enterDateFormat: ev.enterDateFormat,
              period: ev.period,
              categoryId: ev.categoryName,
              location: ev.location,
              reminders: ev.reminders,
              repeatOnDays: ev.repeatOnDays
            })).sort((a, b) => {
              return (b.priority ?? 2) - (a.priority ?? 2);
            }),
            actionButtons: dayActions.map(ev => ({
              title: ev.title,
              type: ev.type,
              color: ev.color,
              size: ev.size,
              startDate: ev.startDate,
              endDate: ev.endDate,
              enterDateFormat: ev.enterDateFormat,
              period: ev.period,
              repeatOnDays: ev.repeatOnDays,
              class: ev.class
            }))
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

  private getPeriodicItemsForDate<T extends IPeriodicItem>(date: Moment, items: T[]): T[] {
    const formattedDate = date.format(this.dateFormat);
    return items.filter(item => {
      const eventStart = moment(item.startDate, item.enterDateFormat);
      const eventEnd = moment(item.endDate, item.enterDateFormat);
      const formattedEventStart = moment(item.startDate, item.enterDateFormat).format(this.dateFormat);

      if (date.isBefore(eventStart, 'day') || (item.endDate && date.isAfter(eventEnd, 'day'))) {
        return false;
      }
      if (item.period === EventPeriods.Once) {
        return formattedDate === formattedEventStart;
      }

      if (item.period === EventPeriods.Daily) {
        return true;
      }

      if (item.period === EventPeriods.EveryOtherDay) {
        const diff = date.diff(eventStart, 'days');
        return diff % 2 === 0;
      }

      if (item.period === EventPeriods.EvenDays) {
        const weekday = date.day();
        return [6, 1, 3].includes(weekday);
      }

      if (item.period === EventPeriods.OddDays) {
        const weekday = date.day();
        return [0, 2, 4].includes(weekday);
      }

      if (item.period === EventPeriods.Weekly) {
        const dayOfWeek = date.day();
        return item.repeatOnDays?.includes(dayOfWeek as Weekday);
      }

      if (item.period === EventPeriods.Monthly) {
        return eventStart.date() === date.date();
      }

      if (item.period === EventPeriods.Yearly) {
        return eventStart.month() === date.month() && eventStart.date() === date.date();
      }

      return false;
    });
  }


  getEventTime(event: IEvent) {
    if (['jYYYY/jMM/jDD HH:mm', 'jYYYY-jMM-jDD HH:mm', 'jYYYYjMMjDD HH:mm', 'YYYY/MM/DD HH:mm', 'YYYY-MM-DD HH:mm', 'YYYYMMDD HH:mm']
      .includes(event.enterDateFormat)) {
      const start = moment(event.startDate, event.enterDateFormat).format('HH:mm');
      const end = moment(event.endDate, event.enterDateFormat).format('HH:mm');
      return `${start}-${end}`;
    } else {
      return '';
    }
  }

  openEventsPopup(day: any) {
    this.moreEventsEmit.emit(day.events);
  }

  clickOnEvent(event: IEvent) {
    this.selectedEventEmit.emit(event);
  }

  private getEventColor(event: IEvent): string {
    const category = this.eventCategories.find(c => c.name === event.categoryName);
    return category ? category.color : '#000000';
  }

  changeMonth(offset: number): void {
    this.shownMonth += offset;
    this.selectMonth(this.shownMonth);
  }

  selectMonth(monthIndex: number): void {
    this.shownMonth = monthIndex;
    if (this.shownMonth > 12) {
      this.shownMonth = 1;
      this.shownYear += 1;
    } else if (this.shownMonth < 1) {
      this.shownMonth = 12;
      this.shownYear -= 1;
    }

    this.selectedMonthTitle = this.monthsTitles.find(x => x.id === this.shownMonth).fullName || '';
    this.updateCalendarWeeks();
    this.cd.markForCheck();
    this.showMonthList = false;
  }

  selectYear(newYear: number): void {
    if (newYear && this.isNumeric(newYear.toString())) {
      this.shownYear = Number(newYear);
      this.updateCalendarWeeks();
      this.cd.markForCheck();
      this.showYearsList = false;
      this.selectedYear = newYear;
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

      let current;
      let hovered;
      if (this.dateFormat === 'timestamp') {
        selectedDate = selectedDate.valueOf();
        current = moment(selectedDate);
      } else {
        selectedDate = selectedDate.format(this.dateFormat);
        current = moment(selectedDate, this.dateFormat)
      }

      let hoveredDate: any = moment(`${this.hoveredYear}/${this.hoveredMonth! + 1}/${this.hoveredDay}`, 'YYYY/MM/DD');

      if (this.dateFormat === 'timestamp') {
        hoveredDate = hoveredDate.valueOf();
        hovered = moment(hoveredDate)
      } else {
        hoveredDate = hoveredDate.format(this.dateFormat);
        hovered = moment(hoveredDate, this.dateFormat)
      }

      const tmpDates: string[] = [];

      while (current.isSameOrBefore(hovered)) {
        tmpDates.push(current);
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
      this.getFormattedOutput(dateStr);
    }
  }

  gotoToday(): void {
    const {year, month, day} = this.getCurrentDate();
    this.shownYear = year;
    this.shownMonth = month;
    this.selectedDay = day;

    this.selectMonth(this.shownMonth);
    this.selectYear(this.shownYear);
    this.goToTodayEmit.emit({year, month, day});
  }

  private checkToday(date: Moment): boolean {
    if (!this.showCurrentDate) {
      return false;
    }
    const current = this.getCurrentDate();
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

  private getCurrentDate(): { year: number, month: number, day: number } {
    const currentDate = moment();
    return {
      year: currentDate.year(),
      month: currentDate.month() + 1,
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
      if (dateMoment.isBefore(min)) {
        return false;
      }
    }

    if (this.maxDate) {
      const max = this.parseDate(this.maxDate);
      if (dateMoment.isAfter(max)) {
        return false;
      }
    }
    return valid;
  }

  private parseDate(dateStr: string): moment.Moment {
    if (this.dateFormat === 'timestamp') {
      return moment(dateStr, 'fa', true);
    } else {
      return moment(dateStr, this.dateFormat, 'fa', true);
    }
  }

  isSelectedDay(weekDay: any): boolean {
    return (
      this.selectedYear === weekDay.year &&
      this.selectedMonth === weekDay.month &&
      this.selectedDay === weekDay.day
    );
  }

  getCurrentDay() {
    const today = moment();

    const weekDay: string = today.format('dddd');

    const dayOfMonth: string = today.date().toString();

    const monthName: string = today.format('MMMM');

    const year: string = today.format('YYYY');

    return `${weekDay} - ${dayOfMonth} ${monthName} ${year}`;
  }


  generateInitialYears() {
    const currentYear = Number(moment().year());
    const startYear = currentYear - 5;
    const endYear = currentYear + 6;

    for (let year = startYear; year <= endYear; year++) {
      if (year >= this.minYear && year <= this.maxYear) {
        this.years.push(year);
      }
    }
  }

  onScroll() {
    const container = this.scrollContainer?.nativeElement;

    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const offsetHeight = container.offsetHeight;

    if (scrollTop === 0) {
      this.loadPreviousYears();
    }

    if (scrollTop + offsetHeight >= scrollHeight - 10) {
      this.loadNextYears();
    }
  }

  loadPreviousYears() {
    const firstYear = this.years[0];

    if (firstYear <= this.minYear) return;

    const newYears: number[] = [];
    for (let i = 1; i <= 5; i++) {
      const yearToAdd = firstYear - i;
      if (yearToAdd >= this.minYear) {
        newYears.push(yearToAdd);
      }
    }
    this.years = [...newYears.reverse(), ...this.years];

    setTimeout(() => {
      if (this.scrollContainer) {
        this.scrollContainer.nativeElement.scrollTop = 5 * 40;
      }
    }, 0);
  }

  loadNextYears() {
    const lastYear = this.years[this.years.length - 1];

    if (lastYear >= this.maxYear) return;

    const newYears: number[] = [];
    for (let i = 1; i <= 5; i++) {
      const yearToAdd = lastYear + i;
      if (yearToAdd <= this.maxYear) {
        newYears.push(yearToAdd);
      }
    }
    this.years = [...this.years, ...newYears];
  }

  scrollToSelectedYear() {
    const index = this.years.indexOf(this.selectedYear);
    if (index !== -1) {
      const scrollPosition = index * 40 - 120;
      if (this.scrollContainer) {
        this.scrollContainer.nativeElement.scrollTop = scrollPosition;
      }
    }
  }

  getFormattedOutput(date: any) {
    const output: { [key: string]: string } = {};

    for (const key in this.outputFormatConfig) {
      const format = this.outputFormatConfig[key];

      if (format.includes('j')) {
        output[key] = moment(date).locale('fa').format(format);
      } else {
        output[key] = moment(date).format(format);
      }
    }

    this.getByOutputFormatConfig.emit(output);
  }

  clickOnActionButton(actionButton: IActionButton, weekDay: any) {
    this.selectedYear = weekDay.year;
    this.selectedMonth = weekDay.month;
    this.selectedDay = weekDay.day;

    let dateStr: any = moment(`${this.selectedYear}/${this.selectedMonth + 1}/${this.selectedDay}`, 'jYYYY/jMM/jDD');

    if (this.dateFormat === 'timestamp') {
      dateStr = dateStr.valueOf();

    } else {
      dateStr = dateStr.format(this.dateFormat);
    }

    const output: { [key: string]: string } = {};

    for (const key in this.outputFormatConfig) {
      const format = this.outputFormatConfig[key];

      if (format.includes('j')) {
        output[key] = moment(dateStr, this.dateFormat).locale('fa').format(format);
      } else {
        output[key] = moment(dateStr, this.dateFormat).format(format);
      }
    }

    this.actionButtonsEmit.emit({actionButton, outputDate: output});
  }

  hoverOnDay(weekDay: any): void {
    if (weekDay.actionButtons.length > 0 && this.showActionsByHover) {
      weekDay.isHovered = true;
    }
  }

  onLeaveDay(weekDay: any): void {
    if (this.showActionsByHover) {
      weekDay.isHovered = false;
    }
  }

  emitChangeMonth() {
    this.changeMonthEmit.emit(this.shownMonth);
  }

  emitChangeYear() {
    this.changeYearEmit.emit(this.shownYear);
  }
}
