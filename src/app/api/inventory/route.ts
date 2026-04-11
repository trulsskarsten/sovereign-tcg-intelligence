import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data: items, error } = await supabase
      .from('inventory')
      .select('*')
      .order('product_name', { ascending: true });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: items
    });

  } catch (error: any) {
    console.error("Inventory API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
