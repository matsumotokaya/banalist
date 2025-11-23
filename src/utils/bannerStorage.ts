import { supabase } from './supabase';
import type { Banner, CanvasElement, Template } from '../types/template';

interface DbBanner {
  id: string;
  user_id: string;
  name: string;
  template: Template;
  elements: CanvasElement[];
  canvas_color: string;
  thumbnail_data_url: string | null;
  created_at: string;
  updated_at: string;
}

// Convert DB format to Banner format
const dbToBanner = (db: DbBanner): Banner => ({
  id: db.id,
  name: db.name,
  template: db.template,
  elements: db.elements,
  canvasColor: db.canvas_color,
  thumbnailDataURL: db.thumbnail_data_url || undefined,
  createdAt: db.created_at,
  updatedAt: db.updated_at,
});

export const bannerStorage = {
  // Get all banners
  async getAll(): Promise<Banner[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching banners:', error);
      return [];
    }

    return (data || []).map(dbToBanner);
  },

  // Get banner by ID
  async getById(id: string): Promise<Banner | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching banner:', error);
      return null;
    }

    return data ? dbToBanner(data) : null;
  },

  // Create new banner
  async create(name: string, template: Template): Promise<Banner | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('ログインが必要です');
      return null;
    }

    const defaultElements: CanvasElement[] = [
      {
        id: 'default-text',
        type: 'text',
        text: 'BANALISTでバナーをつくろう。',
        x: template.width / 2 - 550,
        y: template.height / 2 - 40,
        fontSize: 80,
        fontFamily: 'Arial',
        fill: '#000000',
        fillEnabled: true,
        stroke: '#000000',
        strokeWidth: 2,
        strokeEnabled: false,
        fontWeight: 400,
      },
    ];

    const { data, error } = await supabase
      .from('banners')
      .insert({
        user_id: user.id,
        name,
        template,
        elements: defaultElements,
        canvas_color: '#FFFFFF',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating banner:', error);
      alert('バナーの作成に失敗しました');
      return null;
    }

    return data ? dbToBanner(data) : null;
  },

  // Update banner
  async update(id: string, updates: Partial<Omit<Banner, 'id' | 'createdAt'>>): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.template !== undefined) dbUpdates.template = updates.template;
    if (updates.elements !== undefined) dbUpdates.elements = updates.elements;
    if (updates.canvasColor !== undefined) dbUpdates.canvas_color = updates.canvasColor;
    if (updates.thumbnailDataURL !== undefined) dbUpdates.thumbnail_data_url = updates.thumbnailDataURL;

    const { error } = await supabase
      .from('banners')
      .update(dbUpdates)
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating banner:', error);
    }
  },

  // Delete banner
  async delete(id: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('banners')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting banner:', error);
    }
  },

  // Duplicate banner
  async duplicate(id: string): Promise<Banner | null> {
    const original = await this.getById(id);
    if (!original) return null;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('banners')
      .insert({
        user_id: user.id,
        name: `${original.name} (Copy)`,
        template: original.template,
        elements: JSON.parse(JSON.stringify(original.elements)),
        canvas_color: original.canvasColor,
      })
      .select()
      .single();

    if (error) {
      console.error('Error duplicating banner:', error);
      return null;
    }

    return data ? dbToBanner(data) : null;
  },

  // Save elements (for auto-save in editor)
  async saveElements(id: string, elements: CanvasElement[]): Promise<void> {
    await this.update(id, { elements });
  },

  // Save canvas color
  async saveCanvasColor(id: string, canvasColor: string): Promise<void> {
    await this.update(id, { canvasColor });
  },

  // Save thumbnail
  async saveThumbnail(id: string, thumbnailDataURL: string): Promise<void> {
    await this.update(id, { thumbnailDataURL });
  },
};
