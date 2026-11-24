import { describe, expect, it } from "vitest";

import { Commentaire, DomainValidationError, SignalementId } from "../src/index.js";

describe("Commentaire", () => {
  it("creates a comment with trimmed content and a valid author", () => {
    const comment = Commentaire.create({
      id: "comment-1",
      signalementId: SignalementId.create("signalement-1"),
      authorId: "user-1",
      content: "  I can confirm this issue.  ",
    });

    expect(comment.content).toBe("I can confirm this issue.");
    expect(comment.authorId).toBe("user-1");
    expect(comment.createdAt).toBeInstanceOf(Date);
  });

  it("rejects blank content and author IDs", () => {
    const signalementId = SignalementId.create("signalement-1");

    expect(() =>
      Commentaire.create({
        id: "comment-1",
        signalementId,
        authorId: "user-1",
        content: " ",
      }),
    ).toThrow(DomainValidationError);
    expect(() =>
      Commentaire.create({
        id: "comment-1",
        signalementId,
        authorId: " ",
        content: "A comment",
      }),
    ).toThrow(DomainValidationError);
  });
});
