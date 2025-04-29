import {NgModule} from '@angular/core';
import {CommonModule, NgClass} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {PersianDateRangerComponent} from "./persian-date-ranger/persian-date-ranger.component";
import {PersianDateCalendarComponent} from "./persian-date-calendar/persian-date-calendar.component";
import {OutsideDirective} from "./directives/outside.directive";
import {StickyFlipPositionDirective} from "./directives/dynamic-position.directive";
import {GregorianDateCalendarComponent} from "./gregorian-date-calendar/gregorian-date-calendar.component";
import {GregorianDateRangerComponent} from "./gregorian-date-ranger/gregorian-date-ranger.component";
import {PersianDateRangerDirective} from "./directives/persian-date-ranger.directive";
import {GregorianDateRangerDirective} from "./directives/gregorian-date-ranger.directive";
import {PersianEventCalendarComponent} from "./persian-event-calendar/persian-event-calendar.component";
import {GregorianEventCalendarComponent} from "./gregorian-event-calendar/gregorian-event-calendar.component";


@NgModule({
  declarations: [
    PersianDateRangerComponent,
    PersianDateCalendarComponent,
    GregorianDateCalendarComponent,
    GregorianDateRangerComponent,
    OutsideDirective,
    StickyFlipPositionDirective,
    PersianDateRangerDirective,
    GregorianDateRangerDirective,
    PersianEventCalendarComponent,
    GregorianEventCalendarComponent
  ],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [
    PersianDateRangerComponent,
    PersianDateCalendarComponent,
    GregorianDateCalendarComponent,
    GregorianDateRangerComponent,
    PersianDateRangerDirective,
    GregorianDateRangerDirective,
    PersianEventCalendarComponent,
    GregorianEventCalendarComponent
  ]
})
export class PersianDateRangerModule {
}
