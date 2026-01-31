import { supabase } from './supabase';
import type { CanvasElement, TemplateRecord } from '../types/template';

interface DbTemplate {
  id: string;
  name: string;
  elements?: CanvasElement[] | null;
  canvas_color: string;
  thumbnail_url: string | null;
  plan_type: 'free' | 'premium' | null;
  display_order?: number | null;
  width?: number | null;
  height?: number | null;
}

const dbToTemplate = (db: DbTemplate): TemplateRecord => ({
  id: db.id,
  name: db.name,
  elements: db.elements ?? undefined,
  canvasColor: db.canvas_color,
  thumbnailUrl: db.thumbnail_url || undefined,
  planType: db.plan_type || undefined,
  displayOrder: db.display_order ?? undefined,
  width: db.width ?? undefined,
  height: db.height ?? undefined,
});

export const templateStorage = {
  async getPublicTemplates(): Promise<TemplateRecord[]> {
    const { data, error } = await supabase
      .from('templates')
      .select('id, name, canvas_color, thumbnail_url, plan_type, display_order, updated_at')
      .order('display_order', { ascending: true, nullsFirst: false })
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching templates:', error);
      return [];
    }

    return (data || []).map(dbToTemplate);
  },

  async getById(id: string): Promise<TemplateRecord | null> {
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching template:', error);
      return null;
    }

    return data ? dbToTemplate(data) : null;
  },

  async createTemplate(params: {
    name: string;
    elements: CanvasElement[];
    canvasColor: string;
    thumbnailUrl?: string;
    planType: 'free' | 'premium';
    displayOrder?: number;
    width: number;
    height: number;
  }): Promise<string | null> {
    const { data, error } = await supabase
      .from('templates')
      .insert({
        name: params.name,
        elements: params.elements,
        canvas_color: params.canvasColor,
        thumbnail_url: params.thumbnailUrl || null,
        plan_type: params.planType,
        display_order: params.displayOrder || null,
        width: params.width,
        height: params.height,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating template:', error);
      throw error;
    }

    return data?.id || null;
  },
};
