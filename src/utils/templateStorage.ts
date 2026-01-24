import { supabase } from './supabase';
import type { CanvasElement, TemplateRecord } from '../types/template';

interface DbTemplate {
  id: string;
  name: string;
  elements?: CanvasElement[] | null;
  canvas_color: string;
  thumbnail_url: string | null;
  plan_type: 'free' | 'premium' | null;
  width?: number | null;
  height?: number | null;
}

const dbToTemplate = (db: DbTemplate): TemplateRecord => ({
  id: db.id,
  name: db.name,
  elements: db.elements ?? undefined,
  canvasColor: db.canvas_color,
  thumbnailUrl: db.thumbnail_url || undefined,
  planType: db.plan_type || 'free',
  width: db.width ?? undefined,
  height: db.height ?? undefined,
});

export const templateStorage = {
  async getPublicTemplates(): Promise<TemplateRecord[]> {
    const { data, error } = await supabase
      .from('templates')
      .select('id, name, canvas_color, thumbnail_url, plan_type, updated_at')
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
};
