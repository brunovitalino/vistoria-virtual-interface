import { TestBed } from '@angular/core/testing';

import { ImovelApiService } from './imovel-api.service';

describe('ImovelApiService', () => {
  let service: ImovelApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImovelApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
