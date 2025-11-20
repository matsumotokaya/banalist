export interface Template {
  id: string;
  name: string;
  width: number;
  height: number;
  backgroundColor: string;
  thumbnail?: string;
}

export interface BaseElement {
  id: string;
  type: 'text' | 'shape' | 'image';
  x: number;
  y: number;
}

export interface TextElement extends BaseElement {
  type: 'text';
  text: string;
  fontSize: number;
  fontFamily: string;
  fill: string;
  fontWeight: number;
  strokeOnly: boolean;
}

export interface ShapeElement extends BaseElement {
  type: 'shape';
  width: number;
  height: number;
  fill: string;
  shapeType: 'rectangle' | 'triangle' | 'star';
}

export interface ImageElement extends BaseElement {
  type: 'image';
  src: string;
  width: number;
  height: number;
}

export type CanvasElement = TextElement | ShapeElement | ImageElement;

export interface Banner {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  template: Template;
  elements: CanvasElement[];
  canvasColor: string;
  thumbnailDataURL?: string;
}
