import { NgModule } from '@angular/core';

import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';

@NgModule({
  exports: [FormsModule, MatDialogModule]
})
export class MaterialModule { }
