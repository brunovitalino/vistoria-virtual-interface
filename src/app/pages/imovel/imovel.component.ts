import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ImovelApiService } from './services/imovel-api.service';
import { ImovelPdfService } from './services/imovel-pdf.service';
import { Imovel } from './models/imovel';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'app-imovel',
  standalone: false,
  templateUrl: './imovel.component.html',
  styleUrl: './imovel.component.css',
})
export class ImovelComponent {

  fileUploaded?: File;
  imovelFormGroup?: FormGroup;

  loading = false;
  saving = false;
  dragOver = false;

  gridColsNumber = 2; // padrão para desktop

  constructor(
    private formBuilder: FormBuilder,
    private imovelPdfService: ImovelPdfService,
    private imovelApiService: ImovelApiService,
    private breakpointObserver: BreakpointObserver
  ) {}

  ngOnInit() {
    this.apliqueResponsividadeNoFormularioDeImovel();
  }

  private apliqueResponsividadeNoFormularioDeImovel(): void { // Quando for tela pequena (celular), muda para 1 coluna
    this.breakpointObserver.observe([Breakpoints.Handset])
      .subscribe(result => {
        this.gridColsNumber = result.matches ? 1 : 2;
      });
  }

  // DRAG & DROP, para upload moderno
  onDragOver(ev: DragEvent): void {
    ev.preventDefault();
    this.dragOver = true;
  }

  onDragLeave(ev: DragEvent): void {
    ev.preventDefault();
    this.dragOver = false;
  }

  onDrop(ev: DragEvent): void {
    ev.preventDefault();
    this.dragOver = false;

    if (ev.dataTransfer?.files?.length) {
      const file = ev.dataTransfer.files[0];
      if (file.type === 'application/pdf') {
        this.fileUploaded = file;
      }
    }
  }

  // Para upload tradicional
  onFileSelected(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      if (file.type === 'application/pdf') {
        this.fileUploaded = file;
      }
    }
  }

  async extrairDadosDoPdf(): Promise<void> {
    if (!this.fileUploaded) return;

    this.loading = true;
    try {
      const texto = await this.imovelPdfService.getPdfInfoEmTexto(this.fileUploaded);
      const imovel = this.imovelPdfService.buildFormDoImovel(texto, this.fileUploaded.name);
      this.buildImovelFormGroup(imovel);
    } finally {
      this.loading = false;
    }
  }

  buildImovelFormGroup(imovel: Imovel): void {
    this.imovelFormGroup = this.formBuilder.group({
      categoria: [imovel.categoria, Validators.required],
      uf: [imovel.uf],
      municipio: [imovel.municipio],
      distrito: [imovel.distrito],
      bairro: [imovel.bairro],
      endereco: [imovel.endereco],
      numero: [imovel.numero],
      cep: [imovel.cep],

      areaConstruida: [imovel.areaConstruida],
      areaTerreno: [imovel.areaTerreno],
      testada: [imovel.testada],

      vistoria: [imovel.vistoria],
      usoDaUnidade: [imovel.usoDaUnidade],
      ocupacao: [imovel.ocupacao],
      dataVistoria: [imovel.dataVistoria],
      observacoes: [imovel.observacoes],

      origemPreenchimento: [imovel.origemPreenchimento],
      arquivoNome: [imovel.arquivoNome],
    });
  }

  isCasaOuApto(): boolean {
    const categoria = this.imovelFormGroup?.get('categoria')?.value;
    return categoria === 'Casa' || categoria === 'Apartamento';
  }

  // ========= SAVE =========
  salvar(): void {
    if (!this.imovelFormGroup) return;
    if (this.imovelFormGroup.invalid) {
      this.imovelFormGroup.markAllAsTouched();
      return;
    }

    this.saving = true;

    // this.imovelApiService.save(this.form.value).subscribe({
    //   next: () => {
    //     this.saving = false;
    //     alert('Dados salvos!');
    //   },
    //   error: () => {
    //     this.saving = false;
    //     alert('Erro ao salvar.');
    //   }
    // });
    // this.imovelApiService.save(this.form.value);
    console.log('FORMULARIO SALVO:', this.imovelFormGroup.value);
    this.saving = false;
  }

}
