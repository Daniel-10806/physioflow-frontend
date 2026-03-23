import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  styles: [`

:host {
  display: block;
}

/* TITLE */

h2 {
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 10px;
}

/* CONTAINER */

.dialog-container {

  display: flex;
  gap: 14px;
  align-items: flex-start;
  padding-top: 6px;

}

/* ICON */

.dialog-icon {

  color: #ef4444;
  font-size: 42px;

}

/* TEXT */

.dialog-message {

  font-size: 14px;
  color: #334155;
  line-height: 1.5;

}

/* ACTIONS */

mat-dialog-actions {

  margin-top: 18px;

}

/* CANCEL */

.cancel-btn {

  border-radius: 10px;

  padding: 6px 18px;

  font-weight: 600;

}

/* DELETE */

.delete-btn {

  background: linear-gradient(
    135deg,
    #ef4444,
    #dc2626
  );

  color: white !important;

  border-radius: 10px;

  font-weight: 700;

  padding: 6px 20px;

  box-shadow:
    0 4px 10px rgba(0,0,0,.2);

}

/* HOVER */

.delete-btn:hover {

  transform: translateY(-1px);

  box-shadow:
    0 6px 14px rgba(0,0,0,.25);

}

`],
  template: `

<h2 mat-dialog-title>
  CONFIRMAR ELIMINACIÓN
</h2>

<mat-dialog-content>

  <div class="dialog-container">

    <mat-icon class="dialog-icon">
      warning
    </mat-icon>

    <div class="dialog-message">
      {{ data.message }}
    </div>

  </div>

</mat-dialog-content>


<mat-dialog-actions align="end">

  <button
    mat-button
    class="cancel-btn"
    [mat-dialog-close]="false"
  >
    CANCELAR
  </button>

  <button
    mat-raised-button
    class="delete-btn"
    [mat-dialog-close]="true"
  >
    ELIMINAR
  </button>

</mat-dialog-actions>

`
})
export class ConfirmDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }
}