import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Subject, combineLatest, distinct, filter, takeUntil } from 'rxjs';
import * as ts from 'typescript';
import { Languages } from '../../enums/languages.enum';
import { CodeEditorService } from '../../services/code-editor.service';

@Component({
  selector: 'app-output',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatToolbarModule],
  templateUrl: './output.component.html',
  styleUrl: './output.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class OutputComponent implements OnInit, OnDestroy {
  private worker?: Worker;
  code?: string;
  selectedLanguage?: string;
  output = '';
  errorOccured = false;
  loading = false;
  Languages = Languages;

  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(private service: CodeEditorService) {}

  ngOnInit(): void {
    combineLatest([this.service.selectedLanguage$, this.service.code$])
      .pipe(
        filter((l) => !!l),
        distinct(),
        takeUntil(this.destroy$)
      )
      .subscribe(([language, code]) => {
        this.selectedLanguage = language;
        this.code = code;
        this.output =
          this.selectedLanguage === Languages.html ? this.code || '' : '';
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

    this.errorOccured = false;
    let code = this.code;

    if (this.selectedLanguage === Languages.typescript) {
      code = ts.transpile(code as string);
    }

    this.worker?.postMessage({ code });
  }

  prettyPrintJSON() {
    this.errorOccured = false;
    try {
      const parsedJson = JSON.parse(this.code as string);
      this.output = JSON.stringify(parsedJson, null, 2);
    } catch (e) {
      this.errorOccured = true;
      this.output = 'Invalid JSON';
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
