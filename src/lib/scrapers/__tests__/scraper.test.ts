import { describe, it, expect, vi } from "vitest";
import * as cheerio from "cheerio";
import fs from "fs";
import path from "path";
import { scrapePokepris } from "../adapters";

describe("Scraper Adapters: Pokepris", () => {
  it("successfully parses product data from HTML fixture", async () => {
    const fixturePath = path.join(__dirname, "pokepris-search.html");
    const html = fs.readFileSync(fixturePath, "utf-8");

    // Mock global fetch to return our fixture
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(html),
    } as unknown as Response);

    const results = await scrapePokepris("pikachu");

    expect(results).toHaveLength(2);
    
    // First item: In stock
    expect(results[0].name).toBe("Pikachu VMAX (Vivid Voltage)");
    expect(results[0].price).toBe(339);
    expect(results[0].stockStatus).toBe("IN_STOCK");
    
    // Second item: Out of stock
    expect(results[1].name).toBe("Charizard GX (Hidden Fates)");
    expect(results[1].price).toBe(1249);
    expect(results[1].stockStatus).toBe("OUT_OF_STOCK");
  });
});
