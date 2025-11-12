import { Injectable } from '@angular/core';
import * as pdfjs from 'pdfjs-dist';

import { Imovel } from '../models/imovel';
import { ImovelCategoria } from '../models/imovel-categoria';

const workerUrl = new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url);
const pdfWorker = new Worker(workerUrl, { type: 'module' });
(pdfjs as any).GlobalWorkerOptions.workerPort = pdfWorker;


@Injectable({
  providedIn: 'root',
})
export class ImovelPdfService {

  async getPdfInfoEmTexto(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const loadingTask = (pdfjs as any).getDocument({ data: buffer });
    const pdf = await loadingTask.promise;

    let text = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((it: any) => it.str).join('\n');
      text += pageText + '\n';
    }

    // console.log(text);

    return text;
  }

  getPdfTextoEmArrayNormalizado(text: string): string[] {
    return text
      .replace(/\r/g, '')
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);
  }

  detectarCategoria(lines: string[]): ImovelCategoria {
    const txt = lines.join(' ').toUpperCase();

    if (txt.includes('APARTAMENTO')) return 'APARTAMENTO';
    if (txt.includes('LOFT')) return 'LOFT';
    if (txt.includes('CASA')) return 'CASA';
    if (txt.includes('LOTE') || txt.includes('TERRENO')) return 'LOTE';

    return 'DESCONHECIDO';
  }

  isUF(s: string) {
    return /^[A-Z]{2}$/i.test(s.trim());
  }
  isCEP(s: string) {
    return /^\d{2}\.?\d{3}-?\d{3}$/.test(s.trim());
  }
  isCaps(s: string) {
    return /^[A-ZÇÃÕ ]{3,}$/.test(s.trim());
  }

  getArrayComoTexto(lines: string[]): string {
    return lines.map((l, i) => `${i} ${l}`).join('\n');
  }

  getArrayJuntandoUmGrupoDeElementos(lines: string[], indexInicialDaQuebra: number, indexFinalDaQuebra: number): string[] {
    const anteriores = lines.slice(0, indexInicialDaQuebra + 1);
    const meio = lines.slice(indexInicialDaQuebra + 1, indexFinalDaQuebra).join(' ');
    const posteriores = lines.slice(indexFinalDaQuebra); 
    return [
      ...anteriores,
      meio,
      ...posteriores
    ];
  }

  getArrayJuntandoValoresDeEndereco(lines: string[]) {
    const hemisferioIndex = lines.indexOf('Hemisfério');
    const datumIndex = lines.indexOf('Datum', hemisferioIndex);
    return this.getArrayJuntandoUmGrupoDeElementos(lines, hemisferioIndex, datumIndex);
  }
  
  getArrayJuntandoValoresDeVistoriaParaApartamento(lines: string[]) {
    const finalidadeIndex = lines.indexOf('Datum') + 7;
    const vistoriaIndex = lines.indexOf('Vistoria', finalidadeIndex);
    return this.getArrayJuntandoUmGrupoDeElementos(lines, finalidadeIndex, vistoriaIndex);
  }
  getArrayJuntandoValoresDeVistoriaParaLoft(lines: string[]) {
    const padraoDoEmpreendimentoIndex = lines.indexOf('Serviços Públicos e Comunitários') + 5;
    const estadoDeConservaçãoIndex = lines.indexOf('Vistoria', padraoDoEmpreendimentoIndex);
    return this.getArrayJuntandoUmGrupoDeElementos(lines, padraoDoEmpreendimentoIndex, estadoDeConservaçãoIndex);
  }
  getArrayJuntandoValoresDeVistoriaParaCasa(lines: string[]) {
    const finalidadeIndex = lines.indexOf('Finalidade');
    const vistoriaIndex = lines.indexOf('Vistoria', finalidadeIndex);
    return this.getArrayJuntandoUmGrupoDeElementos(lines, finalidadeIndex, vistoriaIndex);
  }
  getArrayJuntandoValoresDeVistoriaParaLote(lines: string[]) {
    const padraoDoEmpreendimentoIndex = lines.indexOf('Padrão do Empreendimento');
    const estadoDeConservaçãoIndex = lines.indexOf('Estado de Conservação', padraoDoEmpreendimentoIndex) - 3;
    return this.getArrayJuntandoUmGrupoDeElementos(lines, padraoDoEmpreendimentoIndex, estadoDeConservaçãoIndex);
  }

  buildImovelApartamento(lines: string[]): any {
    lines = this.getArrayJuntandoValoresDeEndereco(lines);
    lines = this.getArrayJuntandoValoresDeVistoriaParaApartamento(lines);
    return {
      categoria: 'Apartamento',
      uf: lines[70],
      municipio: lines[15],
      distrito: lines[43],
      bairro: lines[49],
      endereco: lines[63],
      cep: lines[31],
      latitude: {
        hemisferio: lines[17],
        graus:      lines[48],
        min:        lines[42],
        seg:        lines[14]
      },
      longitude: {
        graus: lines[44],
        min:   lines[46],
        seg:   lines[47],
        datum: lines[69]
      },
      vistoria: lines[71],
      usoDaUnidade: lines[80],
      ocupacao: lines[81],
      dataVistoria: lines[79]
    };
  }

  buildImovelLoft(lines: string[]): any {
    lines = this.getArrayJuntandoValoresDeEndereco(lines);
    lines = this.getArrayJuntandoValoresDeVistoriaParaLoft(lines);
    return {
      categoria: 'Loft',
      uf: lines[70],
      municipio: lines[15],
      distrito: lines[43],
      bairro: lines[49],
      endereco: lines[63],
      cep: lines[31],
      latitude: {
        hemisferio: lines[17],
        graus:      lines[48],
        min:        lines[42],
        seg:        lines[14]
      },
      longitude: {
        graus: lines[44],
        min:   lines[46],
        seg:   lines[47],
        datum: lines[69]
      },
      vistoria: lines[71],
      usoDaUnidade: lines[79],
      ocupacao: lines[80],
      dataVistoria: lines[78]
    };
  }

  buildImovelCasa(lines: string[]): any {
    lines = this.getArrayJuntandoValoresDeEndereco(lines);
    lines = this.getArrayJuntandoValoresDeVistoriaParaCasa(lines);
    return {
      categoria: 'Casa',
      uf: lines[64],
      municipio: lines[15],
      distrito: lines[41],
      bairro: lines[47],
      endereco: lines[58],
      cep: lines[30],
      latitude: {
        hemisferio: lines[17],
        graus:      lines[46],
        min:        lines[40],
        seg:        lines[14]
      },
      longitude: {
        graus: lines[42],
        min:   lines[44],
        seg:   lines[45],
        datum: lines[63]
      },
      vistoria: lines[71],
      usoDaUnidade: lines[77],
      ocupacao: lines[130],
      dataVistoria: lines[76]
    };
  }

  buildImovelLote(lines: string[]): any {
    lines = this.getArrayJuntandoValoresDeEndereco(lines);
    lines = this.getArrayJuntandoValoresDeVistoriaParaLote(lines);
    return {
      categoria: 'Lote',
      uf: lines[70],
      municipio: lines[15],
      distrito: lines[43],
      bairro: lines[49],
      endereco: lines[63],
      cep: lines[31],
      latitude: {
        hemisferio: lines[17],
        graus:      lines[48],
        min:        lines[42],
        seg:        lines[14]
      },
      longitude: {
        graus: lines[44],
        min:   lines[46],
        seg:   lines[47],
        datum: lines[69]
      },
      vistoria: lines[127],
      usoDaUnidade: null,
      ocupacao: null,
      dataVistoria: lines[128]
    };
  }

  getImovelPelaCategoria(lines: string[]): any {
    const categoria = this.detectarCategoria(lines);
    let imovel: any = {};
    if (categoria === 'APARTAMENTO') imovel = this.buildImovelApartamento(lines);
    else if (categoria === 'LOFT') imovel = this.buildImovelLoft(lines);
    else if (categoria === 'CASA') imovel = this.buildImovelCasa(lines);
    else if (categoria === 'LOTE') imovel = this.buildImovelLote(lines);
    return imovel;
  }

  buildFormDoImovel(text: string, fileName: string): Imovel {
    const lines = this.getPdfTextoEmArrayNormalizado(text);
    const imovel = this.getImovelPelaCategoria(lines);
    return {
      categoria: imovel.categoria,
      uf: imovel.uf,
      municipio: imovel.municipio,
      distrito: imovel.distrito,
      bairro: imovel.bairro,
      endereco: imovel.endereco,
      numero: null,
      cep: imovel.cep,
      areaConstruida: null,
      areaTerreno: null,
      testada: null,
      vistoria: imovel.vistoria,
      usoDaUnidade: imovel.usoDaUnidade,
      ocupacao: imovel.ocupacao,
      dataVistoria: imovel.dataVistoria,
      observacoes: null,
      origemPreenchimento: 'PDF',
      arquivoNome: fileName,
    };
    
  }
  
}
