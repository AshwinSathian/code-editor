import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { MenubarModule } from 'primeng/menubar';
import { Subject, distinct, filter, takeUntil } from 'rxjs';
import { LanguageService } from '../../services/language.service';
import * as ts from 'typescript';
import { Languages } from '../../enums/languages.enum';

@Component({
  selector: 'app-output',
  standalone: true,
  imports: [CommonModule, ButtonModule, MenubarModule],
  templateUrl: './output.component.html',
  styleUrl: './output.component.css',
})
export class OutputComponent implements OnInit, OnDestroy {
  @Input() code?: string;

  private worker?: Worker;
  selectedLanguage?: string;
  output = '';
  errorOccured = false;
  loading = false;
  Languages = Languages;

  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(private service: LanguageService) {}

  ngOnInit(): void {
    this.service.selectedLanguage$
      .pipe(
        filter((l) => !!l),
        distinct(),
        takeUntil(this.destroy$)
      )
      .subscribe((language) => {
        if (language) {
          this.selectedLanguage = language;
        }
      });

    if (typeof Worker !== 'undefined') {
      this.worker = new Worker(
        new URL('./code-evaluator.worker', import.meta.url),
        { type: 'module' }
      );

      this.worker.onmessage = ({ data }) => {
        this.loading = false;
        if (data?.success) {
          if (data.result) {
            this.output = data.result;
          }
        } else {
          this.errorOccured = true;
          this.output = data?.error || 'Unexpected Error Occured';
        }
      };
    } else {
      this.errorOccured = true;
      this.output = 'Web Workers are not supported in your browser';
    }
  }

  runCode() {
    this.loading = true;
    this.output = '';
    this.errorOccured = false;
    let code = this.code;

    if (this.selectedLanguage === 'typescript') {
      code = ts.transpile(code as string);
    }

    this.worker?.postMessage({ code: code });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
