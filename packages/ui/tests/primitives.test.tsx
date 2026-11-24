import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Badge, Button, Card, Input } from "../src/index.js";

describe("shared UI primitives", () => {
  it("preserves native button disabled semantics", () => {
    const markup = renderToStaticMarkup(
      <Button disabled variant="secondary">Not available</Button>,
    );

    expect(markup).toContain("<button");
    expect(markup).toContain("disabled=\"\"");
    expect(markup).toContain("Not available");
  });

  it("keeps input accessibility attributes and supports semantic wrappers", () => {
    const markup = renderToStaticMarkup(
      <Card>
        <Badge variant="success">Ready</Badge>
        <Input aria-label="Search reports" aria-invalid="true" />
      </Card>,
    );

    expect(markup).toContain("aria-label=\"Search reports\"");
    expect(markup).toContain("aria-invalid=\"true\"");
    expect(markup).toContain("Ready");
  });
});
