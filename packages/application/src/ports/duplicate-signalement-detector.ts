export interface DuplicateSignalementQuery {
  readonly title: string;
  readonly description: string;
  readonly category: string;
  readonly location: string;
}

export interface DuplicateSignalementDetector {
  findSimilar(query: DuplicateSignalementQuery): Promise<readonly string[]>;
}
