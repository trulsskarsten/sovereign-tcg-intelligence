import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Supabase module BEFORE importing shopify.ts
vi.mock('@supabase/supabase-js', () => {
  const mockSelect = vi.fn().mockReturnValue({
    eq: vi.fn().mockReturnValue({
      single: vi.fn().mockResolvedValue({ 
        data: { access_token: 'mock-access-token' }, 
        error: null 
      }),
    }),
  });

  return {
    createClient: vi.fn(() => ({
      from: vi.fn().mockReturnValue({
        select: mockSelect,
        upsert: vi.fn().mockResolvedValue({ error: null }),
        insert: vi.fn().mockResolvedValue({ error: null }),
      }),
    })),
  };
});

// Mock environment variables
vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://mock.supabase.co');
vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'mock-key');
vi.stubEnv('SHOPIFY_SHOP_NAME', 'test-store');

import { syncStoreVariants } from '../shopify';

describe('Inventory Sync Engine', () => {
  const mockShop = 'test-store.myshopify.com';

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock global fetch
    global.fetch = vi.fn();
  });

  it('should sync variants using cursor pagination', async () => {
    // 1st call: Sync Variants Page 1
    // 2nd call: Sync Variants Page 2
    vi.mocked(global.fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            productVariants: {
              pageInfo: { hasNextPage: true, endCursor: 'cursor1' },
              nodes: [
                {
                  id: 'gid://shopify/ProductVariant/1',
                  sku: 'SKU1',
                  title: 'Variant 1',
                  price: '100.00',
                  barcode: '123456',
                  inventoryQuantity: 10,
                  product: { title: 'Product 1', vendor: 'Brand A', productType: 'Single' },
                  inventoryItem: { id: 'ii_1', unitCost: { amount: '50.00' } }
                }
              ]
            }
          }
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            productVariants: {
              pageInfo: { hasNextPage: false, endCursor: null },
              nodes: [
                {
                  id: 'gid://shopify/ProductVariant/2',
                  sku: 'SKU2',
                  title: 'Variant 2',
                  price: '200.00',
                  barcode: '789012',
                  inventoryQuantity: 5,
                  product: { title: 'Product 2', vendor: 'Brand B', productType: 'Sealed' },
                  inventoryItem: { id: 'ii_2', unitCost: { amount: '150.00' } }
                }
              ]
            }
          }
        })
      });

    const result = await syncStoreVariants(mockShop);

    expect(result.totalSynced).toBe(2);
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('should handle API errors gracefully', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { productVariants: null } })
    });

    const result = await syncStoreVariants(mockShop);
    expect(result.totalSynced).toBe(0);
  });
});
