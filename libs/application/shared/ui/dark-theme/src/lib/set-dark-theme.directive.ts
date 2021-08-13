import { Directive, ElementRef, Input} from '@angular/core';

@Directive({
  selector: '[nxDappSetDarkTheme]'
})
export class SetDarkThemeDirective {

  constructor(private el: ElementRef) { 
    console.log(el);
  }

  @Input('nxDappSetDarkTheme') set darkThemeValue(value: boolean) {
    this.setDarkTheme(value);
  } 
  
  setDarkTheme(value: boolean) {
    const bodyClass = document.body.className;
    if (value) document.body.className += ' darkMode'; 
    else document.body.className = bodyClass.replace('darkMode', '');
  }

}
