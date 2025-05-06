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
import {Subject} from "rxjs";
import moment, {Moment} from "jalali-moment";
import {IEvent} from "../models/event";
import {IEventCategory} from "../models/event-category";
import {EventPeriods} from "../models/event-periods";
import {Weekday} from "../models/week-day";
import {IActionButton} from "../models/action-button";
import {IPeriodicItem} from "../models/periodic-item";

@Component({
  selector: 'persian-event-calendar',
  templateUrl: './persian-event-calendar.component.html',
  styleUrl: './persian-event-calendar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PersianEventCalendarComponent implements OnInit, OnChanges, AfterViewInit {

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

  @Input() dateFormat: DateFormat = "jYYYY/jMM/jDD";
  @Input() defaultValue: boolean = false;
  @Input() showFullDayTitle: boolean = false;
  @Input() showActionsByHover: boolean = false;

  @Input() datesBetween: string[] = [];

  @Input() events: IEvent[] = [];
  @Input() eventCategories: IEventCategory[] = [];
  @Input() maxEventsPerDay: number = 3;

  @Input() actionButtons: IActionButton[] = [];

  @Input() outputFormatConfig: { [key: string]: DateFormat } = {};

  @Output() moreEventsEmit: EventEmitter<IEvent[]> = new EventEmitter<IEvent[]>();
  @Output() selectedEventEmit: EventEmitter<IEvent> = new EventEmitter<IEvent>();

  @Output() showDateValue: EventEmitter<string> = new EventEmitter<string>();
  @Output() getByOutputFormatConfig: EventEmitter<any> = new EventEmitter<any>();

  @Output() changeMonthEmit: EventEmitter<any> = new EventEmitter<any>();
  @Output() changeYearEmit: EventEmitter<any> = new EventEmitter<any>();
  @Output() goToTodayEmit: EventEmitter<any> = new EventEmitter<any>();
  @Output() actionButtonsEmit: EventEmitter<IActionButton> = new EventEmitter<IActionButton>();

  @Input() selectedYear: number = Number(moment().jYear());
  @Input() selectedMonth: number = Number(moment().jMonth());
  @Input() selectedDay: number = Number(moment().jDate());

  currentMonth: number = Number(moment().jMonth());

  weekDaysTitles: { index: number, title: string, fullTitle: string }[] = [
    {index: 1, title: 'ش', fullTitle: 'شنبه'},
    {index: 2, title: 'ی', fullTitle: 'یکشنبه'},
    {index: 3, title: 'د', fullTitle: 'دوشنبه'},
    {index: 4, title: 'س', fullTitle: 'سه شنبه'},
    {index: 5, title: 'چ', fullTitle: 'چهارشنبه'},
    {index: 6, title: 'پ', fullTitle: 'پنجشنبه'},
    {index: 7, title: 'ج', fullTitle: 'جمعه'}
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

  monthsTitles: string[] = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
  ];

  weeks: any[] = [];
  regex = /^(1[0-4]\d{2})[\/-]?(0[1-9]|1[0-2])[\/-]?(0[1-9]|[12]\d|3[01])$/;

  @ViewChild('scrollContainer') scrollContainer?: ElementRef;

  years: number[] = [];

  minYear = 1300;
  maxYear = Number(moment().jYear()) + 100;

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
      this.selectMonth(changes['selectedMonth'].currentValue);
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
      this.shownMonth = parsedDate.jMonth();
      this.shownYear = parsedDate.jYear();
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

    const daysInMonth = moment.jDaysInMonth(this.shownYear, this.shownMonth);
    const firstDay = moment(`${this.shownYear}/${this.shownMonth + 1}/1`, 'jYYYY/jMM/jDD');
    const lastDay = moment(`${this.shownYear}/${this.shownMonth + 1}/${daysInMonth}`, 'jYYYY/jMM/jDD');
    const startOffset = firstDay.jDay();

    let currentDay = moment(firstDay).subtract(startOffset, 'days');

    while (currentDay <= lastDay) {
      const week: any[] = [];
      for (let i = 0; i < 7; i++) {
        if (this.showNearMonthDays || currentDay.jMonth() === this.shownMonth) {

          const dayEvents = this.getPeriodicItemsForDate<IEvent>(currentDay, this.events);
          const dayActions = this.getPeriodicItemsForDate<IActionButton>(currentDay, this.actionButtons);
          week.push({
            year: currentDay.jYear(),
            month: currentDay.jMonth(),
            day: currentDay.jDate(),
            currentDay: this.checkToday(currentDay),
            holiday: this.checkHoliday(currentDay),
            datesBetween: this.isInHoverRange(currentDay),
            currentMonth: this.showNearMonthDays ? currentDay.jMonth() === this.shownMonth : true,
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
        return eventStart.jDate() === date.jDate();
      }

      if (item.period === EventPeriods.Yearly) {
        return eventStart.jMonth() === date.jMonth() && eventStart.jDate() === date.jDate();
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
    this.selectedMonthTitle = this.monthsTitles[this.shownMonth] || '';
    this.updateCalendarWeeks();
    this.cd.markForCheck();
    this.showMonthList = false;
    this.changeMonthEmit.emit(monthIndex);
  }

  selectYear(newYear: number): void {
    if (newYear && this.isNumeric(newYear.toString())) {
      this.shownYear = Number(newYear);
      this.updateCalendarWeeks();
      this.cd.markForCheck();
      this.showYearsList = false;
      this.selectedYear = newYear;
      this.changeYearEmit.emit(newYear);
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

  private onHoverAction(): void {
    if (this.startDate && !this.endDate) {

      let selectedDate: any = moment(`${this.selectedYear}/${this.selectedMonth + 1}/${this.selectedDay}`, 'jYYYY/jMM/jDD');

      let current;
      let hovered;
      if (this.dateFormat === 'timestamp') {
        selectedDate = selectedDate.valueOf();
        current = moment(selectedDate);
      } else {
        selectedDate = selectedDate.format(this.dateFormat);
        current = moment(selectedDate, this.dateFormat)
      }

      let hoveredDate: any = moment(`${this.hoveredYear}/${this.hoveredMonth! + 1}/${this.hoveredDay}`, 'jYYYY/jMM/jDD');

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
    let dateStr: any = moment(`${this.selectedYear}/${this.selectedMonth + 1}/${this.selectedDay}`, 'jYYYY/jMM/jDD');

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
    const {year, month, day} = this.getCurrentJalaliDate();
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
    const current = this.getCurrentJalaliDate();
    return (current.year === date.jYear()
      && current.month === date.jMonth()
      && current.day === date.jDate());
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

  private getCurrentJalaliDate(): { year: number, month: number, day: number } {
    const currentDate = moment();
    return {
      year: currentDate.jYear(),
      month: currentDate.jMonth(),
      day: currentDate.jDate(),
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

  getCurrentDay() {
    const today = moment().locale('fa');

    const weekDay: string = today.format('dddd');

    const dayOfMonth: string = today.jDate().toString();

    const monthName: string = today.format('jMMMM');

    const year: string = today.format('jYYYY');

    return `${weekDay} - ${dayOfMonth} ${monthName} ${year}`;
  }


  generateInitialYears() {
    const currentYear = Number(moment().jYear());
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
        output[key] = moment(date, this.dateFormat).locale('fa').format(format);
      } else {
        output[key] = moment(date, this.dateFormat).format(format);
      }
    }

    this.getByOutputFormatConfig.emit(output);
  }

  clickOnActionButton(actionButton: IActionButton) {
    this.actionButtonsEmit.emit(actionButton);
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
}
