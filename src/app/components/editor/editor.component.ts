import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { MenubarModule } from 'primeng/menubar';
import { EDITOR_OPTIONS } from '../../constants/editor-options';
import { LANGUAGE_OPTIONS } from '../../constants/language-options';
import { Languages } from '../../enums/languages.enum';
import { Language } from '../../interfaces/language';
import { CodeEditorService } from '../../services/code-editor.service';
import { Subject, distinct, filter, takeUntil } from 'rxjs';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MonacoEditorModule,
    MenubarModule,
    InputTextModule,
    ButtonModule,
    DropdownModule,
  ],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.css',
})
export class EditorComponent implements OnInit, OnDestroy {
  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;
  @Input() code?: string;

  private worker?: Worker;
  fileName = 'Untitled';
  uploadFileName = '';
  editingFileName = false;
  editorOptions = EDITOR_OPTIONS;
  editorMenuItems = [
    {
      label: 'File',
      icon: 'pi pi-file',
      items: [
        {
          label: 'Import from file',
          icon: 'pi pi-upload',
          command: () => this.fileInput?.nativeElement.click(),
        },
        {
          label: 'Export',
          icon: 'pi pi-download',
          command: () => this.download(),
        },
      ],
    },
    {
      label: 'View',
      icon: 'pi pi-eye',
      items: [
        {
          label: 'Toggle Theme',
          icon: 'pi pi-sun',
          command: () => this.toggleTheme(),
        },
      ],
    },
  ];
  languageOptions: {
    label: string;
    value: Language;
  }[] = LANGUAGE_OPTIONS;
  selectedLanguage: Language = LANGUAGE_OPTIONS[0].value;
  loading = false;

  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private service: CodeEditorService,
    private _sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.service.selectedLanguage$
      .pipe(
        filter((l) => !!l),
        distinct(),
        takeUntil(this.destroy$)
      )
      .subscribe((language) => {
        if (language) {
          this.selectedLanguage =
            LANGUAGE_OPTIONS?.find((l) => l.value.code === language)?.value ||
            LANGUAGE_OPTIONS[0].value;
        }
      });

    this.service.code$
      .pipe(
        filter((l) => !!l),
        distinct(),
        takeUntil(this.destroy$)
      )
      .subscribe((code) => {
        if (code) {
          this.code = code;
        }
      });

    if (typeof Worker !== 'undefined') {
      this.worker = new Worker(
        new URL('./file-reader.worker', import.meta.url),
        { type: 'module' }
      );

      this.worker.onmessage = ({ data }) => {
        this.loading = false;
        if (data?.success) {
          if (data.code) {
            this.code = data.code;
            this.service.setCode(this.selectedLanguage.starter);
            this.fileName = this.uploadFileName;
          }
        } else {
          // this.errorOccured = true;
          // this.output = data?.error || 'Unexpected Error Occured';
        }
      };
    } else {
      // this.errorOccured = true;
      // this.output = 'Web Workers are not supported in your browser';
    }
  }

  codeChanged(code: any) {
    if (this.selectedLanguage.code === Languages.html) {
      code = this._sanitizer.bypassSecurityTrustHtml(code);
    }

    this.service.setCode(code);
  }

  toggleTheme() {
    if (this.editorOptions.theme === 'vs-dark') {
      this.editorOptions = { ...this.editorOptions, theme: 'vs-light' };
    } else {
      this.editorOptions = { ...this.editorOptions, theme: 'vs-dark' };
    }
  }

  toggleLanguage() {
    this.editorOptions = {
      ...this.editorOptions,
      language: this.selectedLanguage.code,
    };
    this.service.setLanguage(this.selectedLanguage.code);
    this.service.setCode(this.selectedLanguage.starter);
  }

  download() {
    const a = document.createElement('a');
    a.setAttribute(
      'href',
      `data:${this.selectedLanguage.mimeType};charset=utf-8,` +
        encodeURIComponent(this.code as string)
    );
    a.setAttribute('download', this.fileName);
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (!input.files?.length) {
      return;
    }

    this.loading = true;
    const file = input.files[0];
    let fileNameSections = file.name?.split('.');
    if (fileNameSections?.length) {
      fileNameSections.pop();
      this.uploadFileName = fileNameSections?.join('.');
    }
    this.worker?.postMessage(file);
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
