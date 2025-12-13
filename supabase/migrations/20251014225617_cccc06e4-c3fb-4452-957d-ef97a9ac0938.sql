-- Create stock_alerts table
CREATE TABLE public.stock_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('high', 'medium', 'low')),
  message TEXT NOT NULL,
  days_of_coverage INTEGER NOT NULL,
  current_stock INTEGER NOT NULL,
  suggested_reorder_qty INTEGER NOT NULL,
  suggested_po_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.stock_alerts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Stock alerts are viewable by everyone"
ON public.stock_alerts
FOR SELECT
USING (true);

CREATE POLICY "Stock alerts are editable by authenticated users"
ON public.stock_alerts
FOR ALL
USING (auth.uid() IS NOT NULL);

-- Create index for faster queries
CREATE INDEX idx_stock_alerts_product_id ON public.stock_alerts(product_id);
CREATE INDEX idx_stock_alerts_active ON public.stock_alerts(is_active);
CREATE INDEX idx_stock_alerts_severity ON public.stock_alerts(severity);

-- Create trigger for updated_at
CREATE TRIGGER update_stock_alerts_updated_at
BEFORE UPDATE ON public.stock_alerts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to generate stock alerts
CREATE OR REPLACE FUNCTION public.generate_stock_alerts()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  product_record RECORD;
  inventory_record RECORD;
  coverage_days INTEGER;
  alert_severity TEXT;
  alert_message TEXT;
  reorder_qty INTEGER;
  po_date DATE;
BEGIN
  -- Get current month and year
  DECLARE
    current_month INTEGER := EXTRACT(MONTH FROM CURRENT_DATE);
    current_year INTEGER := EXTRACT(YEAR FROM CURRENT_DATE);
  BEGIN
    -- Loop through all products
    FOR product_record IN 
      SELECT p.*, mi.quantity, mi.sales
      FROM public.products p
      INNER JOIN public.monthly_inventory mi ON p.id = mi.product_id
      WHERE mi.month = current_month AND mi.year = current_year
    LOOP
      -- Calculate days of coverage
      IF product_record.sales > 0 THEN
        coverage_days := ROUND((product_record.quantity::NUMERIC / product_record.sales) * 30);
      ELSE
        coverage_days := 999;
      END IF;
      
      -- Only create alert if coverage is low
      IF coverage_days < 30 THEN
        -- Determine severity
        IF coverage_days < 10 THEN
          alert_severity := 'high';
          alert_message := 'Riesgo crítico de desabastecimiento. Acción inmediata requerida.';
        ELSIF coverage_days < 15 THEN
          alert_severity := 'medium';
          alert_message := 'Stock bajo. Considerar reorden pronto.';
        ELSE
          alert_severity := 'low';
          alert_message := 'Monitorear niveles de stock.';
        END IF;
        
        -- Calculate reorder quantity
        reorder_qty := GREATEST(0, product_record.reorder_point - product_record.quantity);
        
        -- Calculate suggested PO date
        po_date := CURRENT_DATE + (coverage_days - product_record.lead_time_days - 5);
        IF po_date < CURRENT_DATE THEN
          po_date := CURRENT_DATE;
        END IF;
        
        -- Check if alert already exists
        IF NOT EXISTS (
          SELECT 1 FROM public.stock_alerts
          WHERE product_id = product_record.id
          AND is_active = true
          AND alert_type = 'low_stock'
        ) THEN
          -- Insert new alert
          INSERT INTO public.stock_alerts (
            product_id,
            alert_type,
            severity,
            message,
            days_of_coverage,
            current_stock,
            suggested_reorder_qty,
            suggested_po_date,
            is_active
          ) VALUES (
            product_record.id,
            'low_stock',
            alert_severity,
            alert_message,
            coverage_days,
            product_record.quantity,
            reorder_qty,
            po_date,
            true
          );
        ELSE
          -- Update existing alert
          UPDATE public.stock_alerts
          SET 
            severity = alert_severity,
            message = alert_message,
            days_of_coverage = coverage_days,
            current_stock = product_record.quantity,
            suggested_reorder_qty = reorder_qty,
            suggested_po_date = po_date,
            updated_at = now()
          WHERE product_id = product_record.id
          AND is_active = true
          AND alert_type = 'low_stock';
        END IF;
      ELSE
        -- Mark alert as resolved if coverage is now adequate
        UPDATE public.stock_alerts
        SET 
          is_active = false,
          resolved_at = now()
        WHERE product_id = product_record.id
        AND is_active = true
        AND alert_type = 'low_stock';
      END IF;
    END LOOP;
  END;
END;
$$;