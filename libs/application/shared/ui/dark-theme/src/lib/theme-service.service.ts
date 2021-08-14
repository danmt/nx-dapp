import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class ThemeService {
  private _isDarkThemeStoredOn = localStorage.getItem('darkTheme') === 'true';
  private _darkTheme = new BehaviorSubject<boolean>(this._isDarkThemeStoredOn);
  isDarkTheme$ = this._darkTheme.asObservable();

  setDarkTheme(isDarkThemeOn: boolean) {
    this._darkTheme.next(isDarkThemeOn);
    localStorage.setItem('darkTheme', isDarkThemeOn.toString());
  }
}