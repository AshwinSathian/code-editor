import { Actions } from '../enums/actions.enum';
import { Languages } from '../enums/languages.enum';
import { Language } from '../interfaces/language';

export const LANGUAGE_OPTIONS: Language[] = [
  {
    label: 'HTML',
    code: Languages.html,
    extension: 'html',
    mimeType: 'text/html',
    starter: '<h1>Hello, World!</h1>',
    icon: 'assets/html.png',
  },
  {
    label: 'Javascript',
    code: Languages.javascript,
    extension: 'js',
    mimeType: 'text/javascript',
    starter: `function calculateFactorial(num) { 
    if (num < 0) { 
      return 'Error: Negative number';
    }
        
    let result = 1;
    for (let i = 2; i <= num; i++) {
      result *= i;
    }
        
    return result;
}
      
const number = 5;
const factorial = calculateFactorial(number);
console.log('The factorial of ' + number + ' is ' + factorial);
      `,
    icon: 'assets/js.png',
    actions: [Actions.run_code],
  },
  {
    label: 'Typescript',
    code: Languages.typescript,
    extension: 'ts',
    mimeType: 'text/typescript',
    starter: `class Greeter {
  greeting: string;

  constructor(message: string) {
    this.greeting = message;
  }

  greet(): string {
    return "Hello, " + this.greeting;
  }
}

let greeter = new Greeter("World");
console.log(greeter.greet());
      `,
    icon: 'assets/ts.png',
    actions: [Actions.run_code],
  },
  {
    label: 'JSON',
    code: Languages.json,
    extension: 'json',
    mimeType: 'application/json',
    starter: `{
     "user": { 
        "id": 101, 
        "name": "John Doe", 
        "email": "john.doe@example.com" 
     } 
}`,
    icon: 'assets/json.png',
    actions: [Actions.prettify],
  },
];
