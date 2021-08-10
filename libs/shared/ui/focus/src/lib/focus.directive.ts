import { Directive, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[nxDappFocus]',
})
export class FocusDirective {
  @Input() set nxDappFocus(value: boolean) {
    if (value) {
      console.log('i should be focused');
      setTimeout(() => {
        this.element.nativeElement.focus();
      }, 1000);
    }
  }

  constructor(private element: ElementRef<HTMLInputElement>) {}
}
