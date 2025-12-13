-- Add site column to products table
ALTER TABLE public.products 
ADD COLUMN site TEXT NOT NULL DEFAULT 'Clínica Principal';

-- Update existing products with different sites
UPDATE public.products 
SET site = CASE 
  WHEN RANDOM() < 0.4 THEN 'Clínica Principal'
  WHEN RANDOM() < 0.7 THEN 'Sucursal Norte'
  ELSE 'Sucursal Oeste'
END;

-- Create index for better performance
CREATE INDEX idx_products_site ON public.products(site);