import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ImovelComponent } from './imovel.component';

const routes: Routes = [
  { path: '', component: ImovelComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ImovelRoutingModule { }
