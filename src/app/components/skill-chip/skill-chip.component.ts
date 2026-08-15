import { Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-skill-chip',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './skill-chip.component.html',
  styleUrl: './skill-chip.component.scss'
})
export class SkillChipComponent {
  // Inputs
  value     = input.required<string>();
  variant   = input<'default' | 'interest'>('default');
  removable = input<boolean>(true);

  // Outputs
  valueChange = output<string>();
  removed     = output<void>();

  // Internal edit state — fully self-contained
  editing   = signal(false);
  editValue = '';

  startEdit() {
    this.editValue = this.value();
    this.editing.set(true);
    setTimeout(() => {
      const el = document.querySelector<HTMLInputElement>('.skill-chip-edit-input');
      if (el) { el.focus(); el.select(); }
    }, 0);
  }

  commit() {
    const v = this.editValue.trim();
    if (v && v !== this.value()) this.valueChange.emit(v);
    this.editing.set(false);
  }

  cancel() { this.editing.set(false); }
}
