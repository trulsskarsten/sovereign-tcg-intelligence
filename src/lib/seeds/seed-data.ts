export interface SeedItem {
  variant_id: string; // Matches DB column
  product_name: string; // Matches DB column
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
    variant_id: "gid://shopify/ProductVariant/seed-bb-evolutions",
    product_name: "XY Evolutions Booster Box",
    sku: "POK-XY-EVO-BB",
    cost: 4500,
    price: 8500,
    stock: 2,
    abc_class: "A",
    category: "Booster Box"
  },
  {
    variant_id: "gid://shopify/ProductVariant/seed-bb-burning",
    product_name: "Sun & Moon Burning Shadows Booster Box",
    sku: "POK-SM-BUS-BB",
    cost: 3200,
    price: 5500,
    stock: 3,
    abc_class: "A",
    category: "Booster Box"
  },
  {
    variant_id: "gid://shopify/ProductVariant/seed-etb-charizard",
    product_name: "Champions Path ETB - Charizard",
    sku: "POK-CP-ETB-CHZ",
    cost: 850,
    price: 1350,
    stock: 5,
    abc_class: "A",
    category: "ETB"
  },
  {
    variant_id: "gid://shopify/ProductVariant/seed-card-zard-base",
    product_name: "Charizard - Base Set (Unlimited)",
    sku: "POK-BS-004",
    cost: 1500,
    price: 3500,
    stock: 1,
    abc_class: "A",
    category: "Single Card"
  },
  
  // CLASS B: Mid Value
  {
    variant_id: "gid://shopify/ProductVariant/seed-bb-lost",
    product_name: "Sword & Shield Lost Origin Booster Box",
    sku: "POK-SWSH-LOR-BB",
    cost: 950,
    price: 1650,
    stock: 12,
    abc_class: "B",
    category: "Booster Box"
  },
  {
    variant_id: "gid://shopify/ProductVariant/seed-etb-celebrations",
    product_name: "Celebrations 25th Anniversary ETB",
    sku: "POK-CEL-ETB",
    cost: 450,
    price: 850,
    stock: 8,
    abc_class: "B",
    category: "ETB"
  },
  {
    variant_id: "gid://shopify/ProductVariant/seed-tin-pika",
    product_name: "Pikachu & Zekrom GX Tag Team Tin",
    sku: "POK-TIN-PIKZEK",
    cost: 180,
    price: 320,
    stock: 15,
    abc_class: "B",
    category: "Tin"
  },

  // CLASS C: Lower Value / Bulk
  {
    variant_id: "gid://shopify/ProductVariant/seed-pack-silver",
    product_name: "Silver Tempest Booster Pack",
    sku: "POK-SWSH-SIT-PACK",
    cost: 32,
    price: 55,
    stock: 150,
    abc_class: "C",
    category: "Pack"
  },
  {
    variant_id: "gid://shopify/ProductVariant/seed-card-pika-base",
    product_name: "Pikachu - Base Set",
    sku: "POK-BS-058",
    cost: 5,
    price: 25,
    stock: 45,
    abc_class: "C",
    category: "Single Card"
  },
  {
    variant_id: "gid://shopify/ProductVariant/seed-sleeves-zard",
    product_name: "Pokemon Center Sleeves - Charizard",
    sku: "ACC-SLEEV-ZARD",
    cost: 45,
    price: 125,
    stock: 20,
    abc_class: "C",
    category: "Accessory"
  }
];
