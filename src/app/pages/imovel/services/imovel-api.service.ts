import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Imovel } from '../models/imovel';

@Injectable({
  providedIn: 'root',
})
export class ImovelApiService {

  constructor(private http: HttpClient) {}

  save(imovel: Imovel) {
    // return this.http.post('/api/imoveis', imovel);
    console.log('FORMULARIO SALVO:', imovel);
  }
  
}
