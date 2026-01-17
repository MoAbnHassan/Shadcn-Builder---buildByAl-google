
export type ComponentType = 
  | 'nav' 
  | 'hero' 
  | 'feature-grid' 
  | 'cta' 
  | 'testimonial'
  | 'pricing'
  | 'faq'
  | 'logo-cloud'
  | 'team'
  | 'stats'
  | 'newsletter'
  | 'contact'
  | 'footer'
  | 'steps'
  | 'blog'
  | 'gallery'
  | 'timeline'
  | 'video'    // New
  | 'content'  // New
  | 'banner';  // New

export interface ComponentData {
  id: string;
  type: ComponentType;
  variant?: string; 
  props: Record<string, any>;
  customClasses: string;
}

export interface SidebarItem {
  type: ComponentType;
  label: string;
  icon: any;
}

export interface Template {
  id: string;
  label: string;
  description: string;
  items: { type: ComponentType; variant?: string; props?: Record<string, any> }[];
}

export type CanvasState = ComponentData[];

export interface LayoutConfig {
  maxWidth: string; 
  padding: string; 
  isCenteredVertical: boolean;
  background: string; 
  showBorder: boolean; 
  borderColor: string; 
  borderWidth: string; 
  borderStyle: string; 
}

export interface GlobalDesignConfig {
  theme: string; 
  radius: number; 
  mode: 'light' | 'dark';
  globalPaddingY: string; // Changed from globalPadding
  globalPaddingX: string; // New
  globalGap: string; 
  globalShadow: string; 
  font: string; 
}

export interface ComponentVariant {
    id: string;
    label: string;
}
