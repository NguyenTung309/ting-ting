import { afterEach, describe, expect, it } from "vitest";

import { createPendingResultToken, readPendingResultToken } from "@/lib/tests/pending-result";

describe("pending result account-link token", () => {
  const previousSecret = process.env.AUTH_SECRET;

  afterEach(() => {
    if (previousSecret === undefined) delete process.env.AUTH_SECRET;
    else process.env.AUTH_SECRET = previousSecret;
  });

  it("accepts the signed code and rejects tampering or a different result", () => {
    process.env.AUTH_SECRET = "__LOCAL_SECRET_REMOVED__";
    const token = createPendingResultToken("ttt-a2b3c");
    expect(readPendingResultToken(token)).toBe("TTT-A2B3C");
    expect(readPendingResultToken(token.replace("A2B3C", "B2B3C"))).toBeNull();
    expect(readPendingResultToken(undefined)).toBeNull();
  });
});
