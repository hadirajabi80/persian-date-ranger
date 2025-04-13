import {
  ApplicationRef,
  ComponentFactoryResolver,
  Directive,
  ElementRef,
  EmbeddedViewRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  Renderer2
} from '@angular/core';
import {DateFormat} from "../models/date-format";
import moment from "jalali-moment";
import {GregorianDateCalendarComponent} from "../gregorian-date-calendar/gregorian-date-calendar.component";

@Directive({
  selector: '[gregorianDateRanger]',
})
export class GregorianDateRangerDirective {
  private closeListener: (() => void) | null = null;

  @Input() dateFormat: DateFormat = "YYYY/MM/DD";
  @Input() returnFormat: DateFormat = "YYYY/MM/DD";
  @Input() minDate?: string;
  @Input() maxDate?: string;
  @Input() closeOnSelectDate: boolean = true;
  @Input() showNearMonthDays: boolean = true;
  @Input() showGotoToday: boolean = true;
  @Input() enableChangeMonth: boolean = true;
  @Input() enableChangeYear: boolean = true;
  @Input() enableNavigateMonth: boolean = true;
  @Input() enableNavigateYear: boolean = true;
  @Input() currentMonthShadow: boolean = false;
  @Input() rangePicker: boolean = false;
  @Input() showCurrentDate: boolean = false;
  @Input() holidays: { format: string, date: any[] } | undefined;
  @Input() selectedYear: number = Number(moment().year());
  @Input() selectedMonth: number = Number(moment().month());
  @Input() selectedDay: number = Number(moment().date());
  @Input() defaultValue: boolean = false;
  @Input() datesBetween: string[] = [];

  @Output() selectedDate = new EventEmitter<string>();
  date: string = '';
  regex = /^(1[0-4]\d{2})[\/-]?(0[1-9]|1[0-2])[\/-]?(0[1-9]|[12]\d|3[01])$/;

  private calendarComponentRef: any;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private resolver: ComponentFactoryResolver,
    private appRef: ApplicationRef
  ) {
  }

  @HostListener('click')
  onClick() {
    this.openCalendar();
  }

  private openCalendar(): void {
    if (this.calendarComponentRef) {
      const domElem = (this.calendarComponentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
      domElem.style.display = 'block';

      this.setupCloseListener(domElem);
      return;
    }

    const factory = this.resolver.resolveComponentFactory(GregorianDateCalendarComponent);
    this.calendarComponentRef = factory.create(this.appRef.components[0].injector);
    const calendarInstance = this.calendarComponentRef.instance;

    calendarInstance.datePickerMode = true;
    calendarInstance.dateFormat = this.dateFormat;
    calendarInstance.returnFormat = this.returnFormat;
    calendarInstance.minDate = this.minDate;
    calendarInstance.maxDate = this.maxDate;
    calendarInstance.closeOnSelectDate = this.closeOnSelectDate;
    calendarInstance.showNearMonthDays = this.showNearMonthDays;
    calendarInstance.showGotoToday = this.showGotoToday;
    calendarInstance.enableChangeMonth = this.enableChangeMonth;
    calendarInstance.enableChangeYear = this.enableChangeYear;
    calendarInstance.enableNavigateMonth = this.enableNavigateMonth;
    calendarInstance.enableNavigateYear = this.enableNavigateYear;
    calendarInstance.currentMonthShadow = this.currentMonthShadow;
    calendarInstance.rangePicker = this.rangePicker;
    calendarInstance.showCurrentDate = this.showCurrentDate;
    calendarInstance.holidays = this.holidays;
    calendarInstance.selectedYear = this.selectedYear;
    calendarInstance.selectedMonth = this.selectedMonth;
    calendarInstance.selectedDay = this.selectedDay;
    calendarInstance.defaultValue = this.defaultValue;
    calendarInstance.datesBetween = this.datesBetween;

    calendarInstance.showDateValue.subscribe((date: string) => {
      const formattedDate = this.returnFormat === 'timestamp'
        ? moment(date, this.dateFormat).valueOf().toString()
        : moment(date, this.dateFormat).format(this.returnFormat);

      this.renderer.setProperty(this.el.nativeElement, 'value', formattedDate);
      this.selectedDate.emit(formattedDate);

      if (this.closeOnSelectDate) {
        this.closeCalendar();
      }
    });

    this.appRef.attachView(this.calendarComponentRef.hostView);
    const domElem = (this.calendarComponentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
    document.body.appendChild(domElem);

    const rect = this.el.nativeElement.getBoundingClientRect();
    domElem.style.position = 'absolute';
    domElem.style.top = `${rect.bottom + window.scrollY}px`;
    domElem.style.left = `${rect.left + window.scrollX}px`;
    domElem.style.zIndex = '1000';

    setTimeout(() => {
      this.closeListener = this.renderer.listen('document', 'mousedown', (event: MouseEvent) => {
        const clickedInside = this.el.nativeElement.contains(event.target) || domElem.contains(event.target as Node);
        if (!clickedInside) {
          this.closeCalendar();
        }
      });
    });
  }

  private closeCalendar(): void {
    if (this.calendarComponentRef) {
      const domElem = (this.calendarComponentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
      domElem.style.display = 'none';
    }

    if (this.closeListener) {
      this.closeListener();
      this.closeListener = null;
    }
  }

  @HostListener('input', ['$event.target.value'])
  onInput(value: string) {
    this.date = value;
    this.updateCalendarByDate(value);
  }

  private updateCalendarByDate(dateStr: string): void {
    const parsedDate = moment(dateStr, this.dateFormat === "timestamp" ? '' : this.dateFormat);
    const calendarInstance = this.calendarComponentRef?.instance;
    if (!parsedDate.isValid() || !calendarInstance) {
      return;
    }

    calendarInstance.selectYear(parsedDate.year());
    calendarInstance.selectMonth(parsedDate.month());
    calendarInstance.selectedDay = parsedDate.date();
    calendarInstance.selectedMonth = parsedDate.month();
    calendarInstance.selectedYear = parsedDate.year();

    calendarInstance.emitSelectedDate(false);

    this.calendarComponentRef.changeDetectorRef.detectChanges();
  }

  private setupCloseListener(domElem: HTMLElement): void {
    if (this.closeListener) {
      this.closeListener();
    }

    this.closeListener = this.renderer.listen('document', 'mousedown', (event: MouseEvent) => {
      const clickedInside = this.el.nativeElement.contains(event.target) || domElem.contains(event.target as Node);
      if (!clickedInside) {
        this.closeCalendar();
      }
    });
  }
}
