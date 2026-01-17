import React, { useState, useEffect, useRef } from 'react';
import { 
  DndContext, 
  DragOverlay, 
  DragStartEvent, 
  DragEndEvent, 
  useDraggable, 
  useDroppable,
  useSensor,
  useSensors,
  PointerSensor,
  closestCorners
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SIDEBAR_ITEMS, DEFAULT_PROPS, COLOR_THEMES, DEFAULT_GLOBAL_DESIGN, TEMPLATES, COMPONENT_VARIANTS } from './constants';
import { ComponentData, ComponentType, LayoutConfig, GlobalDesignConfig, Template } from './types';
import { ComponentPreview } from './components/PreviewComponents';
import { generateCode } from './lib/codeGenerator';
import { Download, Code, Trash2, Plus, MousePointer2, AlignLeft, AlignCenter, AlignRight, Palette, Layout, Smartphone, Monitor, Settings, Maximize, ArrowUpDown, MoveVertical, BoxSelect, Columns, Square, Circle, Minus, GripVertical, ChevronRight, ChevronDown, RefreshCcw, Moon, Sun, Type, LayoutTemplate, Layers, Trash, XCircle, Paintbrush, ArrowLeftRight } from 'lucide-react';
import { cn } from './utils/cn';

// Define Props interface before usage
interface StructureEditorProps {
    items: any[];
    onReorder: (oldIdx: number, newIdx: number) => void;
    onChange: (id: string, field: string, value: any) => void;
    onRemove: (id: string) => void;
    onAdd: () => void;
}

function App() {
  const [components, setComponents] = useState<ComponentData[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // activeDragType now can be ComponentType or a Template ID string
  const [activeDragType, setActiveDragType] = useState<string | null>(null); 
  const [activeSortId, setActiveSortId] = useState<string | null>(null);
  const [showCode, setShowCode] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  
  // Ref for the preview container to scope CSS variables
  const previewRef = useRef<HTMLDivElement>(null);

  // Root Layout Configuration
  const [layoutConfig, setLayoutConfig] = useState<LayoutConfig>({
    maxWidth: 'max-w-7xl',
    padding: 'p-4',
    isCenteredVertical: false,
    background: 'bg-background',
    showBorder: false,
    borderColor: 'border-zinc-500',
    borderWidth: 'border-2',
    borderStyle: 'border-dashed'
  });

  // Global Design Configuration
  const [globalSettings, setGlobalSettings] = useState<GlobalDesignConfig>(DEFAULT_GLOBAL_DESIGN);

  // --- Effects ---

  // Apply CSS Variables for Theme & Radius SCOPED to the preview container
  useEffect(() => {
    const previewContainer = previewRef.current;
    if (!previewContainer) return;

    const theme = COLOR_THEMES[globalSettings.theme] || COLOR_THEMES.zinc;
    
    // 1. Get Colors based on mode
    const cssVariables = globalSettings.mode === 'dark' ? theme.css.dark : theme.css.light;

    // 2. Set variables strictly on the preview container style
    const rules = cssVariables.split(';').filter(r => r.trim() !== '');
    rules.forEach(rule => {
        const [key, value] = rule.split(':');
        if (key && value) previewContainer.style.setProperty(key.trim(), value.trim());
    });

    // 3. Set Radius
    previewContainer.style.setProperty('--radius', `${globalSettings.radius}rem`);

    // 4. Handle Dark Mode Class manually for the preview wrapper
    // We do not touch document.documentElement to keep the editor UI constant
    if (globalSettings.mode === 'dark') {
       previewContainer.classList.add('dark');
    } else {
       previewContainer.classList.remove('dark');
    }

  }, [globalSettings.theme, globalSettings.radius, globalSettings.mode]);


  // --- Sensors for better Drag Control ---
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px movement required to start drag
      },
    })
  );

  // --- Actions ---

  const addComponent = (type: ComponentType) => {
    const defaultClasses = ''; 
    const newComponent: ComponentData = {
      id: crypto.randomUUID(),
      type,
      props: JSON.parse(JSON.stringify(DEFAULT_PROPS[type])), 
      customClasses: defaultClasses,
      // Use the first variant available if it exists, otherwise undefined
      variant: COMPONENT_VARIANTS[type]?.[0]?.id 
    };
    setComponents((prev) => [...prev, newComponent]);
    setSelectedId(newComponent.id);
  };

  const addTemplate = (templateId: string) => {
      const template = TEMPLATES.find(t => t.id === templateId);
      if(!template) return;

      const newComponents = template.items.map(item => ({
          id: crypto.randomUUID(),
          type: item.type,
          variant: item.variant || COMPONENT_VARIANTS[item.type]?.[0]?.id,
          props: item.props ? JSON.parse(JSON.stringify(item.props)) : JSON.parse(JSON.stringify(DEFAULT_PROPS[item.type])),
          customClasses: ''
      }));

      setComponents(prev => [...prev, ...newComponents]);
      // Select the first item of the template
      if(newComponents.length > 0) setSelectedId(newComponents[0].id);
  }

  const removeComponent = (id: string) => {
    setComponents((prev) => prev.filter((c) => c.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const clearAllComponents = () => {
      if (components.length > 0) {
          if(window.confirm("Are you sure you want to delete all sections and start over?")) {
            setComponents([]);
            setSelectedId(null);
          }
      }
  };

  const updateComponent = (id: string, field: string, value: any) => {
    setComponents((prev) =>
      prev.map((c) => (c.id === id ? { ...c, props: { ...c.props, [field]: value } } : c))
    );
  };
  
  const updateComponentVariant = (id: string, variant: string) => {
      setComponents((prev) => 
        prev.map((c) => (c.id === id ? { ...c, variant } : c))
      );
  }

  // --- Internal Item Management (Structure Control) ---
  
  const addInternalItem = (componentId: string) => {
    setComponents((prev) => prev.map(c => {
        if(c.id !== componentId || !c.props.items) return c;
        const newItem = { ...c.props.items[0], id: crypto.randomUUID() };
        Object.keys(newItem).forEach(k => {
            if(k === 'title') newItem[k] = 'New Item';
            if(k === 'description') newItem[k] = 'New Description';
            if(k === 'question') newItem[k] = 'New Question?';
            if(k === 'answer') newItem[k] = 'New Answer';
            if(k === 'name') newItem[k] = 'New Name';
            if(k === 'text') newItem[k] = 'New Link';
            if(k === 'year') newItem[k] = '2025';
            if(k === 'alt') newItem[k] = 'Project';
        });
        return { ...c, props: { ...c.props, items: [...c.props.items, newItem] } };
    }));
  };

  const removeInternalItem = (componentId: string, itemId: string) => {
     setComponents((prev) => prev.map(c => {
        if(c.id !== componentId || !c.props.items) return c;
        return { ...c, props: { ...c.props, items: c.props.items.filter((i: any) => i.id !== itemId) } };
     }));
  };

  const updateInternalItem = (componentId: string, itemId: string, field: string, value: any) => {
      setComponents((prev) => prev.map(c => {
          if(c.id !== componentId || !c.props.items) return c;
          return { ...c, props: { ...c.props, items: c.props.items.map((i: any) => i.id === itemId ? { ...i, [field]: value } : i) } };
      }));
  };

  const reorderInternalItems = (componentId: string, oldIndex: number, newIndex: number) => {
      setComponents((prev) => prev.map(c => {
          if (c.id !== componentId || !c.props.items) return c;
          return { ...c, props: { ...c.props, items: arrayMove(c.props.items, oldIndex, newIndex) } };
      }));
  };

  const updateClasses = (id: string, value: string) => {
    setComponents((prev) =>
      prev.map((c) => (c.id === id ? { ...c, customClasses: value } : c))
    );
  };

  type StyleCategory = 'paddingY' | 'paddingX' | 'marginY' | 'gap' | 'align' | 'bg' | 'borderWidth' | 'borderColor' | 'borderRadius' | 'borderStyle';

  const handleStyleChange = (componentId: string, category: StyleCategory, value: string) => {
    const comp = components.find(c => c.id === componentId);
    if (!comp) return;

    let removePattern: RegExp;
    switch (category) {
        case 'paddingY': removePattern = /^(?:(?:\w+:)+)?(py-|pt-|pb-)/; break;
        case 'paddingX': removePattern = /^(?:(?:\w+:)+)?(px-|pl-|pr-)/; break;
        case 'marginY': removePattern = /^(?:(?:\w+:)+)?(my-|mt-|mb-)/; break;
        case 'gap': removePattern = /^(?:(?:\w+:)+)?gap-/; break;
        case 'align': removePattern = /^(?:(?:\w+:)+)?text-(left|center|right)/; break;
        case 'bg':
            removePattern = /^(?:(?:\w+:)+)?bg-(background|muted|secondary|primary|accent|card|white|black|slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)(\/.*)?$/;
            if (value.includes('gradient')) removePattern = /bg-/; 
            break;
        case 'borderWidth': removePattern = /^(?:(?:\w+:)+)?border(?:-(?:0|2|4|8))?$/; break;
        case 'borderColor': removePattern = /^(?:(?:\w+:)+)?border-(?!0|2|4|8|solid|dashed|dotted|double|none|x-|y-|t-|b-|l-|r-).+$/; break;
        case 'borderStyle': removePattern = /^(?:(?:\w+:)+)?border-(?:solid|dashed|dotted|double|none)$/; break;
        case 'borderRadius': removePattern = /^(?:(?:\w+:)+)?rounded(?:-.+)?$/; break;
        default: removePattern = /$^/; 
    }

    const currentClasses = comp.customClasses.split(' ').filter(c => c.trim() !== '');
    const keptClasses = currentClasses.filter(c => {
         if (category === 'bg' && value.includes('gradient') && c.startsWith('bg-')) return false;
         return !removePattern.test(c);
    });
    const newClasses = value.split(' ').filter(c => c.trim() !== '');
    updateClasses(componentId, [...keptClasses, ...newClasses].join(' '));
  };

  const isStyleActive = (componentId: string, valueToCheck: string) => {
      const comp = components.find(c => c.id === componentId);
      if(!comp) return false;
      const currentClasses = comp.customClasses.split(' ');
      const targetClasses = valueToCheck.split(' ').filter(c => c.trim() !== '');
      if (targetClasses.length === 0) return false;
      return targetClasses.every(tc => currentClasses.includes(tc));
  }
  
  const getDisplayValue = (id: string, prefixes: string[]) => {
      const comp = components.find(c => c.id === id);
      if(!comp) return null;
      const classes = comp.customClasses.split(' ');
      return classes.find(c => prefixes.some(p => c.startsWith(p))) || null;
  }

  // --- Drag & Drop Handlers ---

  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type) {
      setActiveDragType(event.active.data.current.type);
    } else {
      setActiveSortId(event.active.id as string);
      setSelectedId(event.active.id as string);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { over, active } = event;
    
    // Handle Drop from Sidebar
    if (activeDragType) {
       // Check if dropping on canvas OR sorting area
       if (over && (over.id === 'canvas-droppable' || components.some(c => c.id === over.id))) {
         if (activeDragType.startsWith('template-')) {
             addTemplate(activeDragType);
         } else {
             // It's a standard component
             addComponent(activeDragType as ComponentType);
         }
       }
       setActiveDragType(null);
       return;
    }

    // Handle Sort Reordering
    if (activeSortId && over && active.id !== over.id) {
       setComponents((items) => {
         const oldIndex = items.findIndex((i) => i.id === active.id);
         const newIndex = items.findIndex((i) => i.id === over.id);
         return arrayMove(items, oldIndex, newIndex);
       });
    }
    setActiveSortId(null);
  };

  const selectedComponent = components.find((c) => c.id === selectedId);
  const generatedSource = generateCode(components, layoutConfig, globalSettings);

  return (
    <DndContext 
      sensors={sensors} 
      collisionDetection={closestCorners} 
      onDragStart={handleDragStart} 
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-screen w-full bg-[#09090b] text-foreground overflow-hidden font-sans">
        
        {/* Left Sidebar */}
        <aside className="w-72 border-r border-zinc-800 bg-zinc-950 flex flex-col shrink-0 z-20 hidden md:flex text-zinc-100">
          <div className="p-4 border-b border-zinc-800 flex items-center gap-2">
            <div className="w-5 h-5 bg-white rounded-sm" />
            <h1 className="font-bold tracking-tight text-sm">Shadcn Builder</h1>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-8">
            {/* Components Section */}
            <div>
                 <div className="text-xs font-semibold text-zinc-500 mb-3 uppercase tracking-wider flex items-center gap-2">
                    <BoxSelect className="w-3.5 h-3.5" />
                    Components
                 </div>
                 <div className="grid gap-2">
                    {SIDEBAR_ITEMS.map((item) => (
                        <DraggableSidebarItem key={item.type} item={item} />
                    ))}
                 </div>
            </div>

            {/* Templates Section */}
            <div>
                 <div className="text-xs font-semibold text-zinc-500 mb-3 uppercase tracking-wider flex items-center gap-2">
                    <LayoutTemplate className="w-3.5 h-3.5" />
                    Templates
                 </div>
                 <div className="grid gap-3">
                    {TEMPLATES.map((template) => (
                        <DraggableTemplateItem key={template.id} template={template} />
                    ))}
                 </div>
            </div>
          </div>
        </aside>

        {/* Center: Canvas */}
        <main className="flex-1 flex flex-col relative min-w-0 bg-[#0c0c0e]">
          {/* Header */}
          <header className="h-14 border-b border-zinc-800 bg-zinc-950/50 backdrop-blur flex items-center justify-between px-4 z-10 shrink-0">
             <div className="flex items-center gap-4">
                 <div className="flex gap-2 bg-zinc-900 p-1 rounded-md border border-zinc-800">
                    <button 
                      onClick={() => setIsMobileView(false)}
                      className={cn("p-1.5 rounded-sm transition-colors", !isMobileView ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300")}
                      title="Desktop View"
                    >
                        <Monitor className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setIsMobileView(true)}
                       className={cn("p-1.5 rounded-sm transition-colors", isMobileView ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300")}
                       title="Mobile View"
                    >
                        <Smartphone className="w-4 h-4" />
                    </button>
                 </div>
                 
                 <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 bg-zinc-900/50 px-2 py-1 rounded border border-zinc-800/50">
                    <Layers className="w-3 h-3" />
                    <span>{components.length} Sections</span>
                 </div>

                 {components.length > 0 && (
                     <button 
                        onClick={clearAllComponents}
                        className="text-xs flex items-center gap-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/30 px-2 py-1 rounded transition-colors"
                     >
                         <Trash className="w-3 h-3" />
                         Clear
                     </button>
                 )}
             </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowCode(!showCode)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-md hover:bg-zinc-800 transition-colors"
              >
                <Code className="w-3.5 h-3.5" />
                {showCode ? 'Hide Code' : 'View Code'}
              </button>
              <button
                onClick={() => {
                    const blob = new Blob([generatedSource], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'LandingPage.tsx';
                    a.click();
                }}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-white text-black rounded-md hover:bg-zinc-200 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Export
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-hidden relative">
            {/* Code Overlay */}
            {showCode && (
              <div className="absolute inset-0 bg-zinc-950/95 z-50 p-8 overflow-auto animate-in fade-in slide-in-from-bottom-4 duration-200">
                <div className="max-w-4xl mx-auto">
                    <pre className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 font-mono text-xs text-zinc-400 overflow-auto">
                        {generatedSource}
                    </pre>
                </div>
              </div>
            )}

            {/* Render Canvas Wrapper - This handles the scroll */}
            <div 
              className="absolute inset-0 overflow-y-auto p-8 custom-scrollbar flex flex-col items-center bg-[#0c0c0e]"
              onClick={() => setSelectedId(null)}
            >
              <CanvasDroppable>
                <div 
                    ref={previewRef}
                    className={cn(
                        "transition-all duration-500 ease-in-out relative flex flex-col text-foreground font-sans",
                        // Base styles for the preview container to ensure variables pick up
                        "min-h-[800px] shadow-2xl",
                        isMobileView ? "w-[375px] rounded-3xl border-[8px] border-zinc-800" : "w-full max-w-full rounded-xl",
                        // Apply background color from layout config
                        layoutConfig.background, 
                        // Note: Padding applies to the outer shell (Page Padding)
                        layoutConfig.padding,
                        layoutConfig.isCenteredVertical && "justify-center"
                    )}
                >
                  {/* Content Container - Border applies HERE per request */}
                  <div className={cn(
                      "flex flex-col w-full mx-auto transition-all duration-300", 
                      layoutConfig.maxWidth,
                      // Apply Global Gap (Margin between sections) here
                      globalSettings.globalGap,
                      // Apply Border Controls Here
                      layoutConfig.showBorder ? `${layoutConfig.borderWidth} ${layoutConfig.borderStyle} ${layoutConfig.borderColor}` : ""
                  )}>
                      {components.length === 0 ? (
                        <div className="h-64 flex flex-col items-center justify-center text-muted-foreground pointer-events-none border-2 border-dashed border-muted rounded-lg m-4">
                          <Plus className="w-12 h-12 mb-4 opacity-20" />
                          <p className="text-sm font-medium">Drag components here</p>
                        </div>
                      ) : (
                        <SortableContext 
                            items={components.map(c => c.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            {components.map((comp) => (
                              <SortableComponent 
                                key={comp.id} 
                                data={comp} 
                                isSelected={selectedId === comp.id}
                                onSelect={() => setSelectedId(comp.id)}
                                onRemove={() => removeComponent(comp.id)}
                                globalSettings={globalSettings}
                              />
                            ))}
                        </SortableContext>
                      )}
                  </div>
                </div>
              </CanvasDroppable>
              <div className="h-32 shrink-0" />
            </div>
          </div>
        </main>

        {/* Right Sidebar: Properties */}
        <aside className="w-80 border-l border-zinc-800 bg-zinc-950 flex flex-col shrink-0 z-20 custom-scrollbar overflow-hidden text-zinc-100">
          <div className="h-14 border-b border-zinc-800 flex items-center px-4 justify-between shrink-0">
            <h2 className="font-semibold tracking-tight text-sm">
                {selectedComponent ? 'Component Settings' : 'Global Design'}
            </h2>
            <div className="flex gap-2">
                {!selectedComponent && (
                    <button 
                        onClick={() => setGlobalSettings(DEFAULT_GLOBAL_DESIGN)} 
                        className="text-zinc-500 hover:text-white"
                        title="Reset Global Settings"
                    >
                        <RefreshCcw className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {selectedComponent ? (
              // Component Settings Logic (Using existing StructureEditor logic)
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-200">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-zinc-500 uppercase">ID</span>
                    <span className="text-xs font-mono text-zinc-300 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">{selectedComponent.id.slice(0, 8)}</span>
                </div>

                {/* Variant Selector */}
                {COMPONENT_VARIANTS[selectedComponent.type] && (
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-zinc-100 flex items-center gap-2">
                            <Paintbrush className="w-3.5 h-3.5" />
                            Design Style
                        </label>
                        <select 
                            value={selectedComponent.variant || COMPONENT_VARIANTS[selectedComponent.type][0].id}
                            onChange={(e) => updateComponentVariant(selectedComponent.id, e.target.value)}
                            className="w-full h-9 rounded-md border border-zinc-800 bg-zinc-900 px-3 text-xs text-zinc-200 shadow-sm focus:outline-none focus:ring-1 focus:ring-zinc-700"
                        >
                            {COMPONENT_VARIANTS[selectedComponent.type].map((v) => (
                                <option key={v.id} value={v.id}>{v.label}</option>
                            ))}
                        </select>
                    </div>
                )}

                 {/* Structure Control */}
                 {selectedComponent.props.items && (
                     <div className="space-y-4">
                         <div className="text-xs font-semibold text-zinc-100 pb-2 border-b border-zinc-800 flex items-center gap-2 justify-between">
                             <div className="flex items-center gap-2">
                                 <Columns className="w-3.5 h-3.5" />
                                 Structure
                             </div>
                             <span className="text-[10px] text-zinc-500 bg-zinc-900 px-1.5 rounded">{selectedComponent.props.items.length} Items</span>
                         </div>
                         <StructureEditor 
                             items={selectedComponent.props.items}
                             onReorder={(oldIdx, newIdx) => reorderInternalItems(selectedComponent.id, oldIdx, newIdx)}
                             onChange={(id, field, val) => updateInternalItem(selectedComponent.id, id, field, val)}
                             onRemove={(id) => removeInternalItem(selectedComponent.id, id)}
                             onAdd={() => addInternalItem(selectedComponent.id)}
                         />
                     </div>
                 )}
                 {selectedComponent.props.links && (
                     <div className="space-y-4">
                         <div className="text-xs font-semibold text-zinc-100 pb-2 border-b border-zinc-800 flex items-center gap-2 justify-between">
                             <div className="flex items-center gap-2">
                                 <Columns className="w-3.5 h-3.5" />
                                 Navigation Links
                             </div>
                         </div>
                         <StructureEditor 
                             items={selectedComponent.props.links}
                             onReorder={(oldIdx, newIdx) => reorderInternalItems(selectedComponent.id, oldIdx, newIdx)}
                             onChange={(id, field, val) => updateInternalItem(selectedComponent.id, id, field, val)}
                             onRemove={(id) => removeInternalItem(selectedComponent.id, id)}
                             onAdd={() => addInternalItem(selectedComponent.id)}
                         />
                     </div>
                 )}

                {/* Spacing Section */}
                <div className="space-y-4">
                   <div className="text-xs font-semibold text-zinc-100 pb-2 border-b border-zinc-800 flex items-center gap-2">
                    <BoxSelect className="w-3.5 h-3.5" />
                    Spacing (Override)
                  </div>
                   {/* Vertical Padding (Y) */}
                  <div className="space-y-2">
                    <label className="text-xs text-zinc-500 flex justify-between">
                        <span>Padding Y</span>
                        <span className="font-mono text-[10px] opacity-70 text-zinc-400">{getDisplayValue(selectedComponent.id, ['py-', 'pt-', 'pb-']) || 'Global'}</span>
                    </label>
                    <div className="grid grid-cols-5 gap-1">
                        {['py-0', 'py-4', 'py-8', 'py-12 md:py-24', 'py-20 md:py-32'].map((val, i) => {
                             const isActive = isStyleActive(selectedComponent.id, val);
                             return (
                                <button
                                    key={val}
                                    onClick={() => handleStyleChange(selectedComponent.id, 'paddingY', val)}
                                    className={cn(
                                        "h-8 rounded-sm border text-[10px] transition-all",
                                        isActive ? "bg-white text-black border-white" : "text-zinc-500 bg-zinc-900 border-zinc-800 hover:border-zinc-600"
                                    )}
                                >
                                    {['0', 'XS', 'S', 'M', 'L'][i]}
                                </button>
                             )
                        })}
                    </div>
                  </div>
                  {/* Horizontal Padding (X) */}
                  <div className="space-y-2">
                    <label className="text-xs text-zinc-500 flex justify-between">
                        <span>Padding X</span>
                        <span className="font-mono text-[10px] opacity-70 text-zinc-400">{getDisplayValue(selectedComponent.id, ['px-', 'pl-', 'pr-']) || 'Global'}</span>
                    </label>
                    <div className="grid grid-cols-5 gap-1">
                        {['px-0', 'px-4', 'px-6', 'px-8 md:px-12', 'px-12 md:px-24'].map((val, i) => {
                             const isActive = isStyleActive(selectedComponent.id, val);
                             return (
                                <button
                                    key={val}
                                    onClick={() => handleStyleChange(selectedComponent.id, 'paddingX', val)}
                                    className={cn(
                                        "h-8 rounded-sm border text-[10px] transition-all",
                                        isActive ? "bg-white text-black border-white" : "text-zinc-500 bg-zinc-900 border-zinc-800 hover:border-zinc-600"
                                    )}
                                >
                                    {['0', 'XS', 'S', 'M', 'L'][i]}
                                </button>
                             )
                        })}
                    </div>
                  </div>
                </div>

                {/* Borders & Effects Section */}
                <div className="space-y-4">
                  <div className="text-xs font-semibold text-zinc-100 pb-2 border-b border-zinc-800 flex items-center gap-2">
                    <Square className="w-3.5 h-3.5" />
                    Borders & Effects
                  </div>
                  
                  {/* Border Width */}
                  <div className="space-y-2">
                     <label className="text-xs text-zinc-500">Border Width</label>
                     <div className="grid grid-cols-5 gap-1">
                        {[{v: 'border-0', l: '0'}, {v: 'border', l: '1'}, {v: 'border-2', l: '2'}, {v: 'border-4', l: '4'}, {v: 'border-8', l: '8'}].map((item) => {
                             const isActive = isStyleActive(selectedComponent.id, item.v);
                             return (
                                <button
                                    key={item.v}
                                    onClick={() => handleStyleChange(selectedComponent.id, 'borderWidth', item.v)}
                                    className={cn(
                                        "h-8 rounded-sm border text-[10px] transition-all flex items-center justify-center",
                                        isActive ? "bg-white text-black border-white" : "text-zinc-500 bg-zinc-900 border-zinc-800 hover:border-zinc-600"
                                    )}
                                >
                                    {item.l}
                                </button>
                             )
                        })}
                     </div>
                  </div>

                  {/* Border Radius (Overrides Global) */}
                  <div className="space-y-2">
                     <label className="text-xs text-zinc-500">Radius Override</label>
                     <div className="grid grid-cols-5 gap-1">
                        {[{v: 'rounded-none', i: <Square className="w-3 h-3"/>}, {v: 'rounded-sm', l: 'SM'}, {v: 'rounded-lg', l: 'LG'}, {v: 'rounded-2xl', l: '2XL'}, {v: 'rounded-full', i: <Circle className="w-3 h-3"/>}].map((item, i) => {
                             const isActive = isStyleActive(selectedComponent.id, item.v);
                             return (
                                <button
                                    key={item.v}
                                    onClick={() => handleStyleChange(selectedComponent.id, 'borderRadius', item.v)}
                                    className={cn(
                                        "h-8 rounded-sm border text-[10px] transition-all flex items-center justify-center",
                                        isActive ? "bg-white text-black border-white" : "text-zinc-500 bg-zinc-900 border-zinc-800 hover:border-zinc-600"
                                    )}
                                    title={item.v}
                                >
                                    {item.i || item.l}
                                </button>
                             )
                        })}
                     </div>
                  </div>

                  {/* Border Color */}
                  <div className="space-y-2">
                    <label className="text-xs text-zinc-500">Border Color</label>
                    <div className="grid grid-cols-5 gap-1">
                        {['border-border', 'border-primary', 'border-destructive', 'border-zinc-800', 'border-zinc-500', 'border-blue-500', 'border-green-500', 'border-amber-500', 'border-rose-500', 'border-indigo-500'].map((cls) => {
                            const isActive = isStyleActive(selectedComponent.id, cls);
                            return (
                                <button
                                    key={cls}
                                    onClick={() => handleStyleChange(selectedComponent.id, 'borderColor', cls)}
                                    className={cn(
                                        "h-6 w-full rounded-sm border transition-all relative",
                                        isActive ? "ring-2 ring-white ring-offset-2 ring-offset-zinc-900 border-transparent" : "border-transparent hover:scale-110",
                                        cls.includes('border') ? cls.replace('border-', 'bg-') : 'bg-zinc-700' 
                                    )}
                                    title={cls}
                                >
                                    {isActive && <div className="absolute inset-0 flex items-center justify-center"><div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" /></div>}
                                </button>
                            )
                        })}
                    </div>
                  </div>
                </div>

                {/* Layout Section */}
                <div className="space-y-4">
                  <div className="text-xs font-semibold text-zinc-100 pb-2 border-b border-zinc-800 flex items-center gap-2">
                    <Layout className="w-3.5 h-3.5" />
                    Layout & BG
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs text-zinc-500">Text Alignment</label>
                    <div className="flex rounded-md border border-zinc-800 p-1 gap-1">
                        {['text-left', 'text-center', 'text-right'].map((val, i) => {
                            const icons = [AlignLeft, AlignCenter, AlignRight];
                            const Icon = icons[i];
                            const isActive = isStyleActive(selectedComponent.id, val);
                            return (
                                <button
                                    key={val}
                                    onClick={() => handleStyleChange(selectedComponent.id, 'align', val)}
                                    className={cn("flex-1 flex items-center justify-center py-1 rounded-sm text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200 transition-colors", isActive && "bg-zinc-800 text-zinc-200")}
                                >
                                    <Icon className="w-4 h-4" />
                                </button>
                            )
                        })}
                    </div>
                  </div>
                   <div className="space-y-2">
                    <label className="text-xs text-zinc-500">Background</label>
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { label: 'Default', cls: 'bg-background' },
                            { label: 'Muted', cls: 'bg-muted/50' },
                            { label: 'Secondary', cls: 'bg-secondary/30' },
                            { label: 'Gradient', cls: 'bg-gradient-to-b from-muted/50 to-background' },
                            { label: 'Darker', cls: 'bg-[#000000]' },
                        ].map((opt) => (
                             <button
                                key={opt.cls}
                                onClick={() => handleStyleChange(selectedComponent.id, 'bg', opt.cls)}
                                className={cn(
                                    "px-2 py-1.5 text-xs border rounded-md transition-colors text-left truncate",
                                    isStyleActive(selectedComponent.id, opt.cls) ? "bg-white text-black border-white" : "text-zinc-500 bg-zinc-900 border-zinc-800 hover:border-zinc-600"
                                )}
                             >
                                {opt.label}
                             </button>
                        ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="text-xs font-semibold text-zinc-100 pb-2 border-b border-zinc-800 flex items-center gap-2">
                     <Palette className="w-3.5 h-3.5" />
                     Main Content Props
                  </div>
                  {Object.entries(selectedComponent.props).map(([key, value]) => {
                     if (Array.isArray(value)) return null;

                     const isLongText = key === 'description' || key === 'quote' || key === 'content' || key.includes('answer') || (typeof value === 'string' && value.length > 50);

                     return (
                        <div key={key} className="space-y-1.5">
                        <label className="text-xs text-zinc-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</label>
                        {isLongText ? (
                            <textarea
                                value={value}
                                onChange={(e) => updateComponent(selectedComponent.id, key, e.target.value)}
                                className="flex min-h-[80px] w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 shadow-sm transition-colors placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        ) : (
                            <input
                                type="text"
                                value={value}
                                onChange={(e) => updateComponent(selectedComponent.id, key, e.target.value)}
                                className="flex h-9 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1 text-sm text-zinc-200 shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        )}
                        </div>
                     )
                  })}
                </div>

                <div className="space-y-4">
                    <div className="text-xs font-semibold text-zinc-100 pb-2 border-b border-zinc-800">Custom CSS Override</div>
                    <div className="space-y-1.5">
                        <textarea
                            value={selectedComponent.customClasses}
                            onChange={(e) => updateClasses(selectedComponent.id, e.target.value)}
                            className="flex min-h-[80px] w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-400 shadow-sm placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 disabled:cursor-not-allowed disabled:opacity-50 font-mono text-xs"
                            placeholder="Add Tailwind classes..."
                        />
                    </div>
                </div>
              </div>
            ) : (
              /* Global Design + Page Properties Panel */
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-200">
                 {/* ... (Rest of Global Settings) ... */}
                 
                 {/* Theme Color */}
                 <div className="space-y-3">
                    <label className="text-xs font-semibold text-zinc-100 flex items-center gap-2">
                        <Palette className="w-3.5 h-3.5" />
                        Color Theme
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                        {Object.entries(COLOR_THEMES).map(([key, theme]) => (
                            <button
                                key={key}
                                onClick={() => setGlobalSettings(prev => ({...prev, theme: key}))}
                                className={cn(
                                    "w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center",
                                    globalSettings.theme === key ? "border-white scale-110" : "border-transparent opacity-50 hover:opacity-100"
                                )}
                                title={theme.label}
                            >
                                <div className={cn("w-full h-full rounded-full", theme.activeColor)} />
                            </button>
                        ))}
                    </div>
                 </div>

                 {/* Mode & Font */}
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-zinc-100 flex items-center gap-2">
                            {globalSettings.mode === 'dark' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
                            Preview Mode
                        </label>
                        <div className="flex bg-zinc-900 p-1 rounded-md border border-zinc-800">
                            {['light', 'dark'].map((m) => (
                                <button
                                    key={m}
                                    onClick={() => setGlobalSettings(prev => ({...prev, mode: m as any}))}
                                    className={cn(
                                        "flex-1 text-xs py-1.5 capitalize rounded-sm transition-all",
                                        globalSettings.mode === m ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
                                    )}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>
                     <div className="space-y-2">
                        <label className="text-xs font-semibold text-zinc-100 flex items-center gap-2">
                            <Type className="w-3.5 h-3.5" />
                            Font
                        </label>
                         <select 
                            className="w-full h-8 text-xs bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-md px-2 focus:outline-none focus:ring-1 focus:ring-zinc-700"
                            value={globalSettings.font}
                            onChange={(e) => setGlobalSettings(prev => ({...prev, font: e.target.value}))}
                         >
                             <option value="font-sans">Sans</option>
                             <option value="font-serif">Serif</option>
                             <option value="font-mono">Mono</option>
                         </select>
                    </div>
                 </div>

                 {/* Radius Scale */}
                 <div className="space-y-3">
                    <label className="text-xs font-semibold text-zinc-100 flex items-center gap-2 justify-between">
                        <div className="flex items-center gap-2"><Circle className="w-3.5 h-3.5" /> Radius</div>
                        <span className="text-[10px] text-zinc-500 font-mono">{globalSettings.radius}rem</span>
                    </label>
                    <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.1"
                        value={globalSettings.radius}
                        onChange={(e) => setGlobalSettings(prev => ({...prev, radius: parseFloat(e.target.value)}))}
                        className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
                    />
                    <div className="flex justify-between text-[10px] text-zinc-600">
                        <span>Sharp</span>
                        <span>Round</span>
                    </div>
                 </div>

                 {/* Global Padding Y */}
                 <div className="space-y-3">
                    <label className="text-xs font-semibold text-zinc-100 flex items-center gap-2">
                        <ArrowUpDown className="w-3.5 h-3.5" />
                        Default Vertical Padding (Y)
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                        {[
                            {l: 'XS', v: 'py-4 md:py-8'},
                            {l: 'S', v: 'py-8 md:py-16'},
                            {l: 'M', v: 'py-12 md:py-24'},
                            {l: 'L', v: 'py-20 md:py-32'}
                        ].map((opt) => (
                             <button
                                key={opt.l}
                                onClick={() => setGlobalSettings(prev => ({...prev, globalPaddingY: opt.v}))}
                                className={cn(
                                    "px-2 py-1.5 text-xs border rounded-md transition-colors",
                                    globalSettings.globalPaddingY === opt.v ? "bg-white text-black border-white" : "text-zinc-500 bg-zinc-900 border-zinc-800 hover:border-zinc-600"
                                )}
                             >
                                {opt.l}
                             </button>
                        ))}
                    </div>
                 </div>

                 {/* Global Padding X */}
                 <div className="space-y-3">
                    <label className="text-xs font-semibold text-zinc-100 flex items-center gap-2">
                        <ArrowLeftRight className="w-3.5 h-3.5" />
                        Default Horizontal Padding (X)
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                        {[
                            {l: 'XS', v: 'px-2 md:px-4'},
                            {l: 'S', v: 'px-4 md:px-6'},
                            {l: 'M', v: 'px-6 md:px-12'},
                            {l: 'L', v: 'px-8 md:px-16'}
                        ].map((opt) => (
                             <button
                                key={opt.l}
                                onClick={() => setGlobalSettings(prev => ({...prev, globalPaddingX: opt.v}))}
                                className={cn(
                                    "px-2 py-1.5 text-xs border rounded-md transition-colors",
                                    globalSettings.globalPaddingX === opt.v ? "bg-white text-black border-white" : "text-zinc-500 bg-zinc-900 border-zinc-800 hover:border-zinc-600"
                                )}
                             >
                                {opt.l}
                             </button>
                        ))}
                    </div>
                 </div>

                 {/* Global Gap (Margin) */}
                 <div className="space-y-3">
                    <label className="text-xs font-semibold text-zinc-100 flex items-center gap-2">
                        <BoxSelect className="w-3.5 h-3.5" />
                        Section Gap (Margin)
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                        {[
                            {l: '0', v: 'gap-0'},
                            {l: 'S', v: 'gap-4 md:gap-8'},
                            {l: 'M', v: 'gap-8 md:gap-16'},
                            {l: 'L', v: 'gap-16 md:gap-24'}
                        ].map((opt) => (
                             <button
                                key={opt.l}
                                onClick={() => setGlobalSettings(prev => ({...prev, globalGap: opt.v}))}
                                className={cn(
                                    "px-2 py-1.5 text-xs border rounded-md transition-colors",
                                    globalSettings.globalGap === opt.v ? "bg-white text-black border-white" : "text-zinc-500 bg-zinc-900 border-zinc-800 hover:border-zinc-600"
                                )}
                             >
                                {opt.l}
                             </button>
                        ))}
                    </div>
                 </div>

                 {/* Global Shadow */}
                 <div className="space-y-3">
                    <label className="text-xs font-semibold text-zinc-100 flex items-center gap-2">
                        <Square className="w-3.5 h-3.5" />
                        Default Shadow
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {[
                            {l: 'None', v: 'shadow-none'},
                            {l: 'Soft', v: 'shadow-sm'},
                            {l: 'Hard', v: 'shadow-lg border-primary/20'}
                        ].map((opt) => (
                             <button
                                key={opt.l}
                                onClick={() => setGlobalSettings(prev => ({...prev, globalShadow: opt.v}))}
                                className={cn(
                                    "px-2 py-1.5 text-xs border rounded-md transition-colors",
                                    globalSettings.globalShadow === opt.v ? "bg-white text-black border-white" : "text-zinc-500 bg-zinc-900 border-zinc-800 hover:border-zinc-600"
                                )}
                             >
                                {opt.l}
                             </button>
                        ))}
                    </div>
                 </div>

                 <div className="h-px bg-zinc-800 my-6" />

                 {/* Page Layout Settings */}
                 <div className="space-y-6">
                     <div className="space-y-1">
                        <h3 className="font-medium text-sm text-zinc-100">Page Container</h3>
                        <p className="text-xs text-zinc-500">Global wrapper settings.</p>
                     </div>

                     {/* Max Width */}
                     <div className="space-y-2">
                        <label className="text-xs font-medium text-zinc-500 flex items-center gap-2">
                            <Maximize className="w-3.5 h-3.5" /> Max Width
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {['w-full', 'max-w-7xl', 'max-w-5xl', 'max-w-3xl'].map((w) => (
                                 <button
                                    key={w}
                                    onClick={() => setLayoutConfig(p => ({ ...p, maxWidth: w }))}
                                    className={cn(
                                        "px-2 py-1.5 text-xs border rounded-md transition-colors",
                                        layoutConfig.maxWidth === w ? "bg-white text-black border-white" : "text-zinc-500 bg-zinc-900 border-zinc-800 hover:border-zinc-600"
                                    )}
                                 >
                                    {w === 'w-full' ? 'Full Width' : w.replace('max-w-', '').toUpperCase()}
                                 </button>
                            ))}
                        </div>
                      </div>

                      {/* Vertical Center */}
                      <div className="space-y-2">
                         <label className="text-xs font-medium text-zinc-500 flex items-center gap-2">
                            <ArrowUpDown className="w-3.5 h-3.5" /> Vertical Center
                        </label>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setLayoutConfig(p => ({ ...p, isCenteredVertical: !p.isCenteredVertical }))}
                                className={cn(
                                    "flex-1 px-3 py-2 text-xs border rounded-md transition-colors",
                                    layoutConfig.isCenteredVertical ? "bg-white text-black border-white" : "text-zinc-500 bg-zinc-900 border-zinc-800 hover:border-zinc-600"
                                )}
                            >
                                {layoutConfig.isCenteredVertical ? "Enabled" : "Disabled"}
                            </button>
                        </div>
                      </div>

                      {/* Page Border Controls */}
                      <div className="space-y-3">
                         <div className="flex items-center justify-between">
                             <label className="text-xs font-medium text-zinc-500 flex items-center gap-2">
                                <Square className="w-3.5 h-3.5" /> Element Container Border
                            </label>
                            <button
                                onClick={() => setLayoutConfig(p => ({ ...p, showBorder: !p.showBorder }))}
                                className={cn(
                                    "w-8 h-4 rounded-full transition-colors relative",
                                    layoutConfig.showBorder ? "bg-white" : "bg-zinc-800"
                                )}
                            >
                                <div className={cn("absolute top-0.5 left-0.5 w-3 h-3 bg-zinc-950 rounded-full transition-transform", layoutConfig.showBorder && "translate-x-4")} />
                            </button>
                         </div>
                         
                         {layoutConfig.showBorder && (
                             <div className="space-y-2 pt-2 animate-in slide-in-from-top-2">
                                 {/* Style */}
                                <div className="grid grid-cols-3 gap-2">
                                    {['border-solid', 'border-dashed', 'border-dotted'].map(s => (
                                        <button key={s} onClick={() => setLayoutConfig(p => ({...p, borderStyle: s}))} className={cn("text-[10px] py-1 border rounded hover:border-zinc-500", layoutConfig.borderStyle === s ? "border-white bg-white text-black" : "border-zinc-800 text-zinc-500")}>
                                            {s.replace('border-', '')}
                                        </button>
                                    ))}
                                </div>
                                {/* Width */}
                                <div className="grid grid-cols-4 gap-2">
                                    {['border', 'border-2', 'border-4', 'border-8'].map(w => (
                                        <button key={w} onClick={() => setLayoutConfig(p => ({...p, borderWidth: w}))} className={cn("text-[10px] py-1 border rounded hover:border-zinc-500", layoutConfig.borderWidth === w ? "border-white bg-white text-black" : "border-zinc-800 text-zinc-500")}>
                                            {w === 'border' ? '1px' : w.replace('border-', '') + 'px'}
                                        </button>
                                    ))}
                                </div>
                                {/* Color */}
                                <div className="grid grid-cols-5 gap-2">
                                    {['border-border', 'border-primary', 'border-zinc-500', 'border-blue-500', 'border-red-500'].map(c => (
                                        <button key={c} onClick={() => setLayoutConfig(p => ({...p, borderColor: c}))} className={cn("h-4 w-full rounded border", layoutConfig.borderColor === c ? "ring-1 ring-white border-transparent" : "border-transparent", c.includes('border-') ? c.replace('border-', 'bg-') : 'bg-zinc-500')} />
                                    ))}
                                </div>
                             </div>
                         )}
                      </div>
                  </div>
              </div>
            )}
          </div>
        </aside>

      </div>
      <DragOverlay>
         {activeDragType ? (
            <div className="px-4 py-3 bg-zinc-900 border border-zinc-700 text-zinc-200 rounded-md shadow-xl cursor-grabbing w-64 flex items-center gap-3">
                <div className="font-medium text-sm">
                    {/* Check if it's a component or a template for the label */}
                    {activeDragType.startsWith('template-') 
                        ? TEMPLATES.find(t => t.id === activeDragType)?.label 
                        : SIDEBAR_ITEMS.find(i => i.type === activeDragType)?.label}
                </div>
            </div>
         ) : null}
         {activeSortId ? (
            <div className="opacity-80">
                <ComponentPreview 
                    data={components.find(c => c.id === activeSortId)!} 
                    isActive={true} 
                    globalSettings={globalSettings}
                />
            </div>
         ): null}
      </DragOverlay>
    </DndContext>
  );
}

// ... (Sub-components: DraggableSidebarItem, DraggableTemplateItem, CanvasDroppable, SortableComponent, StructureEditor, StructureItem) stay the same ...
// Re-exporting them implicitly by keeping the file structure intact in XML.

// --- Sub-components for Cleanliness ---

const DraggableSidebarItem: React.FC<{ item: typeof SIDEBAR_ITEMS[0] }> = ({ item }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `sidebar-${item.type}`,
    data: { type: item.type },
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const Icon = item.icon;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-zinc-900/50 cursor-grab active:cursor-grabbing border border-transparent hover:border-zinc-800 transition-all group"
    >
      <Icon className="w-4 h-4 text-zinc-500 group-hover:text-zinc-200" />
      <span className="text-sm font-medium text-zinc-500 group-hover:text-zinc-200">{item.label}</span>
    </div>
  );
};

// New Template Item Component
const DraggableTemplateItem: React.FC<{ template: Template }> = ({ template }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
      id: template.id,
      data: { type: template.id }, // Pass ID as type for identification
    });
  
    const style = transform ? {
      transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;
  
    return (
      <div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        style={style}
        className="flex flex-col gap-1 px-3 py-3 rounded-md bg-zinc-900/40 hover:bg-zinc-900/80 cursor-grab active:cursor-grabbing border border-zinc-800/50 hover:border-zinc-700 transition-all group"
      >
        <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-300">{template.label}</span>
            <div className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded">{template.items.length} Secs</div>
        </div>
        <span className="text-xs text-zinc-500 line-clamp-2">{template.description}</span>
      </div>
    );
  };

const CanvasDroppable: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setNodeRef } = useDroppable({
    id: 'canvas-droppable',
  });

  return (
    <div ref={setNodeRef} className="w-full flex justify-center pb-20">
      {children}
    </div>
  );
};

const SortableComponent: React.FC<{ 
    data: ComponentData; 
    isSelected: boolean; 
    onSelect: () => void; 
    onRemove: () => void;
    globalSettings: GlobalDesignConfig;
}> = ({ data, isSelected, onSelect, onRemove, globalSettings }) => {
    
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: data.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
        zIndex: isDragging ? 50 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            onClick={(e) => {
                e.stopPropagation();
                onSelect();
            }}
            className="relative group w-full"
        >
            {isSelected && (
                <div className="absolute inset-0 border-2 border-primary z-20 pointer-events-none" />
            )}
            
            <div className={cn(
                "absolute right-4 top-2 z-30 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
                isSelected && "opacity-100"
            )}>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove();
                    }}
                    className="p-1.5 bg-red-500/90 text-white rounded-md shadow-sm hover:bg-red-600"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>

            <ComponentPreview 
                data={data} 
                isActive={isSelected} 
                dragHandleProps={{...attributes, ...listeners}}
                globalSettings={globalSettings}
            />
        </div>
    );
};

const StructureEditor: React.FC<StructureEditorProps> = ({ items, onReorder, onChange, onRemove, onAdd }) => {
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            const oldIndex = items.findIndex((i) => i.id === active.id);
            const newIndex = items.findIndex((i) => i.id === over?.id);
            onReorder(oldIndex, newIndex);
        }
    };

    return (
        <DndContext sensors={sensors} collisionDetection={closestCorners} modifiers={[restrictToVerticalAxis]} onDragEnd={handleDragEnd}>
            <div className="flex flex-col gap-2">
                <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
                    {items.map((item, index) => (
                        <StructureItem 
                            key={item.id} 
                            item={item} 
                            index={index} 
                            onChange={onChange}
                            onRemove={onRemove}
                        />
                    ))}
                </SortableContext>
                <button 
                    onClick={onAdd}
                    className="flex items-center justify-center gap-2 w-full py-2 text-xs font-medium border border-dashed border-zinc-800 rounded-md hover:bg-zinc-900 hover:border-zinc-600 transition-colors text-zinc-500 hover:text-zinc-300 mt-2"
                >
                    <Plus className="w-3.5 h-3.5" />
                    Add Item
                </button>
            </div>
        </DndContext>
    );
};

const StructureItem: React.FC<{ item: any, index: number, onChange: any, onRemove: any }> = ({ item, index, onChange, onRemove }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
    const [isExpanded, setIsExpanded] = useState(false);

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 100 : 1,
    };

    const label = item.title || item.name || item.question || item.text || item.label || item.year || item.alt || `Item ${index + 1}`;

    return (
        <div ref={setNodeRef} style={style} className="bg-zinc-900 border border-zinc-800 rounded-md overflow-hidden group">
            <div className="flex items-center gap-2 p-2 bg-zinc-800/50 hover:bg-zinc-800 transition-colors">
                <div {...attributes} {...listeners} className="cursor-grab hover:text-white text-zinc-500 p-0.5">
                    <GripVertical className="w-3.5 h-3.5" />
                </div>
                <div 
                    className="flex-1 text-xs font-medium truncate cursor-pointer select-none text-zinc-300 hover:text-white"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                   {label}
                </div>
                <button onClick={() => setIsExpanded(!isExpanded)} className="text-zinc-500 hover:text-white">
                    {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>
                <button onClick={() => onRemove(item.id)} className="text-zinc-500 hover:text-red-400 p-0.5">
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>
            
            {isExpanded && (
                <div className="p-2 space-y-2 border-t border-zinc-800 bg-zinc-950/50">
                    {Object.entries(item).map(([key, value]) => {
                        if (key === 'id' || key === 'popular') return null; 
                        if (key === 'features') return null; 
                        
                        return (
                            <div key={key} className="space-y-1">
                                <label className="text-[10px] text-zinc-500 uppercase">{key}</label>
                                <input 
                                    className="flex w-full rounded-sm border border-zinc-800 bg-zinc-900 px-2 py-1 text-xs text-zinc-300 shadow-sm transition-colors placeholder:text-zinc-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-600"
                                    value={value as string}
                                    onChange={(e) => onChange(item.id, key, e.target.value)}
                                />
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    );
};

export default App;