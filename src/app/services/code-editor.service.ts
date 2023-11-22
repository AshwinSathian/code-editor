import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LANGUAGE_OPTIONS } from '../constants/language-options';

@Injectable({ providedIn: 'root' })
export class CodeEditorService {
  private _selectedLanguage = new BehaviorSubject(
    LANGUAGE_OPTIONS[0].value.code
  );
  selectedLanguage$ = this._selectedLanguage.asObservable();

  private _code = new BehaviorSubject(LANGUAGE_OPTIONS[0].value.starter);
  code$ = this._code.asObservable();

  setLanguage(language: string) {
    this._selectedLanguage.next(language);
  }

  setCode(code: string) {
    this._code.next(code);
  }
}
