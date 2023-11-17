import { Languages } from '../enums/languages.enum';

export const LANGUAGE_OPTIONS = [
  {
    label: 'HTML',
    value: {
      label: 'HTML',
      code: Languages.html,
      extension: 'html',
      mimeType: 'text/html',
      starter: '<h1>Hello, World!</h1>',
      icon: 'assets/html.png',
    },
  },
  {
    label: 'Javascript',
    value: {
      label: 'Javascript',
      code: Languages.javascript,
      extension: 'js',
      mimeType: 'text/javascript',
      starter: "console.log('Hello, World!')",
      icon: 'assets/js.png',
    },
  },
  {
    label: 'Typescript',
    value: {
      label: 'Typescript',
      code: Languages.typescript,
      extension: 'ts',
      mimeType: 'text/typescript',
      starter: "console.log('Hello, World!')",
      icon: 'assets/ts.png',
    },
  },
  // {
  //   label: 'JSON',
  //   value: { extension: 'json', mimeType: 'application/json' },
  // },
];
