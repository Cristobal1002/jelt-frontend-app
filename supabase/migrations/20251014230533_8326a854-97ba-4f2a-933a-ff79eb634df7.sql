-- Create purchase_orders table
CREATE TABLE public.purchase_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  po_number TEXT NOT NULL UNIQUE,
  supplier TEXT NOT NULL,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'ordered', 'received', 'cancelled')),
  notes TEXT,
  expected_delivery_date DATE,
  created_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create purchase_order_items table
CREATE TABLE public.purchase_order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  purchase_order_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_cost NUMERIC NOT NULL CHECK (unit_cost >= 0),
  subtotal NUMERIC NOT NULL CHECK (subtotal >= 0),
  alert_id UUID REFERENCES public.stock_alerts(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for purchase_orders
CREATE POLICY "Purchase orders are viewable by everyone"
ON public.purchase_orders
FOR SELECT
USING (true);

CREATE POLICY "Purchase orders are editable by authenticated users"
ON public.purchase_orders
FOR ALL
USING (auth.uid() IS NOT NULL);

-- Create RLS policies for purchase_order_items
CREATE POLICY "Purchase order items are viewable by everyone"
ON public.purchase_order_items
FOR SELECT
USING (true);

CREATE POLICY "Purchase order items are editable by authenticated users"
ON public.purchase_order_items
FOR ALL
USING (auth.uid() IS NOT NULL);

-- Create indexes
CREATE INDEX idx_purchase_orders_status ON public.purchase_orders(status);
CREATE INDEX idx_purchase_orders_supplier ON public.purchase_orders(supplier);
CREATE INDEX idx_purchase_order_items_po_id ON public.purchase_order_items(purchase_order_id);
CREATE INDEX idx_purchase_order_items_product_id ON public.purchase_order_items(product_id);

-- Create triggers for updated_at
CREATE TRIGGER update_purchase_orders_updated_at
BEFORE UPDATE ON public.purchase_orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_purchase_order_items_updated_at
BEFORE UPDATE ON public.purchase_order_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate PO number
CREATE OR REPLACE FUNCTION public.generate_po_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  next_number INTEGER;
  po_number TEXT;
BEGIN
  -- Get the next sequential number
  SELECT COALESCE(MAX(CAST(SUBSTRING(po_number FROM 8) AS INTEGER)), 0) + 1
  INTO next_number
  FROM public.purchase_orders
  WHERE po_number LIKE 'PO-2025-%';
  
  -- Format as PO-YYYY-NNNN
  po_number := 'PO-2025-' || LPAD(next_number::TEXT, 4, '0');
  
  RETURN po_number;
END;
$$;