import { supabaseAdmin } from "./supabase";
import { updateInventoryCost, updateInventoryLevel } from "./shopify";

export interface PurchaseInput {
  shopifyVariantId: string;
  qty: number;
  unitCost: number;
  vendor?: string;
}

/**
 * Logic to process a new purchase.
 * 1. Calculates new WAC
 * 2. Updates local DB
 * 3. Syncs to Shopify
 */
export async function processNewPurchase(input: PurchaseInput) {
  const { shopifyVariantId, qty, unitCost, vendor } = input;

  // 1. Fetch current inventory state from DB
  const { data: currentInventory, error: fetchError } = await supabaseAdmin
    .from("inventory")
    .select("*")
    .eq("shopify_variant_id", shopifyVariantId)
    .single();

  if (fetchError && fetchError.code !== "PGRST116") {
    throw new Error(`Error fetching inventory: ${fetchError.message}`);
  }

  let inventoryId: string;
  let newQty: number;
  let newWac: number;

  if (!currentInventory) {
    // New item to our system (though it exists in Shopify)
    // We'll need to fetch current Shopify qty first in a real scenario,
    // but for now we assume it's the first time we've tracked it.
    newQty = qty;
    newWac = unitCost;

    // Create entry in our DB
    const { data: newItem, error: insertError } = await supabaseAdmin
      .from("inventory")
      .insert({
        shopify_variant_id: shopifyVariantId,
        name: "Pending Shopify Sync...", // Will be updated by webhook or sync job
        current_qty: newQty,
        wac_price: newWac,
        manual_stock_flag: false,
      })
      .select()
      .single();

    if (insertError) throw insertError;
    inventoryId = newItem.id;
  } else {
    // Calculate new WAC
    const oldQty = currentInventory.current_qty;
    const oldWac = Number(currentInventory.wac_price);
    
    newQty = oldQty + qty;
    newWac = ((oldQty * oldWac) + (qty * unitCost)) / newQty;
    inventoryId = currentInventory.id;

    // Update entry in our DB
    const { error: updateError } = await supabaseAdmin
      .from("inventory")
      .update({
        current_qty: newQty,
        wac_price: newWac,
        manual_stock_flag: false,
        last_synced_at: new Date().toISOString(),
      })
      .eq("id", inventoryId);

    if (updateError) throw updateError;
  }

  // 2. Record the purchase history
  const { error: purchaseError } = await supabaseAdmin.from("purchases").insert({
    inventory_id: inventoryId,
    qty,
    unit_cost: unitCost,
    vendor,
    purchase_date: new Date().toISOString(),
  });

  if (purchaseError) throw purchaseError;

  // 3. Sync to Shopify
  // A. Update Cost
  const costSync = await updateInventoryCost(shopifyVariantId, newWac);
  
  // B. Update Inventory Level 
  // Note: This assumes we are setting absolute quantity. 
  // In a multi-location setup, we'd need the locationId.
  // const inventorySync = await updateInventoryLevel(shopifyVariantId, locationId, newQty);

  return { inventoryId, newQty, newWac, costSync };
}
