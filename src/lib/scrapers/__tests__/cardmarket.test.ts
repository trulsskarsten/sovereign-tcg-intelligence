import { describe, it, expect, vi, beforeEach } from "vitest";
import { CardmarketClient } from "../cardmarket";

describe("CardmarketClient", () => {
  let client: CardmarketClient;

  beforeEach(() => {
    // Set mock env vars
    process.env.CARDMARKET_APP_TOKEN = "test_token";
    process.env.CARDMARKET_APP_SECRET = "test_secret";
    process.env.CARDMARKET_ACCESS_TOKEN = "test_access";
    process.env.CARDMARKET_ACCESS_TOKEN_SECRET = "test_access_secret";
    
    client = new CardmarketClient();
  });

  it("handles successful price guide retrieval", async () => {
    const mockResponse = {
      product: [{
        idProduct: 12345,
        priceGuide: {
          AVG: 56.78,
          LOW: 45.00,
          TREND: 52.12,
          AVG1: 55.00,
          AVG7: 54.00,
          AVG30: 53.00
        }
      }]
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    } as any);

    const priceGuide = await client.getPriceGuide("Pikachu");

    expect(priceGuide).not.toBeNull();
    expect(priceGuide?.idProduct).toBe(12345);
    expect(priceGuide?.avgSellPrice).toBe(56.78);
    expect(priceGuide?.lowPrice).toBe(45.00);
    
    // Verify fetch was called with Authorization header
    const fetchCall = (global.fetch as any).mock.calls[0];
    expect(fetchCall[1].headers.Authorization).toContain("OAuth");
    expect(fetchCall[1].headers.Authorization).toContain('oauth_consumer_key="test_token"');
  });

  it("returns null when product not found", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ product: [] })
    } as any);

    const priceGuide = await client.getPriceGuide("NonExistentItem");
    expect(priceGuide).toBeNull();
  });
});
