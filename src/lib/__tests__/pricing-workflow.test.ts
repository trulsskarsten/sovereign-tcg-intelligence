import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabaseAdmin } from '../supabase';
import { generateRecommendations } from '../recommendations';

// Mock supabaseAdmin
vi.mock('../supabase', () => ({
  supabaseAdmin: {
    from: vi.fn(),
  },
}));

// Mock shopify update
vi.mock('../shopify', () => ({
  updateProductPrice: vi.fn().mockResolvedValue({ success: true, dryRun: false }),
}));

describe('Pricing Workflow Integration', () => {
  const mockStoreId = 'store-123';
  const mockShopDomain = 'test.myshopify.com';
  const mockVariantId = 'gid://shopify/ProductVariant/123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate a recommendation and stage it', async () => {
    const mockInventoryItem = {
      price: 100,
      cost: 50,
      variant_id: mockVariantId
    };

    const mockMarketData = [
      { price: 150, source: 'A', name: 'Item', stockStatus: "IN_STOCK" as const },
      { price: 160, source: 'B', name: 'Item', stockStatus: "IN_STOCK" as const }
    ];

    const mockMarketPrices = [
      { price: 150, source: 'A', in_stock: true, created_at: new Date().toISOString() },
      { price: 160, source: 'B', in_stock: true, created_at: new Date().toISOString() }
    ];

    // Mock supabaseAdmin chain
    const insertMock = vi.fn().mockResolvedValue({ data: null, error: null });
    
    (supabaseAdmin.from as any).mockImplementation((table: string) => {
      const chain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        single: vi.fn(),
        insert: insertMock
      };

      if (table === 'inventory') {
        chain.single.mockResolvedValue({ data: mockInventoryItem, error: null });
        return chain;
      }
      if (table === 'market_prices') {
        // Return results for market_prices (mock the final execution of the chain)
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue({ data: mockMarketPrices, error: null })
        };
      }
      if (table === 'staged_updates') {
        return { insert: insertMock };
      }
      return chain;
    });

    const recommendations = await generateRecommendations(
      mockStoreId, 
      mockShopDomain, 
      mockVariantId
    );

    expect(recommendations).toHaveLength(1);
    expect(recommendations![0].type).toBe('INCREASE');
    
    // Verify it was staged
    expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({
      store_id: mockStoreId,
      product_id: mockVariantId,
      field_name: 'price',
      status: 'pending'
    }));
  });
});
