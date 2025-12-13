export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      monthly_inventory: {
        Row: {
          created_at: string | null
          forecast: number
          id: string
          month: number
          product_id: string
          quantity: number
          sales: number
          updated_at: string | null
          year: number
        }
        Insert: {
          created_at?: string | null
          forecast?: number
          id?: string
          month: number
          product_id: string
          quantity?: number
          sales?: number
          updated_at?: string | null
          year: number
        }
        Update: {
          created_at?: string | null
          forecast?: number
          id?: string
          month?: number
          product_id?: string
          quantity?: number
          sales?: number
          updated_at?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "monthly_inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string
          created_at: string | null
          id: string
          lead_time_days: number
          name: string
          reorder_point: number
          site: string
          sku: string
          supplier: string
          unit_cost: number
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          lead_time_days?: number
          name: string
          reorder_point?: number
          site?: string
          sku: string
          supplier: string
          unit_cost: number
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          lead_time_days?: number
          name?: string
          reorder_point?: number
          site?: string
          sku?: string
          supplier?: string
          unit_cost?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      purchase_order_items: {
        Row: {
          alert_id: string | null
          created_at: string
          id: string
          product_id: string
          purchase_order_id: string
          quantity: number
          subtotal: number
          unit_cost: number
          updated_at: string
        }
        Insert: {
          alert_id?: string | null
          created_at?: string
          id?: string
          product_id: string
          purchase_order_id: string
          quantity: number
          subtotal: number
          unit_cost: number
          updated_at?: string
        }
        Update: {
          alert_id?: string | null
          created_at?: string
          id?: string
          product_id?: string
          purchase_order_id?: string
          quantity?: number
          subtotal?: number
          unit_cost?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_items_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "stock_alerts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          created_by: string | null
          expected_delivery_date: string | null
          id: string
          notes: string | null
          po_number: string
          status: string
          supplier: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          expected_delivery_date?: string | null
          id?: string
          notes?: string | null
          po_number: string
          status?: string
          supplier: string
          total_amount?: number
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          expected_delivery_date?: string | null
          id?: string
          notes?: string | null
          po_number?: string
          status?: string
          supplier?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      stock_alerts: {
        Row: {
          alert_type: string
          created_at: string
          current_stock: number
          days_of_coverage: number
          id: string
          is_active: boolean
          message: string
          product_id: string
          resolved_at: string | null
          severity: string
          suggested_po_date: string | null
          suggested_reorder_qty: number
          updated_at: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          current_stock: number
          days_of_coverage: number
          id?: string
          is_active?: boolean
          message: string
          product_id: string
          resolved_at?: string | null
          severity: string
          suggested_po_date?: string | null
          suggested_reorder_qty: number
          updated_at?: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          current_stock?: number
          days_of_coverage?: number
          id?: string
          is_active?: boolean
          message?: string
          product_id?: string
          resolved_at?: string | null
          severity?: string
          suggested_po_date?: string | null
          suggested_reorder_qty?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_alerts_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_po_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_stock_alerts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
