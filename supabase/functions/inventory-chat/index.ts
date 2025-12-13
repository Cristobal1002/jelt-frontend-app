import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory = [] } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get current inventory data
    const { data: products } = await supabase
      .from('products')
      .select('id, name, sku, category, supplier, unit_cost, lead_time_days, reorder_point, site');
    
    const { data: monthlyInventory } = await supabase
      .from('monthly_inventory')
      .select('*')
      .eq('year', new Date().getFullYear())
      .eq('month', new Date().getMonth() + 1);
    
    const { data: stockAlerts } = await supabase
      .from('stock_alerts')
      .select(`
        *,
        products!inner(name, sku, supplier, category)
      `)
      .eq('is_active', true);

    const contextData = {
      products: products || [],
      monthly_inventory: monthlyInventory || [],
      stock_alerts: stockAlerts || []
    };

    const systemPrompt = `You are an inventory management expert. Respond in English.

You have access to the following inventory data:
${JSON.stringify(contextData, null, 2)}

Answer questions about:
- Current product stock
- Products with low stock (active alerts)
- Supplier information
- Product categories
- Sales analysis and forecasts
- Lead times

If you detect products with critical stock (less than 10 days coverage) or high/medium severity alerts, mention at the end: "I recommend creating a purchase order for these products."

Be concise, clear, and helpful.`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      { role: "user", content: message }
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits to your Lovable AI workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Check if we should suggest creating a PO
    const shouldCreatePO = aiResponse.toLowerCase().includes("purchase order") ||
                          (stockAlerts && stockAlerts.some((a: any) => 
                            a.severity === 'high' || a.severity === 'medium'
                          ));

    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        shouldCreatePO,
        alertsCount: stockAlerts?.length || 0
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in inventory-chat:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
