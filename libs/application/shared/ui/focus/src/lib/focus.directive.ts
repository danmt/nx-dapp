import { Directive, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[nxDappFocus]',
})
export class FocusDirective {
  @Input() set nxDappFocus(value: boolean) {
    if (value) {
      this.element.nativeElement.focus();
    }
  }

  constructor(private element: ElementRef<HTMLInputElement>) {}
}
