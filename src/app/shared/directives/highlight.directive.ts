import { Directive } from '@angular/core';

@Directive({
  selector: '[appHighlight]',
  standalone: true
})
export class HighlightDirective {

  constructor() { 
    console.log('HighlightDirective initialized');
  }

}
