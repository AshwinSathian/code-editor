import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { MenubarModule } from 'primeng/menubar';
import { LanguageService } from '../../services/language.service';
import { Language } from '../../interfaces/language';
import { languageOptions } from './language-options';

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
export class EditorComponent {
  @Input() code?: string;
  @Output() codeChange = new EventEmitter<string>();

  fileName = 'Untitled';
  editingFileName = false;
  editorOptions = {
    theme: 'vs-dark',
    language: 'html',
    autoIndent: true,
    formatOnPaste: true,
    formatOnType: true,
  };
  editorMenuItems = [
    {
      label: 'File',
      icon: 'pi pi-file',
      items: [
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
  }[] = languageOptions;
  selectedLanguage: Language = {
    label: 'HTML',
    code: 'html',
    extension: 'html',
    mimeType: 'text/html',
    starter: '<h1>Hello, World!</h1>',
    icon: 'assets/html.png',
  };
  languageEmitter = new EventEmitter<string>();

  constructor(private service: LanguageService) {}

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
}
