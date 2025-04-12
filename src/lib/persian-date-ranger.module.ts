import {NgModule} from '@angular/core';
import {CommonModule, NgClass} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {PersianDateRangerComponent} from "./persian-date-ranger/persian-date-ranger.component";
import {PersianDateCalendarComponent} from "./persian-date-calendar/persian-date-calendar.component";
import {OutsideDirective} from "./directives/outside.directive";
import {StickyFlipPositionDirective} from "./directives/dynamic-position.directive";
import {GregorianDateCalendarComponent} from "./gregorian-date-calendar/gregorian-date-calendar.component";
import {GregorianDateRangerComponent} from "./gregorian-date-ranger/gregorian-date-ranger.component";


@NgModule({
  declarations: [
    PersianDateRangerComponent,
    PersianDateCalendarComponent,
    GregorianDateCalendarComponent,
    GregorianDateRangerComponent,
    OutsideDirective,
    StickyFlipPositionDirective
  ],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [
    PersianDateRangerComponent,
    PersianDateCalendarComponent,
    GregorianDateCalendarComponent,
    GregorianDateRangerComponent
  ]
})
export class PersianDateRangerModule {
}
