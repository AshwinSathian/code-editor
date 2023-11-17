import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { EditorComponent } from './components/editor/editor.component';
import { OutputComponent } from './components/output/output.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, EditorComponent, OutputComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  code = '<h1>Hello, World!</h1>';
  selectedLanguage = 'html';

  setLanguage(language: any) {
    console.log(1, language);
    this.selectedLanguage = language as string;
  }
}
