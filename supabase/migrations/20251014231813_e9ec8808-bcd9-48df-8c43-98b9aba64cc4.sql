-- Enable realtime for stock_alerts table
ALTER TABLE public.stock_alerts REPLICA IDENTITY FULL;

-- Enable realtime for purchase_orders table  
ALTER TABLE public.purchase_orders REPLICA IDENTITY FULL;

-- Enable realtime for purchase_order_items table
ALTER TABLE public.purchase_order_items REPLICA IDENTITY FULL;

-- Enable realtime for monthly_inventory table
ALTER TABLE public.monthly_inventory REPLICA IDENTITY FULL;