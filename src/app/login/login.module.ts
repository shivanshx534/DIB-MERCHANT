import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { LoginComponent } from './login';

@NgModule({
  imports: [CommonModule, FormsModule, LoginComponent],
  exports: [LoginComponent],
})
export class LoginModule {}
