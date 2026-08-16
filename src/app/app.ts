import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from '@app/utils/services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `<router-outlet />`,
  styles: []
})
export class App {
  constructor(private themeService: ThemeService) {}
}
