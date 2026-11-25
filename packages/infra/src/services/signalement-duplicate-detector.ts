import type {
  DuplicateSignalementDetector,
  DuplicateSignalementQuery,
  DuplicateSignalementSuggestion,
  SignalementRepository,
} from "@localimpact/application";
import type { Signalement } from "@localimpact/domain";

const suggestionLimit = 5;

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function getTokens(value: string): ReadonlySet<string> {
  return new Set(normalizeText(value).split(/\s+/).filter((token) => token.length >= 3));
}

function getTextSimilarity(
  query: DuplicateSignalementQuery,
  candidate: Signalement,
): number {
  const queryTokens = getTokens(`${query.title} ${query.description}`);
  const candidateTokens = getTokens(`${candidate.title} ${candidate.description}`);
  if (queryTokens.size === 0 || candidateTokens.size === 0) {
    return 0;
  }

  let sharedTokens = 0;
  for (const token of queryTokens) {
    if (candidateTokens.has(token)) {
      sharedTokens += 1;
    }
  }

  return sharedTokens / Math.min(queryTokens.size, candidateTokens.size);
}

function toSuggestion(signalement: Signalement): DuplicateSignalementSuggestion {
  return {
    id: signalement.id.value,
    title: signalement.title,
    category: signalement.category,
    location: signalement.location,
    status: signalement.status.value,
    supportCount: signalement.supportCount,
  };
}

export class SignalementDuplicateDetector implements DuplicateSignalementDetector {
  constructor(private readonly signalements: SignalementRepository) {}

  async findSimilar(
    query: DuplicateSignalementQuery,
  ): Promise<readonly DuplicateSignalementSuggestion[]> {
    const candidates = await this.signalements.findAll({
      category: query.category,
      location: query.location,
    });
    const normalizedTitle = normalizeText(query.title);

    return candidates
      .map((candidate) => ({
        candidate,
        similarity: getTextSimilarity(query, candidate),
        exactTitle: normalizeText(candidate.title) === normalizedTitle,
      }))
      .filter(({ similarity, exactTitle }) => exactTitle || similarity >= 0.5)
      .sort((left, right) => (
        Number(right.exactTitle) - Number(left.exactTitle) ||
        right.similarity - left.similarity
      ))
      .slice(0, suggestionLimit)
      .map(({ candidate }) => toSuggestion(candidate));
  }
}
