import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private _selectedLanguage = new BehaviorSubject('html');
  selectedLanguage$ = this._selectedLanguage.asObservable();

  setLanguage(language: string) {
    this._selectedLanguage.next(language);
  }
}
