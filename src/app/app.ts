import { Component } from '@angular/core';
import { HeroComponent } from './hero/hero';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HeroComponent],
  template: `<app-hero></app-hero>`,
})
export class App {}
