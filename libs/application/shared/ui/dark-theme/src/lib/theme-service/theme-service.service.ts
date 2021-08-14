import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class ThemeService {
  private _darkTheme = new Subject<boolean>();
  isDarkTheme$ = this._darkTheme.asObservable();

  setDarkTheme(isDarkThemeOn: boolean) {
    this._darkTheme.next(isDarkThemeOn);
  }
}