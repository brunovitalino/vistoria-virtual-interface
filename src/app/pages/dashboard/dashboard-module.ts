import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Dashboard } from './dashboard';
import { MatCardModule } from '@angular/material/card';



@NgModule({
  declarations: [
    Dashboard
  ],
  imports: [
    CommonModule,
    MatCardModule
  ]
})
export class DashboardModule { }
