import type { Banner, CanvasElement, Template } from '../types/template';

const STORAGE_KEY = 'banalist_banners';

export const bannerStorage = {
  // Get all banners
  getAll(): Banner[] {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  // Get banner by ID
  getById(id: string): Banner | null {
    const banners = this.getAll();
    return banners.find((b) => b.id === id) || null;
  },

  // Create new banner
  create(name: string, template: Template): Banner {
    const banners = this.getAll();
    const newBanner: Banner = {
      id: `banner-${Date.now()}`,
      name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      template,
      elements: [
        {
          id: 'default-text',
          type: 'text',
          text: 'BANALISTでバナーをつくろう。',
          x: template.width / 2 - 550,
          y: template.height / 2 - 40,
          fontSize: 80,
          fontFamily: 'Arial',
          fill: '#000000',
          fontWeight: 400,
          strokeOnly: false,
        },
      ],
      canvasColor: '#FFFFFF',
    };
    banners.push(newBanner);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(banners));
    return newBanner;
  },

  // Update banner
  update(id: string, updates: Partial<Omit<Banner, 'id' | 'createdAt'>>): void {
    const banners = this.getAll();
    const index = banners.findIndex((b) => b.id === id);
    if (index !== -1) {
      banners[index] = {
        ...banners[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(banners));
    }
  },

  // Delete banner
  delete(id: string): void {
    const banners = this.getAll();
    const filtered = banners.filter((b) => b.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  },

  // Duplicate banner
  duplicate(id: string): Banner | null {
    const original = this.getById(id);
    if (!original) return null;

    const banners = this.getAll();
    const duplicated: Banner = {
      ...original,
      id: `banner-${Date.now()}`,
      name: `${original.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      elements: JSON.parse(JSON.stringify(original.elements)),
    };
    banners.push(duplicated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(banners));
    return duplicated;
  },

  // Save elements (for auto-save in editor)
  saveElements(id: string, elements: CanvasElement[]): void {
    this.update(id, { elements });
  },

  // Save canvas color
  saveCanvasColor(id: string, canvasColor: string): void {
    this.update(id, { canvasColor });
  },

  // Save thumbnail
  saveThumbnail(id: string, thumbnailDataURL: string): void {
    this.update(id, { thumbnailDataURL });
  },
};
