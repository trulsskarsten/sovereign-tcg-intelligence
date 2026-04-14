import crypto from "crypto";
import { logger } from "../logger";

export interface CardmarketPriceGuide {
  idProduct: number;
  avgSellPrice: number;
  lowPrice: number;
  trendPrice: number;
  avg1: number;
  avg7: number;
  avg30: number;
}

/**
 * Cardmarket API Client (one-legged OAuth 1.0a)
 */
export class CardmarketClient {
  private appToken: string;
  private appSecret: string;
  private accessToken: string;
  private accessTokenSecret: string;
  private baseUrl = "https://apiv2.cardmarket.com/ws/v2.0/output.json";

  constructor() {
    this.appToken = process.env.CARDMARKET_APP_TOKEN || "";
    this.appSecret = process.env.CARDMARKET_APP_SECRET || "";
    this.accessToken = process.env.CARDMARKET_ACCESS_TOKEN || "";
    this.accessTokenSecret = process.env.CARDMARKET_ACCESS_TOKEN_SECRET || "";
  }

  /**
   * Generates the OAuth 1.0a Authorization header.
   */
  private generateAuthHeader(method: string, url: string, params: Record<string, string>): string {
    const oauthParams: Record<string, string> = {
      oauth_consumer_key: this.appToken,
      oauth_token: this.accessToken,
      oauth_nonce: crypto.randomBytes(16).toString("hex"),
      oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
      oauth_signature_method: "HMAC-SHA1",
      oauth_version: "1.0",
      ...params
    };

    // 1. Sort and encode parameters
    const encodedParams = Object.keys(oauthParams)
      .sort()
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(oauthParams[key])}`)
      .join("&");

    // 2. Create Base String
    const baseString = [
      method.toUpperCase(),
      encodeURIComponent(url.split("?")[0]),
      encodeURIComponent(encodedParams)
    ].join("&");

    // 3. Create Signing Key
    const signingKey = `${encodeURIComponent(this.appSecret)}&${encodeURIComponent(this.accessTokenSecret)}`;

    // 4. Create Signature
    const signature = crypto
      .createHmac("sha1", signingKey)
      .update(baseString)
      .digest("base64");

    oauthParams.oauth_signature = signature;

    // 5. Format Header
    const headerParts = Object.keys(oauthParams)
      .filter(key => key.startsWith("oauth_"))
      .map(key => `${key}="${encodeURIComponent(oauthParams[key])}"`);

    return `OAuth realm="${url}", ${headerParts.join(", ")}`;
  }

  /**
   * Finds a product and retrieves its PriceGuide.
   */
  async getPriceGuide(query: string): Promise<CardmarketPriceGuide | null> {
    if (!this.appToken || !this.appSecret) {
      logger.warn("Cardmarket API not configured.");
      return null;
    }

    try {
      // 1. Search for product
      const searchUrl = `${this.baseUrl}/products/find`;
      const searchParams = { search: query, idGame: "1" }; // Pokemon = 1
      const queryStr = `search=${encodeURIComponent(query)}&idGame=1`;
      
      const authHeader = this.generateAuthHeader("GET", searchUrl, searchParams);
      
      const response = await fetch(`${searchUrl}?${queryStr}`, {
        headers: { Authorization: authHeader }
      });

      if (!response.ok) {
        throw new Error(`CM Search Error: ${response.statusText}`);
      }

      const data = await response.json();
      const product = data.product?.[0];

      if (!product) return null;

      // 2. Map and return price guide
      const pg = product.priceGuide;
      return {
        idProduct: product.idProduct,
        avgSellPrice: pg.AVG || 0,
        lowPrice: pg.LOW || 0,
        trendPrice: pg.TREND || 0,
        avg1: pg.AVG1 || 0,
        avg7: pg.AVG7 || 0,
        avg30: pg.AVG30 || 0
      };

    } catch (err: unknown) {
      logger.error({ query, err }, "Cardmarket API failure");
      return null;
    }
  }
}
