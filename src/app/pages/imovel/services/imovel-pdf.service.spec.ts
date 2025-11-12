import { TestBed } from '@angular/core/testing';

import { ImovelPdfService } from './imovel-pdf.service';

describe('ImovelPdfService', () => {
  let service: ImovelPdfService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImovelPdfService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
