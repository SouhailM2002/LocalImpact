import type { StatutValue } from "@localimpact/domain";

export interface DuplicateSignalementQuery {
  readonly title: string;
  readonly description: string;
  readonly category: string;
  readonly location: string;
}

export interface DuplicateSignalementSuggestion {
  readonly id: string;
  readonly title: string;
  readonly category: string;
  readonly location: string;
  readonly status: StatutValue;
  readonly supportCount: number;
}

export interface DuplicateSignalementDetector {
  findSimilar(
    query: DuplicateSignalementQuery,
  ): Promise<readonly DuplicateSignalementSuggestion[]>;
}
