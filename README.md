# Persian Date Ranger

## Overview

Overview
The Persian Date Ranger is a comprehensive date picker component for Angular projects. It supports both Persian (Jalali) and Gregorian calendars.

With features like date range selection, customizable date formats, and advanced navigation, it allows seamless integration of Persian or Gregorian date pickers into any Angular application.

This package is free to use and is ideal for applications that need bilingual calendar support for both Persian and international users.

<img src="https://github.com/hadirajabi80/screenshots/blob/main/assets/img-date-picker.png" alt="Sample Image" />

---

## Features

Persian Calendar: Provides a Persian (Jalali) date picker.
Date Range Picker (rangePicker): Enables users to select a date range for reservations or any other use cases.
Customizable Date Formats: Supports various date formats including YYYY-MM-DD, jYYYY/jMM/jDD, and others.
Positioning: The calendar can be positioned relative to the input element using the stickyFlipPosition directive.

---

## Installation

To install the Persian Date Ranger package, use the following command:

```bash
npm install persian-date-ranger
```

Make sure you have the following peer dependencies installed in your Angular project:

```
@angular/common version ^16.0.0
@angular/core version ^16.0.0
```

---

## Usage

Import the Module
In your Angular module (e.g., app.module.ts), import the PersianDateRangerModule:

```typescript
import {PersianDateRangerModule} from 'persian-date-ranger';

@NgModule({
  declarations: [AppComponent],
  imports: [PersianDateRangerModule],
  bootstrap: [AppComponent]
})
export class AppModule {
}
```

Using the Component in HTML
To use the PersianDateRanger in your component's template:

```html

<persian-date-ranger
  [placeholder]="'Select a date'"
  (selectedDate)="onDateSelected($event)">
</persian-date-ranger>
```

Or

```html

<persian-date-ranger
  [placeholder]="'Select a date'"
  [(ngModel)]="date"
  (selectedDate)="onDateSelected($event)">
</persian-date-ranger>
```

Example of Range Picker (For Reservation)
You can use the rangePicker feature to allow users to select a range of dates:

```html

<persian-date-ranger
  [minDate]="'1400/01/01'"
  [maxDate]="'1403/01/01'"
  (selectedDate)="onDateRangeSelected($event)">
</persian-date-ranger>
```

If you want to use the calendar only for display, you can use the following tag:

```html

<persian-date-calendar></persian-date-calendar>
```

To select a specific date for display, you can use the following tag:

```html

<persian-date-calendar [selectedMonth]="8" selectedDay="2" [selectedYear]="1403"></persian-date-calendar>
```

You can also use the Gregorian version of the component in the exact same way:

```html

<gregorian-date-ranger
  [placeholder]="'Select a Gregorian date'"
  [(ngModel)]="gregorianDate"
  (selectedDate)="onDateSelected($event)">
</gregorian-date-ranger>
```

Example for range selection with Gregorian date:

```html

<gregorian-date-ranger
  [minDate]="'2020-01-01'"
  [maxDate]="'2026-01-01'"
  [rangePicker]="true"
  (selectedDate)="onDateRangeSelected($event)">
</gregorian-date-ranger>
```

---

## API

### Inputs

| Input               | Type                            | Description                                                                                                                 |
|---------------------|---------------------------------|-----------------------------------------------------------------------------------------------------------------------------|
| showNearMonthDays   | boolean                         | Determines whether the days from the previous and next months should be displayed. Default is `true`.                       |
| showGotoToday       | boolean                         | If `true`, shows a button to quickly go to today's date. Default is `true`.                                                 |
| enableChangeMonth   | boolean                         | Allows or disables the ability to change the month. Default is `true`.                                                      |
| enableChangeYear    | boolean                         | Allows or disables the ability to change the year. Default is `true`.                                                       |
| enableNavigateMonth | boolean                         | Enables or disables the navigation of months using arrows. Default is `true`.                                               |
| enableNavigateYear  | boolean                         | Enables or disables the navigation of years using arrows. Default is `true`.                                                |
| currentMonthShadow  | boolean                         | If `true`, adds a shadow effect to the current month in the calendar. Default is `false`.                                   |
| closeOnSelectDate   | boolean                         | Determines whether the calendar closes automatically when a date is selected. Default is `false`.                           |
| rangePicker         | boolean                         | If `true`, enables the date range picker, allowing users to select a start and end date. Default is `false`.                |
| startDate           | any                             | The start date for the date range when `rangePicker` is enabled.                                                            |
| endDate             | any                             | The end date for the date range when `rangePicker` is enabled.                                                              |
| showCurrentDate     | boolean                         | If `true`, highlights the current date in the calendar. Default is `false`.                                                 |
| holidays            | { format: string, date: any[] } | Allows you to highlight holidays on the calendar. The `format` is the date format, and `date` is an array of holiday dates. |
| minDate             | string                          | The minimum date allowed for selection. Format: `DateFormat`.                                                               |
| maxDate             | string                          | The maximum date allowed for selection. Format: `DateFormat`.                                                               |
| selectedYear        | number                          | The default selected year in the calendar. Default is the current Persian year.                                             |
| selectedMonth       | number                          | The default selected month in the calendar. Default is the current Persian month.                                           |
| selectedDay         | number                          | The default selected day in the calendar. Default is the current Persian day.                                               |
| calendarMode        | boolean                         | If `true`, enables the calendar mode for date selection. Default is `false`.                                                |
| datePickerMode      | boolean                         | If `true`, enables the date picker mode, allowing users to select a single date. Default is `false`.                        |
| dateFormat          | DateFormat                      | The format for displaying and inputting the date. Possible values include `DateFormat`.                                     |
| defaultValue        | boolean                         | If `true`, the default value is selected when the calendar is first opened. Default is `false`.                             |
| datesBetween        | string[]                        | An array of dates that are part of the selected range. Only applicable if `rangePicker` is enabled.                         |
| minDate             | DateFormat                      | The minimum date allowed for selection. Format: DateFormat.                                                                 |
| maxDate             | DateFormat                      | The maximum date allowed for selection. Format: DateFormat.                                                                 |
| placeholder         | string                          | Placeholder text for the input field.                                                                                       |
| inputClass          | string                          | Custom CSS classes for the input element.                                                                                   |
| rangePicker         | boolean                         | Enables or disables date range selection.                                                                                   |
| returnFormat        | DateFormat                      | The format of the returned date. Possible values: DateFormat.                                                               |
| displayMode         | string                          | Controls the display mode of the date picker. Options: inline, popup.                                                       |
| position            | string                          | Defines the position of the calendar relative to the input. Available positions: Positions.                                 |
| inputDirective      | string                          | Used to pass a directive to the input and use it within the component, the inputDirective is employed.                      |
| useNgModelAsInitial | boolean                         | If you don't want to use ngModel for the initial value.                                                                     |

### Outputs

| Output       | Type         | Description                                                                                           |
|--------------|--------------|-------------------------------------------------------------------------------------------------------|
| selectedDate | EventEmitter | Emits the selected date (in the specified format). Example: `(selectedDate)="onDateSelected($event)"` |

### Methods

| Method                     | Description                                                                      |
|----------------------------|----------------------------------------------------------------------------------|
| writeValue(value: any)     | Writes the selected date to the component. Can be used to set the initial value. |
| registerOnChange(fn: any)  | Registers a callback to handle changes in the selected date.                     |
| registerOnTouched(fn: any) | Registers a callback to handle when the input is touched.                        |

## Features in Detail

rangePicker
The rangePicker feature allows users to select multiple dates in a range (e.g., for reservations). Once enabled, it allows selecting a start date and end date. This feature can be enhanced in future versions to handle more complex range-based use cases.

minDate and maxDate
The minDate and maxDate inputs let you restrict the date range the user can select. These dates should be passed in Jalali format (jYYYY/jMM/jDD).

Example usage:

```html

<persian-date-ranger
  [minDate]="'1400/01/01'"
  [maxDate]="'1403/01/01'"
  (selectedDate)="onDateSelected($event)">
</persian-date-ranger>
```

## Date Formats

This package supports several date formats:

jYYYY/jMM/jDD: Persian date format (default).
jYYYY-jMM-jDD: Alternative Persian date format.
timestamp: Returns the date as a Unix timestamp.
YYYY-MM-DD: Gregorian date format.
Example usage for date formats:

### Positions

```typescript
position-top
position-bottom
position-left
position-right
position-top-right
position-top-left
position-bottom-right
position-bottom-left
```

### DateFormat

```typescript
'YYYYMMDD'
'YYYY-MM-DD'
'YYYY/MM/DD'
'jYYYY/jMM/jDD'
'jYYYY-jMM-jDD'
'jYYYYjMMjDD'
'timestamp'
```

```html

<persian-date-ranger [returnFormat]="'YYYY-MM-DD'"></persian-date-ranger>

or

<georgian-date-ranger [returnFormat]="'YYYY-MM-DD'"></georgian-date-ranger>
```

## Conclusion

You can also use `ngModel`, `ngModelChange`, or Forms to capture the data. This feature allows you to easily retrieve data from the inputs and interact with it through two-way binding.

The Persian Date Ranger is a powerful and flexible component for integrating a Persian (Jalali) calendar in Angular applications. It offers a wide range of features, including customizable date formats, date range selection, and flexible positioning, making it perfect for projects that require Persian date support.
