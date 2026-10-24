import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-biology-page',
  imports: [RouterLink],
  templateUrl: './biology-page.html',
  styleUrl: './biology-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BiologyPage {}
