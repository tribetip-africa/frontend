import { getErrorContent, getGlobalErrorContent, getNotFoundContent } from "@/lib/error-pages";

describe("error page content", () => {
  it("describes a 404", () => {
    const content = getNotFoundContent();
    expect(content.code).toBe("404");
    expect(content.title).toBe("Page not found");
    expect(content.primaryHref).toBe("/");
  });

  it("describes a recoverable app error", () => {
    const content = getErrorContent();
    expect(content.code).toBe("500");
    expect(content.primaryHref).toBe("#retry");
  });

  it("describes a global failure", () => {
    const content = getGlobalErrorContent();
    expect(content.primaryHref).toBe("#reload");
    expect(content.code).toBe("Error");
  });
});
