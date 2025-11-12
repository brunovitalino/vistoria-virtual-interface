export interface Imovel {
  categoria: string | null;

  uf: string | null;
  municipio: string | null;
  distrito: string | null;
  bairro: string | null;
  endereco: string | null;
  numero?: string | null;
  cep: string | null;

  areaConstruida?: string | null;
  areaTerreno?: string | null;
  testada?: string | null;

  dataVistoria?: string | null;
  observacoes?: string | null;

  origemPreenchimento: 'MANUAL' | 'PDF';
  arquivoNome?: string | null;
}
