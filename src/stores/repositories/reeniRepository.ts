export interface ReeniData {
  pvm: string;
  tunnit: number;
  kommentti: string;
  kategoria: string;
  koira: string;
  akm?: number;
}

export interface ReeniRepository {
  setPath(path: string): void;
  getCollection(): any;
  add(data: ReeniData): Promise<unknown>;
}
