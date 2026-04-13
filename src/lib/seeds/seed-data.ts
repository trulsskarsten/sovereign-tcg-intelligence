export interface SeedItem {
  shopify_variant_id: string;
  name: string;
  sku: string;
  cost: number;
  price: number;
  stock: number;
  abc_class: "A" | "B" | "C";
  category?: string;
}

export const POKEMON_SEED_DATA: SeedItem[] = [
  // CLASS A: High Value / Fast Moving
  {
    shopify_variant_id: "gid://shopify/ProductVariant/seed-bb-evolutions",
    name: "XY Evolutions Booster Box",
    sku: "POK-XY-EVO-BB",
    cost: 4500,
    price: 8500,
    stock: 2,
    abc_class: "A",
    category: "Booster Box"
  },
  {
    shopify_variant_id: "gid://shopify/ProductVariant/seed-bb-burning",
    name: "Sun & Moon Burning Shadows Booster Box",
    sku: "POK-SM-BUS-BB",
    cost: 3200,
    price: 5500,
    stock: 3,
    abc_class: "A",
    category: "Booster Box"
  },
  {
    shopify_variant_id: "gid://shopify/ProductVariant/seed-etb-charizard",
    name: "Champions Path ETB - Charizard",
    sku: "POK-CP-ETB-CHZ",
    cost: 850,
    price: 1350,
    stock: 5,
    abc_class: "A",
    category: "ETB"
  },
  {
    shopify_variant_id: "gid://shopify/ProductVariant/seed-card-zard-base",
    name: "Charizard - Base Set (Unlimited)",
    sku: "POK-BS-004",
    cost: 1500,
    price: 3500,
    stock: 1,
    abc_class: "A",
    category: "Single Card"
  },
  
  // CLASS B: Mid Value
  {
    shopify_variant_id: "gid://shopify/ProductVariant/seed-bb-lost",
    name: "Sword & Shield Lost Origin Booster Box",
    sku: "POK-SWSH-LOR-BB",
    cost: 950,
    price: 1650,
    stock: 12,
    abc_class: "B",
    category: "Booster Box"
  },
  {
    shopify_variant_id: "gid://shopify/ProductVariant/seed-etb-celebrations",
    name: "Celebrations 25th Anniversary ETB",
    sku: "POK-CEL-ETB",
    cost: 450,
    price: 850,
    stock: 8,
    abc_class: "B",
    category: "ETB"
  },
  {
    shopify_variant_id: "gid://shopify/ProductVariant/seed-tin-pika",
    name: "Pikachu & Zekrom GX Tag Team Tin",
    sku: "POK-TIN-PIKZEK",
    cost: 180,
    price: 320,
    stock: 15,
    abc_class: "B",
    category: "Tin"
  },

  // CLASS C: Lower Value / Bulk
  {
    shopify_variant_id: "gid://shopify/ProductVariant/seed-pack-silver",
    name: "Silver Tempest Booster Pack",
    sku: "POK-SWSH-SIT-PACK",
    cost: 32,
    price: 55,
    stock: 150,
    abc_class: "C",
    category: "Pack"
  },
  {
    shopify_variant_id: "gid://shopify/ProductVariant/seed-card-pika-base",
    name: "Pikachu - Base Set",
    sku: "POK-BS-058",
    cost: 5,
    price: 25,
    stock: 45,
    abc_class: "C",
    category: "Single Card"
  },
  {
    shopify_variant_id: "gid://shopify/ProductVariant/seed-sleeves-zard",
    name: "Pokemon Center Sleeves - Charizard",
    sku: "ACC-SLEEV-ZARD",
    cost: 45,
    price: 125,
    stock: 20,
    abc_class: "C",
    category: "Accessory"
  }
];
