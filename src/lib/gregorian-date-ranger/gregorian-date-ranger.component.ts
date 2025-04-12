import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  Output,
  Renderer2,
  ViewChild
} from '@angular/core';
import {GregorianDateCalendarComponent} from "../gregorian-date-calendar/gregorian-date-calendar.component";
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";
import moment from "moment";
import {DateFormat} from "../models/date-format";

const DATE_PICKER_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => GregorianDateRangerComponent),
  multi: true,
};

@Component({
  selector: 'gregorian-date-ranger',
  templateUrl: './gregorian-date-ranger.component.html',
  styleUrls: ['./gregorian-date-ranger.component.scss'],
  providers: [DATE_PICKER_VALUE_ACCESSOR]
})
export class GregorianDateRangerComponent
  extends GregorianDateCalendarComponent
  implements ControlValueAccessor, AfterViewInit {

  @Input() inputDirective: any;
  @Input() placeholder: string = '';
  @Input() inputClass: string = '';
  @Input() returnFormat: DateFormat = "YYYY/MM/DD";
  @Input() useNgModelAsInitial = true;

  @Input() position:
    'position-top' | 'position-bottom' |
    'position-left' | 'position-right' |
    'position-top-right' | 'position-top-left' |
    'position-bottom-right' | 'position-bottom-left' = 'position-bottom';

  @Input() displayMode: 'inline' | 'popup' = 'popup';

  @Output() changeInputEvent = new EventEmitter<void>();
  @Output() selectedDate = new EventEmitter<string | number>();

  showDatePickerStatus: boolean = false;
  date: string = '';

  @ViewChild('inputElement', {static: false}) inputElement: ElementRef | undefined;

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(
    private cdr: ChangeDetectorRef,
    private renderer: Renderer2
  ) {
    super();
  }

  ngAfterViewInit(): void {
    if (this.inputDirective) {
      const directiveInstance = new this.inputDirective(this.inputElement, this.renderer);
      directiveInstance.ngOnInit();
    }
  }

  writeValue(value: any): void {
    this.date = value || '';
    if (this.useNgModelAsInitial && this.date) {
      this.updateCalendarByDate(this.date);
    }
    this.cdr.detectChanges();
  }

  registerOnChange(fn: any): void {
    this.onChange = (date: any) => {
      this.date = date;

      if (!date) {
        fn(date);
        return;
      }

      const isValidDateFormat =
        ['YYYYMMDD', 'YYYY-MM-DD', 'YYYY/MM/DD', 'jYYYY/jMM/jDD', 'jYYYY-jMM-jDD', 'jYYYYjMMjDD'].includes(this.dateFormat) &&
        this.regex.test(date);

      const isTimestampFormat = this.dateFormat === 'timestamp';

      if (isValidDateFormat || isTimestampFormat) {
        const inputFormat = isTimestampFormat ? undefined : this.dateFormat;
        const momentDate = moment(date, inputFormat);

        const formatted =
          this.returnFormat === 'timestamp'
            ? momentDate.valueOf()
            : momentDate.format(this.returnFormat);

        fn(formatted);
      } else {
        fn(date);
      }
    };
  }


  registerOnTouched(fn: any): void {
    this.onTouched = () => {
      if (!this.date) {
        fn(this.date);
        return;
      }

      const isValidDateFormat =
        ['YYYYMMDD', 'YYYY-MM-DD', 'YYYY/MM/DD', 'jYYYY/jMM/jDD', 'jYYYY-jMM-jDD', 'jYYYYjMMjDD'].includes(this.dateFormat) &&
        this.regex.test(this.date);

      const isTimestampFormat = this.dateFormat === 'timestamp';

      if (isValidDateFormat || isTimestampFormat) {
        const inputFormat = isTimestampFormat ? undefined : this.dateFormat;
        const momentDate = moment(this.date, inputFormat);

        const formatted =
          this.returnFormat === 'timestamp'
            ? momentDate.valueOf()
            : momentDate.format(this.returnFormat);

        fn(formatted);
      } else {
        fn(this.date);
      }
    };
  }

  onDateChange(newDate: string): void {
    this.date = newDate;
    this.onChange(newDate);
    this.onTouched();
    this.updateCalendarByDate(newDate);
    this.cdr.detectChanges();
  }

  changeShowDatePickerStatus(status: boolean): void {
    this.showDatePickerStatus = status;
  }

  clickOutSide(): void {
    this.showDatePickerStatus = false;
  }

  getSelectedDate(value: string): void {
    this.date = value;
    this.onChange(value);
    this.onTouched();

    if (this.closeOnSelectDate) {
      this.showDatePickerStatus = false;
    }

    const outputValue = this.returnFormat === 'timestamp'
      ? moment(value, this.dateFormat === "timestamp" ? '' : this.dateFormat).valueOf()
      : moment(value, this.dateFormat === "timestamp" ? '' : this.dateFormat)
        .format(this.returnFormat);

    this.selectedDate.emit(outputValue);
    this.updateCalendarByDate(value);
    this.cdr.detectChanges();

    this.changeInputEvent.emit();
  }

  private updateCalendarByDate(dateStr: string): void {
    const parsedDate = moment(dateStr, this.dateFormat === "timestamp" ? '' : this.dateFormat);
    if (!parsedDate.isValid()) {
      return;
    }
    this.selectedYear = parsedDate.year();
    this.selectedMonth = parsedDate.month();
    this.selectedDay = parsedDate.date();
    this.emitSelectedDate(false);
  }
}
