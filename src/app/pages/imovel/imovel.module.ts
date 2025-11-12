import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import { ImovelComponent } from './imovel.component';
import { ImovelRoutingModule } from './imovel-routing.module';
import { ImovelApiService } from './services/imovel-api.service';
import { ImovelPdfService } from './services/imovel-pdf.service';


@NgModule({
  declarations: [
    ImovelComponent
  ],
  imports: [
    CommonModule,
    ImovelRoutingModule,

    FormsModule,
    ReactiveFormsModule,

    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressBarModule,
    MatProgressSpinnerModule
  ],
  providers: [
    ImovelPdfService,
    ImovelApiService
  ]
})
export class ImovelModule { }
