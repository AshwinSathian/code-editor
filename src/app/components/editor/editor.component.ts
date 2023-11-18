import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
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
import { LanguageService } from '../../services/language.service';

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
export class EditorComponent implements OnInit {
  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;
  @Input() code?: string;
  @Output() codeChange = new EventEmitter<string>();

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
  languageEmitter = new EventEmitter<string>();

  constructor(
    private service: LanguageService,
    private _sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
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
            this.codeChange.emit(this.selectedLanguage.starter);
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
    } else if (
      [Languages.javascript, Languages.typescript].includes(
        this.selectedLanguage.code as Languages
      )
    ) {
      code = this._sanitizer.bypassSecurityTrustScript(code);
    }
    this.codeChange.emit(code);
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
    this.codeChange.emit(this.selectedLanguage.starter);
    this.service.setLanguage(this.selectedLanguage.code);
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
}
