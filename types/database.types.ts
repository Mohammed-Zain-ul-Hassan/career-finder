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
            interviews: {
                Row: {
                    company: string | null
                    created_at: string
                    date: string | null
                    id: string
                    job_match_id: string | null
                    status: Database["public"]["Enums"]["interview_status"] | null
                    title: string
                    user_id: string
                }
                Insert: {
                    company?: string | null
                    created_at?: string
                    date?: string | null
                    id?: string
                    job_match_id?: string | null
                    status?: Database["public"]["Enums"]["interview_status"] | null
                    title: string
                    user_id: string
                }
                Update: {
                    company?: string | null
                    created_at?: string
                    date?: string | null
                    id?: string
                    job_match_id?: string | null
                    status?: Database["public"]["Enums"]["interview_status"] | null
                    title?: string
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "interviews_job_match_id_fkey"
                        columns: ["job_match_id"]
                        isOneToOne: false
                        referencedRelation: "job_matches"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "interviews_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            job_searches: {
                Row: {
                    id: string
                    user_id: string
                    roles: string[]
                    locations: string[]
                    keywords: string[]
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    roles: string[]
                    locations: string[]
                    keywords: string[]
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    roles?: string[]
                    locations?: string[]
                    keywords?: string[]
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "job_searches_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            job_matches: {
                Row: {
                    created_at: string
                    id: string
                    job_id: string
                    match_reason: string | null
                    relevance_score: number | null
                    search_id: string | null
                    status: Database["public"]["Enums"]["job_match_status"] | null
                    user_id: string
                }
                Insert: {
                    created_at?: string
                    id?: string
                    job_id: string
                    match_reason?: string | null
                    relevance_score?: number | null
                    search_id?: string | null
                    status?: Database["public"]["Enums"]["job_match_status"] | null
                    user_id: string
                }
                Update: {
                    created_at?: string
                    id?: string
                    job_id?: string
                    match_reason?: string | null
                    relevance_score?: number | null
                    search_id?: string | null
                    status?: Database["public"]["Enums"]["job_match_status"] | null
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "job_matches_job_id_fkey"
                        columns: ["job_id"]
                        isOneToOne: false
                        referencedRelation: "jobs"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "job_matches_search_id_fkey"
                        columns: ["search_id"]
                        isOneToOne: false
                        referencedRelation: "job_searches"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "job_matches_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            jobs: {
                Row: {
                    company: string
                    created_at: string
                    description: string | null
                    id: string
                    location: string | null
                    posted_at: string | null
                    salary_range: string | null
                    source: string | null
                    title: string
                    url: string
                }
                Insert: {
                    company: string
                    created_at?: string
                    description?: string | null
                    id?: string
                    location?: string | null
                    posted_at?: string | null
                    salary_range?: string | null
                    source?: string | null
                    title: string
                    url: string
                }
                Update: {
                    company?: string
                    created_at?: string
                    description?: string | null
                    id?: string
                    location?: string | null
                    posted_at?: string | null
                    salary_range?: string | null
                    source?: string | null
                    title?: string
                    url?: string
                }
                Relationships: []
            }
            prep_materials: {
                Row: {
                    content: Json
                    created_at: string
                    id: string
                    interview_id: string
                    type: string
                }
                Insert: {
                    content: Json
                    created_at?: string
                    id?: string
                    interview_id: string
                    type: string
                }
                Update: {
                    content?: Json
                    created_at?: string
                    id?: string
                    interview_id?: string
                    type?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "prep_materials_interview_id_fkey"
                        columns: ["interview_id"]
                        isOneToOne: false
                        referencedRelation: "interviews"
                        referencedColumns: ["id"]
                    },
                ]
            }
            profiles: {
                Row: {
                    avatar_url: string | null
                    created_at: string
                    email: string | null
                    full_name: string | null
                    id: string
                    updated_at: string
                }
                Insert: {
                    avatar_url?: string | null
                    created_at?: string
                    email?: string | null
                    full_name?: string | null
                    id: string
                    updated_at?: string
                }
                Update: {
                    avatar_url?: string | null
                    created_at?: string
                    email?: string | null
                    full_name?: string | null
                    id?: string
                    updated_at?: string
                }
                Relationships: []
            }
            resumes: {
                Row: {
                    created_at: string
                    file_path: string
                    id: string
                    original_name: string
                    structured_data: Json | null
                    updated_at: string
                    user_id: string
                }
                Insert: {
                    created_at?: string
                    file_path: string
                    id?: string
                    original_name: string
                    structured_data?: Json | null
                    updated_at?: string
                    user_id: string
                }
                Update: {
                    created_at?: string
                    file_path?: string
                    id?: string
                    original_name?: string
                    structured_data?: Json | null
                    updated_at?: string
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "resumes_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            interview_status: "scheduled" | "completed" | "cancelled"
            job_match_status: "new" | "applied" | "interviewing" | "rejected" | "offer"
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
    PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: Exclude<keyof Database, "__InternalSupabase"> },
    TableName extends PublicTableNameOrOptions extends { schema: Exclude<keyof Database, "__InternalSupabase"> }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: Exclude<keyof Database, "__InternalSupabase"> }
    ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
            Row: infer R
        }
    ? R
    : never
    : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
            Row: infer R
        }
    ? R
    : never
    : never

export type TablesInsert<
    PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: Exclude<keyof Database, "__InternalSupabase"> },
    TableName extends PublicTableNameOrOptions extends { schema: Exclude<keyof Database, "__InternalSupabase"> }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: Exclude<keyof Database, "__InternalSupabase"> }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Insert: infer I
    }
    ? I
    : never
    : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
    }
    ? I
    : never
    : never

export type TablesUpdate<
    PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: Exclude<keyof Database, "__InternalSupabase"> },
    TableName extends PublicTableNameOrOptions extends { schema: Exclude<keyof Database, "__InternalSupabase"> }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: Exclude<keyof Database, "__InternalSupabase"> }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Update: infer U
    }
    ? U
    : never
    : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
    }
    ? U
    : never
    : never

export type Enums<
    PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: Exclude<keyof Database, "__InternalSupabase"> },
    EnumName extends PublicEnumNameOrOptions extends { schema: Exclude<keyof Database, "__InternalSupabase"> }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: Exclude<keyof Database, "__InternalSupabase"> }
    ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
    PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: Exclude<keyof Database, "__InternalSupabase"> },
    CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
        schema: Exclude<keyof Database, "__InternalSupabase">
    }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: Exclude<keyof Database, "__InternalSupabase"> }
    ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
    : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
