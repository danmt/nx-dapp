import { Directive, Input} from '@angular/core';

@Directive({
  selector: '[nxDappSetDarkTheme]'
})
export class SetDarkThemeDirective {

  @Input('nxDappSetDarkTheme') set darkThemeValue(value: boolean | null) {
    this.setDarkTheme(!!value);
    
  } 
  
  setDarkTheme(value: boolean) {
    const bodyClass = document.body.className;
    if (value) {
      document.body.className += ' darkMode'; 
    } 
    else {
      document.body.className = bodyClass.replace('darkMode', '');
    }
  }
}
  