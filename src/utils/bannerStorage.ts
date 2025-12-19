import { supabase } from './supabase';
import { cacheManager } from './cacheManager';
import type { Banner, CanvasElement, Template } from '../types/template';

interface DbBanner {
  id: string;
  user_id: string;
  name: string;
  template: Template;
  elements: CanvasElement[];
  canvas_color: string;
  thumbnail_data_url: string | null;
  plan_type?: 'free' | 'premium' | null;
  is_public?: boolean | null;
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
  planType: db.plan_type || 'free',
  isPublic: db.is_public || false,
  createdAt: db.created_at,
  updatedAt: db.updated_at,
});

export const bannerStorage = {
  // Get all banners (public + own private)
  async getAll(useCache = true): Promise<Banner[]> {
    const { data: { user } } = await supabase.auth.getUser();

    const cacheKey = user ? `banners:all:${user.id}` : 'banners:public';

    // Check cache first
    if (useCache) {
      const cached = cacheManager.get<Banner[]>(cacheKey);
      if (cached) {
        console.log('✅ Cache hit: banners list');
        return cached;
      }
    }

    // RLS policy handles access control: public banners OR own banners
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching banners:', error);
      return [];
    }

    const banners = (data || []).map(dbToBanner);

    // Cache for 5 minutes
    cacheManager.set(cacheKey, banners, 5 * 60 * 1000);

    return banners;
  },

  // Get banner by ID (public or own)
  async getById(id: string, useCache = true): Promise<Banner | null> {
    const cacheKey = `banner:${id}`;

    // Check cache first
    if (useCache) {
      const cached = cacheManager.get<Banner>(cacheKey);
      if (cached) {
        console.log(`✅ Cache hit: banner ${id}`);
        return cached;
      }
    }

    // RLS policy handles access control: public banners OR own banners
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching banner:', error);
      return null;
    }

    const banner = data ? dbToBanner(data) : null;

    if (banner) {
      // Cache for 5 minutes
      cacheManager.set(cacheKey, banner, 5 * 60 * 1000);
    }

    return banner;
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

    // Invalidate list cache
    cacheManager.invalidate(`banners:all:${user.id}`);

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
    if (updates.planType !== undefined) dbUpdates.plan_type = updates.planType;
    if (updates.isPublic !== undefined) dbUpdates.is_public = updates.isPublic;

    const { error } = await supabase
      .from('banners')
      .update(dbUpdates)
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating banner:', error);
    } else {
      // Invalidate cache for this banner and the list
      cacheManager.invalidate(`banner:${id}`);
      cacheManager.invalidate(`banners:all:${user.id}`);
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
    } else {
      // Invalidate cache
      cacheManager.invalidate(`banner:${id}`);
      cacheManager.invalidate(`banners:all:${user.id}`);
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

    // Invalidate list cache
    cacheManager.invalidate(`banners:all:${user.id}`);

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

  // Batch save multiple properties at once (optimized for auto-save)
  async batchSave(
    id: string,
    updates: {
      elements?: CanvasElement[];
      canvasColor?: string;
      thumbnailDataURL?: string;
    }
  ): Promise<void> {
    // Only update if there are actual changes
    if (Object.keys(updates).length === 0) return;

    await this.update(id, updates);
  },

  // Update banner name
  async updateName(id: string, name: string): Promise<void> {
    await this.update(id, { name });
  },

  // Update plan type (admin only)
  async updatePlanType(id: string, planType: 'free' | 'premium'): Promise<void> {
    await this.update(id, { planType });
  },

  // Update public status
  async updateIsPublic(id: string, isPublic: boolean): Promise<void> {
    await this.update(id, { isPublic });
  },
};
