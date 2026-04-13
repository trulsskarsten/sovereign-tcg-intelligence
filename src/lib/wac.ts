import { supabaseAdmin } from "./supabase";
import { updateInventoryCost, updateInventoryLevel, fetchPrimaryLocationId } from "./shopify";
import { logger } from "./logger";

export interface PurchaseInput {
  variant_id: string; // Renamed from shopifyVariantId
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
export async function processNewPurchase(shopDomain: string, input: PurchaseInput) {
  const { variant_id, qty, unitCost, vendor } = input;

  // 1. Fetch current inventory state from DB
  const { data: currentInventory, error: fetchError } = await supabaseAdmin
    .from("inventory")
    .select("*")
    .eq("variant_id", variant_id)
    .single();

  if (fetchError && fetchError.code !== "PGRST116") {
    throw new Error(`Error fetching inventory: ${fetchError.message}`);
  }

  let inventoryId: string;
  let newQty: number;
  let newWac: number;

  if (!currentInventory) {
    // New item to our system (though it exists in Shopify)
    newQty = qty;
    newWac = unitCost;

    // Create entry in our DB
    const { data: newItem, error: insertError } = await supabaseAdmin
      .from("inventory")
      .insert({
        variant_id: variant_id,
        product_name: "Pending Shopify Sync...", 
        stock: newQty,
        cost: newWac,
        category: "TCG",
        brand: "Ukjent"
      })
      .select()
      .single();

    if (insertError) throw insertError;
    inventoryId = newItem.id;
  } else {
    // Calculate new WAC
    const oldQty = currentInventory.stock || 0;
    const oldWac = Number(currentInventory.cost || 0);
    
    newQty = oldQty + qty;
    newWac = ((oldQty * oldWac) + (qty * unitCost)) / newQty;
    inventoryId = currentInventory.id;

    // Update entry in our DB
    const { error: updateError } = await supabaseAdmin
      .from("inventory")
      .update({
        stock: newQty,
        cost: newWac,
        last_sync: new Date().toISOString(),
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

  // 3. Log to Audit Trail
  await supabaseAdmin.from("audit_logs").insert({
    store_id: (await supabaseAdmin.from("inventory").select("store_id").eq("id", inventoryId).single()).data?.store_id,
    action: "REGISTER_PURCHASE",
    entity_type: "INVENTORY",
    details: { qty, unitCost, newWac, newQty },
    severity: "info"
  });

  // 3. Sync to Shopify
  // A. Update Cost
  const costSync = await updateInventoryCost(shopDomain, variant_id, newWac);
  
  // B. Update Inventory Level 
  let inventorySync = null;
  try {
    const locationId = await fetchPrimaryLocationId(shopDomain);
    inventorySync = await updateInventoryLevel(shopDomain, variant_id, locationId, newQty);
  } catch (err) {
    logger.error({ variant_id, err }, "[WAC] Failed to sync inventory level");
  }

  return { inventoryId, newQty, newWac, costSync, inventorySync };
}
