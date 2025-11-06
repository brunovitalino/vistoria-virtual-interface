import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainLayout } from './main-layout';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { SharedModule } from '../../shared/shared-module';



@NgModule({
  declarations: [
    MainLayout
  ],
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    SharedModule
  ]
})
export class MainLayoutModule { }
