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
    if (txt.includes('CASA')) return 'CASA';
    if (txt.includes('LOTE') || txt.includes('TERRENO')) return 'LOTE';

    return 'DESCONHECIDO';
  }

  // Helpers de busca
  findLabelValue(lines: string[], label: string,
    opts: {
      maxAhead?: number;
      maxBack?: number;
      valueRegex?: RegExp;
      isCandidate?: (s: string) => boolean;
      sectionAnchor?: string;
    } = {}
  ): string | null {

    const {
      maxAhead = 80,
      maxBack = 20,
      valueRegex,
      isCandidate,
      sectionAnchor
    } = opts;

    // Se quiser restringir à INTRODUÇÃO / IDENTIFICAÇÃO
    let searchStart = 0;
    let searchEnd = lines.length - 1;

    if (sectionAnchor) {
      const idx = lines.findIndex(l => l.toUpperCase().includes(sectionAnchor.toUpperCase()));
      if (idx !== -1) {
        searchStart = idx;
        searchEnd = Math.min(idx + 150, lines.length - 1);
      }
    }

    // Localiza o label dentro da janela
    const labelIndex = lines.findIndex((l, i) =>
      i >= searchStart &&
      i <= searchEnd &&
      l.toUpperCase().includes(label.toUpperCase())
    );

    if (labelIndex === -1) return null;

    const testCandidate = (line: string) => {
      if (isCandidate) return isCandidate(line);
      if (valueRegex) return valueRegex.test(line);
      return (
        !/[:]|(Munic|Endere|Categoria|UF|CEP|Bairro|Latitude|Longitude)/i.test(line) &&
        line.trim().length > 1
      );
    };

    // Mesmo linha → tenta extrair após ":"
    const parts = lines[labelIndex].split(':');
    if (parts.length > 1) {
      const after = parts.slice(1).join(':').trim();
      if (after && testCandidate(after)) return after;
    }

    // Para frente
    for (let i = labelIndex + 1; i <= Math.min(lines.length - 1, labelIndex + maxAhead); i++) {
      const line = lines[i];
      if (testCandidate(line)) return line;
    }

    // Para trás
    for (let i = labelIndex - 1; i >= Math.max(0, labelIndex - maxBack); i--) {
      const line = lines[i];
      if (testCandidate(line)) return line;
    }

    return null;
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

  buildImovelApartamento(lines: string[]): any {
    lines = this.getArrayJuntandoValoresDeEndereco(lines);
    
    // const saida = lines.map((l, i) => `${i} ${l}`).join('\n');
    // console.log(saida);

    let retorno = {
      categoria: 'Apartamento',
      uf: this.extrairUf(lines),
      municipio: this.extrairMunicipio(lines),
      distrito: this.extrairDistrito(lines),
      bairro: this.extrairBairro(lines),
      endereco: this.extrairEndereco(lines),
      cep: this.extrairCep(lines),
      latitude: this.extrairLatitude(lines),
      longitude: this.extrairLongitude(lines)
    };
    // console.log(retorno);

    return retorno;
  }
  getArrayJuntandoValoresDeEndereco(lines: string[]) {
    const hemisferioIndex = lines.indexOf('Hemisfério');
    const datumIndex = lines.indexOf('Datum', hemisferioIndex);
    return this.getArrayJuntandoUmGrupoDeElementos(lines, hemisferioIndex, datumIndex);
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
  private extrairUf(lines: string[]) {
    return lines[70];
  }
  private extrairMunicipio(lines: string[]) {
    return lines[15];
  }
  private extrairDistrito(lines: string[]) {
    return lines[43];
  }
  private extrairBairro(lines: string[]) {
    return lines[49];
  }
  private extrairEndereco(lines: string[]) {
    return lines[63];
  }
  private extrairCep(lines: string[]) {
    return lines[31];
  }
  private extrairLatitude(lines: string[]) {
    const idx = lines.findIndex(l => l.toUpperCase().includes('LATITUDE'));
    if (idx === -1) return {};

    return {
      hemisferio: lines[17],
      graus:      lines[48],
      min:        lines[42],
      seg:        lines[14]
    };
  }
  private extrairLongitude(lines: string[]) {
    const idx = lines.findIndex(l => l.toUpperCase().includes('LONGITUDE'));
    if (idx === -1) return {};

    return {
      graus: lines[44],
      min:   lines[46],
      seg:   lines[47],
      datum: lines[69]
    };
  }

  buildImovelCasa(lines: string[]): any {
    lines = this.getArrayJuntandoValoresDeEndereco(lines);
    
    const saida = lines.map((l, i) => `${i} ${l}`).join('\n');
    // console.log(saida);

    let algo = {
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
    };

    console.log(algo);

    return algo;
  }

  buildImovelTerreno(lines: string[]): any {
    return {
      categoria: 'Lote',
      uf: this.findLabelValue(lines, 'UF'),
      municipio: this.findLabelValue(lines, 'Município'),
      distrito: this.findLabelValue(lines, 'Distrito'),
      bairro: this.findLabelValue(lines, 'Bairro'),
      endereco: this.findLabelValue(lines, 'Endereço'),
      cep: this.findLabelValue(lines, 'CEP'),

      latitude: {
        hemisferio: this.findLabelValue(lines, 'Hemisfério'),
        graus: this.findLabelValue(lines, 'Graus'),
        min: this.findLabelValue(lines, 'Min'),
        seg: this.findLabelValue(lines, 'Seg'),
      },

      longitude: {
        graus: this.findLabelValue(lines, 'Longitude'),
        min: this.findLabelValue(lines, 'Min'),
        seg: this.findLabelValue(lines, 'Seg'),
      },
    };
  }

  buildFormDoImovel(text: string, fileName: string): Imovel {
    const lines = this.getPdfTextoEmArrayNormalizado(text);
    const categoria = this.detectarCategoria(lines);

    let imovel: any = {};

    if (categoria === 'APARTAMENTO') imovel = this.buildImovelApartamento(lines);
    else if (categoria === 'CASA') imovel = this.buildImovelCasa(lines);
    else if (categoria === 'LOTE') imovel = this.buildImovelTerreno(lines);

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
      dataVistoria: null,
      observacoes: null,
      origemPreenchimento: 'PDF',
      arquivoNome: fileName,
    };
    
  }
  
}
