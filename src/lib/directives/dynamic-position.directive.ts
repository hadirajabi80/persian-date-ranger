import { Directive, ElementRef, Renderer2, OnInit, OnDestroy, Input, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { fromEvent, Subscription, Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

@Directive({
  selector: '[stickyFlipPosition]'
})
export class StickyFlipPositionDirective implements OnInit, OnDestroy {
  private readonly el = inject(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly destroy$ = new Subject<void>();

  @Input() position: 'position-top' | 'position-bottom' | 'position-left' | 'position-right' | 'position-top-right' | 'position-top-left' | 'position-bottom-right' | 'position-bottom-left' = 'position-bottom';

  ngOnInit() {
    if (typeof window !== 'undefined') {
      fromEvent(window, 'scroll').pipe(
        debounceTime(10),
        takeUntil(this.destroy$)
      ).subscribe(() => this.adjustPosition());

      fromEvent(window, 'resize').pipe(
        debounceTime(10),
        takeUntil(this.destroy$)
      ).subscribe(() => this.adjustPosition());

      this.adjustPosition();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private adjustPosition() {
    const calendarElement = this.el.nativeElement.querySelector('persian-date-calendar');
    if (calendarElement) {
      this.resetStickyPosition();
      this.renderer.addClass(calendarElement, this.position);
    }
  }

  private resetStickyPosition() {
    const calendarElement = this.el.nativeElement.querySelector('persian-date-calendar');
    if (calendarElement) {
      const positions = [
        'position-top',
        'position-bottom',
        'position-left',
        'position-right',
        'position-top-right',
        'position-top-left',
        'position-bottom-right',
        'position-bottom-left'
      ];
      positions.forEach(pos => this.renderer.removeClass(calendarElement, pos));
    }
  }
}
