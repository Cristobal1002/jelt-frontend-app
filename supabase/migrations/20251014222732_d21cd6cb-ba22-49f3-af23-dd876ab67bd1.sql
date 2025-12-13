-- Create function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  supplier TEXT NOT NULL,
  unit_cost DECIMAL(10, 2) NOT NULL,
  reorder_point INTEGER NOT NULL DEFAULT 50,
  lead_time_days INTEGER NOT NULL DEFAULT 7,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create monthly inventory table
CREATE TABLE IF NOT EXISTS public.monthly_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  sales INTEGER NOT NULL DEFAULT 0,
  forecast INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(product_id, month, year)
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_inventory ENABLE ROW LEVEL SECURITY;

-- Create policies for products (public read access for dashboard)
CREATE POLICY "Products are viewable by everyone"
  ON public.products
  FOR SELECT
  USING (true);

CREATE POLICY "Products are editable by authenticated users"
  ON public.products
  FOR ALL
  USING (auth.uid() IS NOT NULL);

-- Create policies for monthly_inventory (public read access for dashboard)
CREATE POLICY "Monthly inventory is viewable by everyone"
  ON public.monthly_inventory
  FOR SELECT
  USING (true);

CREATE POLICY "Monthly inventory is editable by authenticated users"
  ON public.monthly_inventory
  FOR ALL
  USING (auth.uid() IS NOT NULL);

-- Create indexes for better performance
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_supplier ON public.products(supplier);
CREATE INDEX idx_monthly_inventory_product ON public.monthly_inventory(product_id);
CREATE INDEX idx_monthly_inventory_date ON public.monthly_inventory(year, month);

-- Create triggers for updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_monthly_inventory_updated_at
  BEFORE UPDATE ON public.monthly_inventory
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample products (50 products across different categories)
INSERT INTO public.products (sku, name, category, supplier, unit_cost, reorder_point, lead_time_days) VALUES
  -- EPP (Equipo de Protección Personal)
  ('EPP-001', 'Guantes Nitrilo Talla M', 'EPP', 'MedSupply Co', 15000, 100, 5),
  ('EPP-002', 'Mascarilla N95', 'EPP', 'SafeGuard Inc', 8000, 200, 7),
  ('EPP-003', 'Bata Quirúrgica Desechable', 'EPP', 'MedSupply Co', 12000, 80, 5),
  ('EPP-004', 'Gafas Protectoras', 'EPP', 'SafeGuard Inc', 25000, 50, 10),
  ('EPP-005', 'Guantes Látex Talla L', 'EPP', 'MedSupply Co', 14000, 120, 5),
  ('EPP-006', 'Cofia Desechable', 'EPP', 'SafeGuard Inc', 5000, 150, 3),
  ('EPP-007', 'Zapatos Quirúrgicos', 'EPP', 'MedSupply Co', 18000, 60, 7),
  ('EPP-008', 'Mascarilla Quirúrgica Triple Capa', 'EPP', 'SafeGuard Inc', 3000, 300, 3),
  ('EPP-009', 'Delantal Impermeable', 'EPP', 'MedSupply Co', 22000, 40, 10),
  ('EPP-010', 'Protector Facial', 'EPP', 'SafeGuard Inc', 35000, 30, 12),
  
  -- Inyectables
  ('INY-001', 'Jeringa 5ml Con Aguja', 'Inyectables', 'PharmaDist', 2500, 500, 3),
  ('INY-002', 'Catéter Venoso 20G', 'Inyectables', 'MediTech SA', 4500, 200, 5),
  ('INY-003', 'Suero Fisiológico 500ml', 'Inyectables', 'PharmaDist', 6000, 300, 4),
  ('INY-004', 'Insulina Rápida 100UI', 'Inyectables', 'BioPharm Ltd', 45000, 80, 14),
  ('INY-005', 'Heparina 5000UI', 'Inyectables', 'PharmaDist', 35000, 100, 10),
  ('INY-006', 'Jeringa Insulina 1ml', 'Inyectables', 'MediTech SA', 3000, 400, 5),
  ('INY-007', 'Aguja Hipodérmica 21G', 'Inyectables', 'PharmaDist', 1500, 600, 3),
  ('INY-008', 'Equipo Venoclisis Macrogotero', 'Inyectables', 'MediTech SA', 8000, 150, 7),
  ('INY-009', 'Llave Tres Vías', 'Inyectables', 'PharmaDist', 5500, 200, 5),
  ('INY-010', 'Bomba Infusión Desechable', 'Inyectables', 'BioPharm Ltd', 65000, 40, 15),
  
  -- Dental
  ('DEN-001', 'Composite Universal A2', 'Dental', 'DentalPro', 85000, 30, 10),
  ('DEN-002', 'Anestesia Lidocaína 2%', 'Dental', 'PharmaDist', 15000, 100, 7),
  ('DEN-003', 'Dique de Goma Dental', 'Dental', 'DentalPro', 12000, 50, 12),
  ('DEN-004', 'Fresa Diamante Redonda', 'Dental', 'DentalPro', 8500, 80, 14),
  ('DEN-005', 'Cemento Dental Temporal', 'Dental', 'MediTech SA', 25000, 40, 10),
  ('DEN-006', 'Brackets Metálicos Kit', 'Dental', 'OrthoSupply', 120000, 20, 20),
  ('DEN-007', 'Alginato Impresión Dental', 'Dental', 'DentalPro', 35000, 35, 12),
  ('DEN-008', 'Eyector Saliva Desechable', 'Dental', 'MediTech SA', 4000, 200, 5),
  ('DEN-009', 'Rollos Algodón Dental', 'Dental', 'DentalPro', 6000, 150, 7),
  ('DEN-010', 'Cubeta Impresión Superior', 'Dental', 'OrthoSupply', 18000, 60, 15),
  
  -- Dermatología
  ('DRM-001', 'Crema Hidratante Facial 50ml', 'Dermatología', 'DermaCare', 45000, 60, 8),
  ('DRM-002', 'Protector Solar SPF50 100ml', 'Dermatología', 'DermaCare', 55000, 80, 10),
  ('DRM-003', 'Ácido Hialurónico Sérum', 'Dermatología', 'BeautyMed', 120000, 30, 15),
  ('DRM-004', 'Retinol Crema Nocturna', 'Dermatología', 'DermaCare', 95000, 40, 12),
  ('DRM-005', 'Limpiador Facial Suave', 'Dermatología', 'BeautyMed', 35000, 70, 8),
  ('DRM-006', 'Vitamina C Sérum 30ml', 'Dermatología', 'DermaCare', 85000, 50, 10),
  ('DRM-007', 'Mascarilla Arcilla Purificante', 'Dermatología', 'BeautyMed', 40000, 45, 12),
  ('DRM-008', 'Contorno Ojos Antiedad', 'Dermatología', 'DermaCare', 75000, 35, 14),
  ('DRM-009', 'Exfoliante Facial Enzimático', 'Dermatología', 'BeautyMed', 50000, 55, 10),
  ('DRM-010', 'Tónico Facial Balance pH', 'Dermatología', 'DermaCare', 38000, 60, 8),
  
  -- Ortopedia
  ('ORT-001', 'Vendaje Elástico 10cm', 'Ortopedia', 'OrthoSupply', 8000, 150, 5),
  ('ORT-002', 'Férula Muñeca Ajustable', 'Ortopedia', 'MediTech SA', 45000, 40, 12),
  ('ORT-003', 'Rodillera Neopreno', 'Ortopedia', 'OrthoSupply', 55000, 50, 10),
  ('ORT-004', 'Cabestrillo Inmovilizador', 'Ortopedia', 'MediTech SA', 25000, 60, 8),
  ('ORT-005', 'Collarín Cervical Ajustable', 'Ortopedia', 'OrthoSupply', 65000, 30, 15),
  ('ORT-006', 'Muletas Aluminio Par', 'Ortopedia', 'MediTech SA', 120000, 20, 14),
  ('ORT-007', 'Tobillera Compresión', 'Ortopedia', 'OrthoSupply', 35000, 70, 8),
  ('ORT-008', 'Faja Lumbar Soporte', 'Ortopedia', 'MediTech SA', 75000, 45, 10),
  ('ORT-009', 'Plantillas Ortopédicas', 'Ortopedia', 'OrthoSupply', 50000, 55, 12),
  ('ORT-010', 'Caminador Plegable', 'Ortopedia', 'MediTech SA', 280000, 15, 20);