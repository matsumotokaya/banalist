export interface Template {
  id: string;
  name: string;
  width: number;
  height: number;
  backgroundColor: string;
  thumbnail?: string;
}

export interface TextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  fill: string;
}

export interface ImageElement {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export type CanvasElement = TextElement | ImageElement;
