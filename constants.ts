import { 
  LayoutTemplate, 
  MousePointer2, 
  Type, 
  Grid3X3, 
  ArrowRight, 
  MessageSquare, 
  DollarSign, 
  HelpCircle, 
  Image, 
  Mail,
  Users,
  BarChart,
  Send,
  ListOrdered,
  Newspaper,
  GalleryVerticalEnd,
  History,
  PlaySquare,
  FileText,
  Megaphone
} from 'lucide-react';
import { SidebarItem, GlobalDesignConfig, Template, ComponentVariant } from './types';

export const SIDEBAR_ITEMS: SidebarItem[] = [
  { type: 'nav', label: 'Navigation', icon: LayoutTemplate },
  { type: 'hero', label: 'Hero Section', icon: Type },
  { type: 'feature-grid', label: 'Features', icon: Grid3X3 },
  { type: 'content', label: 'Content / Article', icon: FileText }, // New
  { type: 'video', label: 'Video Embed', icon: PlaySquare }, // New
  { type: 'steps', label: 'How it Works', icon: ListOrdered },
  { type: 'timeline', label: 'Timeline', icon: History }, 
  { type: 'gallery', label: 'Gallery', icon: GalleryVerticalEnd }, 
  { type: 'blog', label: 'Blog Grid', icon: Newspaper },
  { type: 'logo-cloud', label: 'Logo Cloud', icon: Image },
  { type: 'stats', label: 'Stats', icon: BarChart },
  { type: 'team', label: 'Team', icon: Users },
  { type: 'testimonial', label: 'Testimonials', icon: MessageSquare },
  { type: 'pricing', label: 'Pricing', icon: DollarSign },
  { type: 'faq', label: 'FAQ', icon: HelpCircle },
  { type: 'banner', label: 'Promo Banner', icon: Megaphone }, // New
  { type: 'cta', label: 'Call to Action', icon: MousePointer2 },
  { type: 'newsletter', label: 'Newsletter', icon: Send },
  { type: 'contact', label: 'Contact Form', icon: Mail },
  { type: 'footer', label: 'Footer', icon: ArrowRight },
];

// Available Design Variants
export const COMPONENT_VARIANTS: Record<string, ComponentVariant[]> = {
    hero: [
        { id: 'centered', label: 'Centered (Default)' },
        { id: 'split', label: 'Split Left/Right' },
        { id: 'glow', label: 'Glow Effect' }
    ],
    'feature-grid': [
        { id: 'grid', label: 'Simple Grid' },
        { id: 'cards', label: 'Cards with Border' },
        { id: 'list', label: 'List View' }
    ],
    stats: [
        { id: 'simple', label: 'Simple Text' },
        { id: 'cards', label: 'Boxed Cards' },
        { id: 'split', label: 'Split Background' }
    ],
    testimonial: [
        { id: 'grid', label: 'Grid Cards' },
        { id: 'minimal', label: 'Minimal (No Bg)' },
        { id: 'centered', label: 'Large Centered' }
    ],
    cta: [
        { id: 'centered', label: 'Centered Box' },
        { id: 'split', label: 'Split Text/Button' },
        { id: 'minimal', label: 'Minimal Link' }
    ],
    contact: [
        { id: 'centered', label: 'Centered Form' },
        { id: 'split', label: 'Split Info/Form' }
    ],
    team: [
        { id: 'grid', label: 'Grid Cards' },
        { id: 'list', label: 'Horizontal List' }
    ],
    video: [
        { id: 'browser', label: 'Browser Frame' },
        { id: 'plain', label: 'Rounded Plain' },
        { id: 'full', label: 'Full Width' }
    ],
    content: [
        { id: 'centered', label: 'Centered Prose' },
        { id: 'split-img', label: 'Text + Image' }
    ],
    banner: [
        { id: 'top', label: 'Slim Strip' },
        { id: 'box', label: 'Info Box' }
    ]
};

export const TEMPLATES: Template[] = [
    {
        id: 'template-saas',
        label: 'SaaS Landing',
        description: 'Complete landing page for SaaS products.',
        items: [
            { type: 'nav' },
            { type: 'hero', variant: 'glow' },
            { type: 'logo-cloud' },
            { type: 'feature-grid', variant: 'cards' },
            { type: 'stats', variant: 'simple' },
            { type: 'testimonial', variant: 'grid' },
            { type: 'pricing' },
            { type: 'cta', variant: 'centered' },
            { type: 'footer' }
        ]
    },
    {
        id: 'template-agency',
        label: 'Agency Portfolio',
        description: 'Showcase your team and work.',
        items: [
            { type: 'nav' },
            { type: 'hero', variant: 'split', props: { title: "We build digital experiences.", subtitle: "Award winning agency helping brands grow.", primaryBtn: "Our Work", secondaryBtn: "Contact Us" } },
            { type: 'gallery' },
            { type: 'team', variant: 'grid' },
            { type: 'steps', props: { title: "Our Process" } },
            { type: 'video', variant: 'plain', props: { title: "See how we work" } },
            { type: 'blog', props: { title: "Latest Insights" } },
            { type: 'contact', variant: 'split' },
            { type: 'footer' }
        ]
    },
    {
        id: 'template-app',
        label: 'Mobile App Launch',
        description: 'Clean layout for mobile app promotion.',
        items: [
            { type: 'nav' },
            { type: 'hero', variant: 'split', props: { title: "Manage your life on the go.", subtitle: "The ultimate productivity app for professionals.", primaryBtn: "Download App", secondaryBtn: "Learn More" } },
            { type: 'stats', variant: 'cards' },
            { type: 'feature-grid', variant: 'list' },
            { type: 'testimonial', variant: 'centered' },
            { type: 'cta', variant: 'minimal', props: { title: "Available on iOS and Android", buttonText: "Get it now" } },
            { type: 'footer' }
        ]
    },
    {
        id: 'template-course',
        label: 'Online Course',
        description: 'Sell your knowledge effectively.',
        items: [
            { type: 'banner', variant: 'top', props: { text: "Early bird discount ends in 24 hours!" } },
            { type: 'nav' },
            { type: 'video', variant: 'browser', props: { title: "Course Preview" } },
            { type: 'content', variant: 'centered', props: { title: "What you will learn", content: "This comprehensive course covers everything from basics to advanced techniques. Join thousands of students." } },
            { type: 'steps', props: { title: "Curriculum" } },
            { type: 'pricing', props: { title: "Enroll Now" } },
            { type: 'faq' },
            { type: 'footer' }
        ]
    }
];

const uuid = () => crypto.randomUUID();

export const DEFAULT_PROPS: Record<string, any> = {
  nav: {
    title: 'Brand',
    links: [
      { id: uuid(), text: 'Features', href: '#' },
      { id: uuid(), text: 'Pricing', href: '#' },
      { id: uuid(), text: 'About', href: '#' }
    ],
  },
  hero: {
    title: 'Build faster with components.',
    subtitle: 'Beautifully designed components that you can copy and paste into your apps.',
    primaryBtn: 'Get Started',
    secondaryBtn: 'GitHub',
  },
  'feature-grid': {
    title: 'Features',
    description: 'Everything you need to build your SaaS.',
    items: [
      { id: uuid(), title: 'Feature 1', description: 'Optimized for performance and built for scale.' },
      { id: uuid(), title: 'Feature 2', description: 'Handles your needs perfectly with modern architecture.' },
      { id: uuid(), title: 'Feature 3', description: 'Secure by default and easy to configure.' }
    ]
  },
  steps: {
      title: "How it works",
      description: "Simple steps to get started.",
      items: [
          { id: uuid(), title: "Sign Up", description: "Create your free account in seconds." },
          { id: uuid(), title: "Customize", description: "Choose your settings and preferences." },
          { id: uuid(), title: "Launch", description: "Publish your site to the world." }
      ]
  },
  timeline: {
      title: "Our Journey",
      description: "See how far we have come.",
      items: [
          { id: uuid(), year: "2024", title: "Global Expansion", description: "Opened offices in 3 new continents." },
          { id: uuid(), year: "2023", title: "Series B Funding", description: "Raised $50M to scale operations." },
          { id: uuid(), year: "2022", title: "Product Launch", description: "First version released to the public." }
      ]
  },
  gallery: {
      title: "Our Work",
      description: "A glimpse into our recent projects.",
      items: [
          { id: uuid(), alt: "Project 1" },
          { id: uuid(), alt: "Project 2" },
          { id: uuid(), alt: "Project 3" },
          { id: uuid(), alt: "Project 4" },
          { id: uuid(), alt: "Project 5" },
          { id: uuid(), alt: "Project 6" }
      ]
  },
  blog: {
      title: "From the blog",
      description: "Latest news and updates from our team.",
      items: [
          { id: uuid(), title: "The Future of Web Dev", date: "Mar 16, 2024", description: "Exploring new technologies and trends." },
          { id: uuid(), title: "Mastering React", date: "Mar 14, 2024", description: "Tips and tricks for better components." },
          { id: uuid(), title: "Design Systems 101", date: "Mar 12, 2024", description: "How to build consistent UIs." }
      ]
  },
  cta: {
    title: 'Ready to get started?',
    buttonText: 'Start Building',
  },
  footer: {
    text: '© 2024 Acme Inc. All rights reserved.',
  },
  testimonial: {
    title: "Loved by thousands",
    items: [
        { id: uuid(), quote: "This library has saved me countless hours.", author: "Sofia Davis", role: "CTO at TechCorp" },
        { id: uuid(), quote: "The code quality is top-notch.", author: "Alex Chen", role: "Lead Dev" },
        { id: uuid(), quote: "I can't imagine building without it.", author: "James Wilson", role: "Product Manager" }
    ]
  },
  pricing: {
    title: "Simple Pricing",
    description: "Choose the plan that's right for you",
    items: [
        { id: uuid(), name: "Starter", price: "0", popular: false, features: ["Project Management", "Basic Analytics", "Email Support"] },
        { id: uuid(), name: "Pro", price: "29", popular: true, features: ["Unlimited Projects", "Advanced Analytics", "24/7 Support"] },
        { id: uuid(), name: "Enterprise", price: "99", popular: false, features: ["Custom Solutions", "Dedicated Manager", "SLA"] }
    ]
  },
  faq: {
    title: "Frequently Asked Questions",
    items: [
        { id: uuid(), question: "Is it compatible with Next.js?", answer: "Yes, it is built specifically for the Next.js ecosystem." },
        { id: uuid(), question: "Can I use it for commercial projects?", answer: "Absolutely! It's fully open source." },
        { id: uuid(), question: "Do you offer support?", answer: "Community support is available via Discord." }
    ]
  },
  'logo-cloud': {
    title: "Trusted by industry leaders",
    items: [
      { id: uuid(), name: "Company 1" },
      { id: uuid(), name: "Company 2" },
      { id: uuid(), name: "Company 3" },
      { id: uuid(), name: "Company 4" },
      { id: uuid(), name: "Company 5" },
    ]
  },
  contact: {
    title: "Get in touch",
    description: "We'd love to hear from you."
  },
  team: {
    title: "Meet our team",
    description: "The best team in the world.",
    items: [
        { id: uuid(), name: "Alice Johnson", role: "CEO" },
        { id: uuid(), name: "Bob Smith", role: "CTO" },
        { id: uuid(), name: "Carol Williams", role: "Designer" }
    ]
  },
  stats: {
    items: [
        { id: uuid(), label: "Downloads", value: "10K+" },
        { id: uuid(), label: "Users", value: "50K+" },
        { id: uuid(), label: "Countries", value: "20+" }
    ]
  },
  newsletter: {
    title: "Subscribe to our newsletter",
    description: "Get the latest news and updates.",
    buttonText: "Subscribe"
  },
  video: {
      title: "Watch Demo",
      description: "See how it works in action."
  },
  content: {
      title: "About the Project",
      content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
  },
  banner: {
      text: "Big news! We are launching our new version soon.",
      linkText: "Learn more"
  }
};

export const DEFAULT_GLOBAL_DESIGN: GlobalDesignConfig = {
    theme: 'zinc',
    radius: 0.5,
    mode: 'dark',
    globalPaddingY: 'py-12 md:py-24', // Default Vertical
    globalPaddingX: 'px-4 md:px-6',   // Default Horizontal
    globalGap: 'gap-0',
    globalShadow: 'shadow-none',
    font: 'font-sans'
};

interface ThemeColors {
    label: string;
    activeColor: string;
    css: {
        light: string;
        dark: string;
    };
}

export const COLOR_THEMES: Record<string, ThemeColors> = {
    zinc: {
        label: 'Zinc',
        activeColor: 'bg-zinc-900',
        css: {
            light: `
                --background: 0 0% 100%;
                --foreground: 240 10% 3.9%;
                --card: 0 0% 100%;
                --card-foreground: 240 10% 3.9%;
                --popover: 0 0% 100%;
                --popover-foreground: 240 10% 3.9%;
                --primary: 240 5.9% 10%;
                --primary-foreground: 0 0% 98%;
                --secondary: 240 4.8% 95.9%;
                --secondary-foreground: 240 5.9% 10%;
                --muted: 240 4.8% 95.9%;
                --muted-foreground: 240 3.8% 46.1%;
                --accent: 240 4.8% 95.9%;
                --accent-foreground: 240 5.9% 10%;
                --destructive: 0 84.2% 60.2%;
                --destructive-foreground: 0 0% 98%;
                --border: 240 5.9% 90%;
                --input: 240 5.9% 90%;
                --ring: 240 10% 3.9%;
            `,
            dark: `
                --background: 240 10% 3.9%;
                --foreground: 0 0% 98%;
                --card: 240 10% 3.9%;
                --card-foreground: 0 0% 98%;
                --popover: 240 10% 3.9%;
                --popover-foreground: 0 0% 98%;
                --primary: 0 0% 98%;
                --primary-foreground: 240 5.9% 10%;
                --secondary: 240 3.7% 15.9%;
                --secondary-foreground: 0 0% 98%;
                --muted: 240 3.7% 15.9%;
                --muted-foreground: 240 5% 64.9%;
                --accent: 240 3.7% 15.9%;
                --accent-foreground: 0 0% 98%;
                --destructive: 0 62.8% 30.6%;
                --destructive-foreground: 0 0% 98%;
                --border: 240 3.7% 15.9%;
                --input: 240 3.7% 15.9%;
                --ring: 240 4.9% 83.9%;
            `
        }
    },
    blue: {
        label: 'Blue',
        activeColor: 'bg-blue-600',
        css: {
            light: `
                --background: 0 0% 100%;
                --foreground: 222.2 84% 4.9%;
                --card: 0 0% 100%;
                --card-foreground: 222.2 84% 4.9%;
                --popover: 0 0% 100%;
                --popover-foreground: 222.2 84% 4.9%;
                --primary: 221.2 83.2% 53.3%;
                --primary-foreground: 210 40% 98%;
                --secondary: 210 40% 96.1%;
                --secondary-foreground: 222.2 47.4% 11.2%;
                --muted: 210 40% 96.1%;
                --muted-foreground: 215.4 16.3% 46.9%;
                --accent: 210 40% 96.1%;
                --accent-foreground: 222.2 47.4% 11.2%;
                --destructive: 0 84.2% 60.2%;
                --destructive-foreground: 210 40% 98%;
                --border: 214.3 31.8% 91.4%;
                --input: 214.3 31.8% 91.4%;
                --ring: 221.2 83.2% 53.3%;
            `,
            dark: `
                --background: 222.2 84% 4.9%;
                --foreground: 210 40% 98%;
                --card: 222.2 84% 4.9%;
                --card-foreground: 210 40% 98%;
                --popover: 222.2 84% 4.9%;
                --popover-foreground: 210 40% 98%;
                --primary: 217.2 91.2% 59.8%;
                --primary-foreground: 222.2 47.4% 11.2%;
                --secondary: 217.2 32.6% 17.5%;
                --secondary-foreground: 210 40% 98%;
                --muted: 217.2 32.6% 17.5%;
                --muted-foreground: 215 20.2% 65.1%;
                --accent: 217.2 32.6% 17.5%;
                --accent-foreground: 210 40% 98%;
                --destructive: 0 62.8% 30.6%;
                --destructive-foreground: 210 40% 98%;
                --border: 217.2 32.6% 17.5%;
                --input: 217.2 32.6% 17.5%;
                --ring: 212.7 26.8% 83.9%;
            `
        }
    },
    rose: {
        label: 'Rose',
        activeColor: 'bg-rose-600',
        css: {
            light: `
                --background: 0 0% 100%;
                --foreground: 240 10% 3.9%;
                --card: 0 0% 100%;
                --card-foreground: 240 10% 3.9%;
                --popover: 0 0% 100%;
                --popover-foreground: 240 10% 3.9%;
                --primary: 346.8 77.2% 49.8%;
                --primary-foreground: 355.7 100% 97.3%;
                --secondary: 240 4.8% 95.9%;
                --secondary-foreground: 240 5.9% 10%;
                --muted: 240 4.8% 95.9%;
                --muted-foreground: 240 3.8% 46.1%;
                --accent: 240 4.8% 95.9%;
                --accent-foreground: 240 5.9% 10%;
                --destructive: 0 84.2% 60.2%;
                --destructive-foreground: 0 0% 98%;
                --border: 240 5.9% 90%;
                --input: 240 5.9% 90%;
                --ring: 346.8 77.2% 49.8%;
            `,
            dark: `
                --background: 240 10% 3.9%;
                --foreground: 0 0% 98%;
                --card: 240 10% 3.9%;
                --card-foreground: 0 0% 98%;
                --popover: 240 10% 3.9%;
                --popover-foreground: 0 0% 98%;
                --primary: 346.8 77.2% 49.8%;
                --primary-foreground: 355.7 100% 97.3%;
                --secondary: 240 3.7% 15.9%;
                --secondary-foreground: 0 0% 98%;
                --muted: 240 3.7% 15.9%;
                --muted-foreground: 240 5% 64.9%;
                --accent: 240 3.7% 15.9%;
                --accent-foreground: 0 0% 98%;
                --destructive: 0 62.8% 30.6%;
                --destructive-foreground: 0 0% 98%;
                --border: 240 3.7% 15.9%;
                --input: 240 3.7% 15.9%;
                --ring: 346.8 77.2% 49.8%;
            `
        }
    },
    green: {
        label: 'Green',
        activeColor: 'bg-green-600',
        css: {
            light: `
                --background: 0 0% 100%;
                --foreground: 240 10% 3.9%;
                --card: 0 0% 100%;
                --card-foreground: 240 10% 3.9%;
                --popover: 0 0% 100%;
                --popover-foreground: 240 10% 3.9%;
                --primary: 142.1 76.2% 36.3%;
                --primary-foreground: 355.7 100% 97.3%;
                --secondary: 240 4.8% 95.9%;
                --secondary-foreground: 240 5.9% 10%;
                --muted: 240 4.8% 95.9%;
                --muted-foreground: 240 3.8% 46.1%;
                --accent: 240 4.8% 95.9%;
                --accent-foreground: 240 5.9% 10%;
                --destructive: 0 84.2% 60.2%;
                --destructive-foreground: 0 0% 98%;
                --border: 240 5.9% 90%;
                --input: 240 5.9% 90%;
                --ring: 142.1 76.2% 36.3%;
            `,
            dark: `
                --background: 240 10% 3.9%;
                --foreground: 0 0% 98%;
                --card: 240 10% 3.9%;
                --card-foreground: 0 0% 98%;
                --popover: 240 10% 3.9%;
                --popover-foreground: 0 0% 98%;
                --primary: 142.1 70.6% 45.3%;
                --primary-foreground: 144.9 80.4% 10%;
                --secondary: 240 3.7% 15.9%;
                --secondary-foreground: 0 0% 98%;
                --muted: 240 3.7% 15.9%;
                --muted-foreground: 240 5% 64.9%;
                --accent: 240 3.7% 15.9%;
                --accent-foreground: 0 0% 98%;
                --destructive: 0 62.8% 30.6%;
                --destructive-foreground: 0 0% 98%;
                --border: 240 3.7% 15.9%;
                --input: 240 3.7% 15.9%;
                --ring: 142.4 71.8% 29.2%;
            `
        }
    },
    orange: {
        label: 'Orange',
        activeColor: 'bg-orange-500',
        css: {
            light: `
                --background: 0 0% 100%;
                --foreground: 240 10% 3.9%;
                --card: 0 0% 100%;
                --card-foreground: 240 10% 3.9%;
                --popover: 0 0% 100%;
                --popover-foreground: 240 10% 3.9%;
                --primary: 24.6 95% 53.1%;
                --primary-foreground: 60 9.1% 97.8%;
                --secondary: 240 4.8% 95.9%;
                --secondary-foreground: 240 5.9% 10%;
                --muted: 240 4.8% 95.9%;
                --muted-foreground: 240 3.8% 46.1%;
                --accent: 240 4.8% 95.9%;
                --accent-foreground: 240 5.9% 10%;
                --destructive: 0 84.2% 60.2%;
                --destructive-foreground: 0 0% 98%;
                --border: 240 5.9% 90%;
                --input: 240 5.9% 90%;
                --ring: 24.6 95% 53.1%;
            `,
            dark: `
                --background: 240 10% 3.9%;
                --foreground: 0 0% 98%;
                --card: 240 10% 3.9%;
                --card-foreground: 0 0% 98%;
                --popover: 240 10% 3.9%;
                --popover-foreground: 0 0% 98%;
                --primary: 20.5 90.2% 48.2%;
                --primary-foreground: 60 9.1% 97.8%;
                --secondary: 240 3.7% 15.9%;
                --secondary-foreground: 0 0% 98%;
                --muted: 240 3.7% 15.9%;
                --muted-foreground: 240 5% 64.9%;
                --accent: 240 3.7% 15.9%;
                --accent-foreground: 0 0% 98%;
                --destructive: 0 62.8% 30.6%;
                --destructive-foreground: 0 0% 98%;
                --border: 240 3.7% 15.9%;
                --input: 240 3.7% 15.9%;
                --ring: 20.5 90.2% 48.2%;
            `
        }
    }
};

export const DARK_THEME_OVERRIDES = ``; // Deprecated, kept for interface compatibility if needed, but logic moved to objects above.