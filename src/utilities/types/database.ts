export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4";
  };
  public: {
    Tables: {
      component_settings: {
        Row: {
          component_key: string;
          created_at: string;
          description: string | null;
          id: string;
          is_enabled: boolean;
          label: string;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          component_key: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          is_enabled?: boolean;
          label: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          component_key?: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          is_enabled?: boolean;
          label?: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      Engine_type: {
        Row: {
          created_at: string;
          id: number;
          type: string | null;
        };
        Insert: {
          created_at?: string;
          id?: number;
          type?: string | null;
        };
        Update: {
          created_at?: string;
          id?: number;
          type?: string | null;
        };
        Relationships: [];
      };
      Engines: {
        Row: {
          created_at: string;
          id: number;
          name: string | null;
          plate_number: string | null;
          status: string | null;
          type: number | null;
          water_capacity: number | null;
        };
        Insert: {
          created_at?: string;
          id?: number;
          name?: string | null;
          plate_number?: string | null;
          status?: string | null;
          type?: number | null;
          water_capacity?: number | null;
        };
        Update: {
          created_at?: string;
          id?: number;
          name?: string | null;
          plate_number?: string | null;
          status?: string | null;
          type?: number | null;
          water_capacity?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "Engine_type_fkey";
            columns: ["type"];
            isOneToOne: false;
            referencedRelation: "Engine_type";
            referencedColumns: ["id"];
          },
        ];
      };
      Engines_Equipment: {
        Row: {
          assigned_by: number | null;
          created_at: string;
          engine_id: number | null;
          equipment_id: number | null;
          id: number;
          location_on_truck: string | null;
          quantity_assigned: number | null;
          unassigned_at: string | null;
          unassigned_by: number | null;
        };
        Insert: {
          assigned_by?: number | null;
          created_at?: string;
          engine_id?: number | null;
          equipment_id?: number | null;
          id?: number;
          location_on_truck?: string | null;
          quantity_assigned?: number | null;
          unassigned_at?: string | null;
          unassigned_by?: number | null;
        };
        Update: {
          assigned_by?: number | null;
          created_at?: string;
          engine_id?: number | null;
          equipment_id?: number | null;
          id?: number;
          location_on_truck?: string | null;
          quantity_assigned?: number | null;
          unassigned_at?: string | null;
          unassigned_by?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "Engines_Equipment_assigned_by_fkey";
            columns: ["assigned_by"];
            isOneToOne: false;
            referencedRelation: "Users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "Engines_Equipment_engine_id_fkey";
            columns: ["engine_id"];
            isOneToOne: false;
            referencedRelation: "Engines";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "Engines_Equipment_equipment_id_fkey";
            columns: ["equipment_id"];
            isOneToOne: false;
            referencedRelation: "Equipments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "Engines_Equipment_unassigned_by_fkey";
            columns: ["unassigned_by"];
            isOneToOne: false;
            referencedRelation: "Users";
            referencedColumns: ["id"];
          },
        ];
      };
      Equipments: {
        Row: {
          created_at: string;
          id: number;
          is_power_tool: boolean | null;
          name: string | null;
          status: string | null;
          total_down: number | null;
          total_in_service: number | null;
          total_quantity: number | null;
        };
        Insert: {
          created_at?: string;
          id?: number;
          is_power_tool?: boolean | null;
          name?: string | null;
          status?: string | null;
          total_down?: number | null;
          total_in_service?: number | null;
          total_quantity?: number | null;
        };
        Update: {
          created_at?: string;
          id?: number;
          is_power_tool?: boolean | null;
          name?: string | null;
          status?: string | null;
          total_down?: number | null;
          total_in_service?: number | null;
          total_quantity?: number | null;
        };
        Relationships: [];
      };
      Inspection_Equipment_Results: {
        Row: {
          created_at: string;
          engine_equipment_id: number | null;
          id: number;
          inspection_id: number | null;
          notes: string | null;
          status: boolean | null;
        };
        Insert: {
          created_at?: string;
          engine_equipment_id?: number | null;
          id?: number;
          inspection_id?: number | null;
          notes?: string | null;
          status?: boolean | null;
        };
        Update: {
          created_at?: string;
          engine_equipment_id?: number | null;
          id?: number;
          inspection_id?: number | null;
          notes?: string | null;
          status?: boolean | null;
        };
        Relationships: [
          {
            foreignKeyName: "Inspection_Equipement_Result_engine_equipment_id_fkey";
            columns: ["engine_equipment_id"];
            isOneToOne: false;
            referencedRelation: "Engines_Equipment";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "Inspection_Equipement_Result_inspection_id_fkey";
            columns: ["inspection_id"];
            isOneToOne: false;
            referencedRelation: "Inspections";
            referencedColumns: ["id"];
          },
        ];
      };
      Inspections: {
        Row: {
          battery_a_voltage: string | null;
          battery_b_voltage: string | null;
          engine_id: number | null;
          fuel_level: string | null;
          id: number;
          inspected_at: string;
          inspected_by: number | null;
          lights_and_siren: string | null;
          radio_status: string | null;
          remarks: string | null;
          water_level: string | null;
        };
        Insert: {
          battery_a_voltage?: string | null;
          battery_b_voltage?: string | null;
          engine_id?: number | null;
          fuel_level?: string | null;
          id?: number;
          inspected_at?: string;
          inspected_by?: number | null;
          lights_and_siren?: string | null;
          radio_status?: string | null;
          remarks?: string | null;
          water_level?: string | null;
        };
        Update: {
          battery_a_voltage?: string | null;
          battery_b_voltage?: string | null;
          engine_id?: number | null;
          fuel_level?: string | null;
          id?: number;
          inspected_at?: string;
          inspected_by?: number | null;
          lights_and_siren?: string | null;
          radio_status?: string | null;
          remarks?: string | null;
          water_level?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "Inspections_engine_id_fkey";
            columns: ["engine_id"];
            isOneToOne: false;
            referencedRelation: "Engines";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "Inspections_inspected_by_fkey";
            columns: ["inspected_by"];
            isOneToOne: false;
            referencedRelation: "Users";
            referencedColumns: ["id"];
          },
        ];
      };
      Issues: {
        Row: {
          created_at: string;
          description: string | null;
          end_date: string | null;
          engine_id: number | null;
          equipment_id: number | null;
          id: number;
          power_tool_id: number | null;
          priority: string;
          qa_by: string | null;
          repaired_by: string | null;
          reported_by: number | null;
          start_date: string | null;
          status: string;
          title: string;
          type: string;
          updated_at: string | null;
          updated_by: number | null;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          end_date?: string | null;
          engine_id?: number | null;
          equipment_id?: number | null;
          id?: never;
          power_tool_id?: number | null;
          priority?: string;
          qa_by?: string | null;
          repaired_by?: string | null;
          reported_by?: number | null;
          start_date?: string | null;
          status?: string;
          title: string;
          type: string;
          updated_at?: string | null;
          updated_by?: number | null;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          end_date?: string | null;
          engine_id?: number | null;
          equipment_id?: number | null;
          id?: never;
          power_tool_id?: number | null;
          priority?: string;
          qa_by?: string | null;
          repaired_by?: string | null;
          reported_by?: number | null;
          start_date?: string | null;
          status?: string;
          title?: string;
          type?: string;
          updated_at?: string | null;
          updated_by?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "Issues_engine_id_fkey";
            columns: ["engine_id"];
            isOneToOne: false;
            referencedRelation: "Engines";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "Issues_equipment_id_fkey";
            columns: ["equipment_id"];
            isOneToOne: false;
            referencedRelation: "Equipments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "Issues_power_tool_id_fkey";
            columns: ["power_tool_id"];
            isOneToOne: false;
            referencedRelation: "Equipments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "Issues_reported_by_fkey";
            columns: ["reported_by"];
            isOneToOne: false;
            referencedRelation: "Users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "issues_updated_by_fkey";
            columns: ["updated_by"];
            isOneToOne: false;
            referencedRelation: "Users";
            referencedColumns: ["id"];
          },
        ];
      };
      Positions: {
        Row: {
          created_at: string;
          id: number;
          name: string | null;
        };
        Insert: {
          created_at?: string;
          id?: number;
          name?: string | null;
        };
        Update: {
          created_at?: string;
          id?: number;
          name?: string | null;
        };
        Relationships: [];
      };
      PowerTool_Inspections: {
        Row: {
          created_at: string;
          equipment_id: number | null;
          fuel_level: string | null;
          id: number;
          inspected_by: number | null;
          is_running: boolean | null;
          last_maintenance_date: string | null;
          physical_condition: string | null;
          remarks: string | null;
        };
        Insert: {
          created_at?: string;
          equipment_id?: number | null;
          fuel_level?: string | null;
          id?: never;
          inspected_by?: number | null;
          is_running?: boolean | null;
          last_maintenance_date?: string | null;
          physical_condition?: string | null;
          remarks?: string | null;
        };
        Update: {
          created_at?: string;
          equipment_id?: number | null;
          fuel_level?: string | null;
          id?: never;
          inspected_by?: number | null;
          is_running?: boolean | null;
          last_maintenance_date?: string | null;
          physical_condition?: string | null;
          remarks?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "PowerTool_Inspections_equipment_id_fkey";
            columns: ["equipment_id"];
            isOneToOne: false;
            referencedRelation: "Equipments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "PowerTool_Inspections_inspected_by_fkey";
            columns: ["inspected_by"];
            isOneToOne: false;
            referencedRelation: "Users";
            referencedColumns: ["id"];
          },
        ];
      };
      PpeItems: {
        Row: {
          brand: string;
          category: Database["public"]["Enums"]["ppe_category"];
          created_at: string;
          id: number;
          issued: number;
          model: string;
          size: string;
          total: number;
          updated_at: string;
        };
        Insert: {
          brand: string;
          category: Database["public"]["Enums"]["ppe_category"];
          created_at?: string;
          id?: never;
          issued?: number;
          model: string;
          size: string;
          total?: number;
          updated_at?: string;
        };
        Update: {
          brand?: string;
          category?: Database["public"]["Enums"]["ppe_category"];
          created_at?: string;
          id?: never;
          issued?: number;
          model?: string;
          size?: string;
          total?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      PpeTransactions: {
        Row: {
          approved_by_name: string | null;
          condition: Database["public"]["Enums"]["ppe_condition"];
          created_at: string;
          firefighter_name: string | null;
          id: number;
          occurred_at: string;
          ppe_item_id: number;
          quantity: number;
          recorded_by: number;
          signature_path: string;
          type: Database["public"]["Enums"]["ppe_transaction_type"];
          user_id: number | null;
        };
        Insert: {
          approved_by_name?: string | null;
          condition: Database["public"]["Enums"]["ppe_condition"];
          created_at?: string;
          firefighter_name?: string | null;
          id?: never;
          occurred_at?: string;
          ppe_item_id: number;
          quantity: number;
          recorded_by: number;
          signature_path: string;
          type: Database["public"]["Enums"]["ppe_transaction_type"];
          user_id?: number | null;
        };
        Update: {
          approved_by_name?: string | null;
          condition?: Database["public"]["Enums"]["ppe_condition"];
          created_at?: string;
          firefighter_name?: string | null;
          id?: never;
          occurred_at?: string;
          ppe_item_id?: number;
          quantity?: number;
          recorded_by?: number;
          signature_path?: string;
          type?: Database["public"]["Enums"]["ppe_transaction_type"];
          user_id?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "PpeTransactions_ppe_item_id_fkey";
            columns: ["ppe_item_id"];
            isOneToOne: false;
            referencedRelation: "PpeItems";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "PpeTransactions_ppe_item_id_fkey";
            columns: ["ppe_item_id"];
            isOneToOne: false;
            referencedRelation: "PpeItemsWithAvailable";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "PpeTransactions_recorded_by_fkey";
            columns: ["recorded_by"];
            isOneToOne: false;
            referencedRelation: "Users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "PpeTransactions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "Users";
            referencedColumns: ["id"];
          },
        ];
      };
      Users: {
        Row: {
          auth_id: string;
          created_at: string;
          email: string | null;
          id: number;
          name: string | null;
          position_id: number | null;
          unit_number: number | null;
        };
        Insert: {
          auth_id: string;
          created_at?: string;
          email?: string | null;
          id?: number;
          name?: string | null;
          position_id?: number | null;
          unit_number?: number | null;
        };
        Update: {
          auth_id?: string;
          created_at?: string;
          email?: string | null;
          id?: number;
          name?: string | null;
          position_id?: number | null;
          unit_number?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "Users_position_id_fkey";
            columns: ["position_id"];
            isOneToOne: false;
            referencedRelation: "Positions";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      FirefighterPpeBalances: {
        Row: {
          firefighter_name: string | null;
          ppe_item_id: number | null;
          quantity_held: number | null;
          user_id: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "PpeTransactions_ppe_item_id_fkey";
            columns: ["ppe_item_id"];
            isOneToOne: false;
            referencedRelation: "PpeItems";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "PpeTransactions_ppe_item_id_fkey";
            columns: ["ppe_item_id"];
            isOneToOne: false;
            referencedRelation: "PpeItemsWithAvailable";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "PpeTransactions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "Users";
            referencedColumns: ["id"];
          },
        ];
      };
      PpeItemsWithAvailable: {
        Row: {
          available: number | null;
          brand: string | null;
          category: Database["public"]["Enums"]["ppe_category"] | null;
          created_at: string | null;
          id: number | null;
          is_low_stock: boolean | null;
          issued: number | null;
          model: string | null;
          size: string | null;
          total: number | null;
          updated_at: string | null;
        };
        Insert: {
          available?: never;
          brand?: string | null;
          category?: Database["public"]["Enums"]["ppe_category"] | null;
          created_at?: string | null;
          id?: number | null;
          is_low_stock?: never;
          issued?: number | null;
          model?: string | null;
          size?: string | null;
          total?: number | null;
          updated_at?: string | null;
        };
        Update: {
          available?: never;
          brand?: string | null;
          category?: Database["public"]["Enums"]["ppe_category"] | null;
          created_at?: string | null;
          id?: number | null;
          is_low_stock?: never;
          issued?: number | null;
          model?: string | null;
          size?: string | null;
          total?: number | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      current_position_id: { Args: never; Returns: number };
      get_my_position_id: { Args: never; Returns: number };
      is_admin: { Args: never; Returns: boolean };
      issue_ppe: {
        Args: {
          p_approved_by_name: string;
          p_condition: Database["public"]["Enums"]["ppe_condition"];
          p_firefighter_name?: string;
          p_occurred_at?: string;
          p_ppe_item_id: number;
          p_quantity: number;
          p_signature_path: string;
          p_user_id?: number;
        };
        Returns: {
          approved_by_name: string | null;
          condition: Database["public"]["Enums"]["ppe_condition"];
          created_at: string;
          firefighter_name: string | null;
          id: number;
          occurred_at: string;
          ppe_item_id: number;
          quantity: number;
          recorded_by: number;
          signature_path: string;
          type: Database["public"]["Enums"]["ppe_transaction_type"];
          user_id: number | null;
        };
        SetofOptions: {
          from: "*";
          to: "PpeTransactions";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      return_ppe: {
        Args: {
          p_condition: Database["public"]["Enums"]["ppe_condition"];
          p_firefighter_name?: string;
          p_occurred_at?: string;
          p_ppe_item_id: number;
          p_quantity: number;
          p_signature_path: string;
          p_user_id?: number;
        };
        Returns: {
          approved_by_name: string | null;
          condition: Database["public"]["Enums"]["ppe_condition"];
          created_at: string;
          firefighter_name: string | null;
          id: number;
          occurred_at: string;
          ppe_item_id: number;
          quantity: number;
          recorded_by: number;
          signature_path: string;
          type: Database["public"]["Enums"]["ppe_transaction_type"];
          user_id: number | null;
        };
        SetofOptions: {
          from: "*";
          to: "PpeTransactions";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
    };
    Enums: {
      ppe_category:
        | "Helmet"
        | "Turnout Coat"
        | "Turnout Pants"
        | "Boots"
        | "Gloves"
        | "Hood"
        | "SCBA";
      ppe_condition: "New" | "Good" | "Fair" | "Poor" | "Damaged";
      ppe_transaction_type: "issue" | "return";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      ppe_category: [
        "Helmet",
        "Turnout Coat",
        "Turnout Pants",
        "Boots",
        "Gloves",
        "Hood",
        "SCBA",
      ],
      ppe_condition: ["New", "Good", "Fair", "Poor", "Damaged"],
      ppe_transaction_type: ["issue", "return"],
    },
  },
} as const;
