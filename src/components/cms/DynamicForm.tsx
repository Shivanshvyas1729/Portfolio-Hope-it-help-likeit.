import React from 'react';
import { z } from 'zod';
import { Plus, Trash2, Image as ImageIcon } from 'lucide-react';

// A minimal fallback error-boundary for image preview
const ImagePreview = ({ url }: { url: string }) => {
  return (
    <div className="mt-2 w-full h-32 rounded-lg bg-muted/30 border border-border/50 flex flex-col items-center justify-center overflow-hidden relative">
      {url ? (
        <img 
          src={url} 
          alt="Preview" 
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.parentElement?.classList.add('broken-image');
          }}
        />
      ) : (
        <div className="flex flex-col items-center text-muted-foreground/50">
          <ImageIcon size={24} className="mb-1" />
          <span className="text-xs">No image provided</span>
        </div>
      )}
      <div className="broken-image-fallback absolute inset-0 hidden items-center justify-center bg-muted flex-col text-muted-foreground/50">
        <ImageIcon size={24} className="mb-1" />
        <span className="text-xs">Failed to load image</span>
      </div>
    </div>
  );
};

// Convert camelCase to Title Case
const formatLabel = (key: string) => {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
};

interface DynamicFormProps {
  schema: z.ZodTypeAny;
  data: any;
  onChange: (data: any) => void;
  path?: string[];
}

export const DynamicForm: React.FC<DynamicFormProps> = React.memo(({ schema, data, onChange, path = [] }) => {
  const unwrappedSchema = schema instanceof z.ZodOptional || schema instanceof z.ZodDefault 
    ? schema._def.innerType 
    : schema;

  // Render Object
  if (unwrappedSchema instanceof z.ZodObject) {
    const shape = unwrappedSchema.shape;
    const currentData = data || {};

    return (
      <div className={`space-y-4 ${path.length > 0 ? "pl-4 border-l-2 border-border/40 mt-2" : ""}`}>
        {Object.keys(shape).map(key => {
          return (
            <div key={key} className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block opacity-70">
                {formatLabel(key)}
              </label>
              <DynamicForm
                schema={shape[key]}
                data={currentData[key]}
                path={[...path, key]}
                onChange={(newVal) => onChange({ ...currentData, [key]: newVal })}
              />
            </div>
          );
        })}
      </div>
    );
  }

  // Render Array
  if (unwrappedSchema instanceof z.ZodArray) {
    const itemSchema = unwrappedSchema.element;
    const currentArray = Array.isArray(data) ? data : [];

    return (
      <div className="space-y-3">
        {currentArray.map((item, index) => (
          <div key={index} className="relative p-4 rounded-xl border border-border/50 bg-muted/10 group">
            <button 
              onClick={() => {
                const newArr = [...currentArray];
                newArr.splice(index, 1);
                onChange(newArr);
              }}
              className="absolute top-2 right-2 text-muted-foreground hover:text-destructive p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
              title="Remove Item"
            >
              <Trash2 size={14} />
            </button>
            <div className="text-[10px] font-mono text-muted-foreground mb-2 pb-2 border-b border-border/30 opacity-60">Item {index + 1}</div>
            <DynamicForm
              schema={itemSchema}
              data={item}
              path={[...path, String(index)]}
              onChange={(newVal) => {
                const newArr = [...currentArray];
                newArr[index] = newVal;
                onChange(newArr);
              }}
            />
          </div>
        ))}
        <button
          onClick={() => {
            let emptyVal: any = "";
            if (itemSchema instanceof z.ZodObject) emptyVal = {};
            if (itemSchema instanceof z.ZodNumber) emptyVal = 0;
            if (itemSchema instanceof z.ZodBoolean) emptyVal = false;
            onChange([...currentArray, emptyVal]);
          }}
          className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors px-2 py-1.5 rounded-md hover:bg-primary/5"
        >
          <Plus size={14} /> Add {formatLabel(path[path.length - 1] || "Item")}
        </button>
      </div>
    );
  }

  // Render String
  if (unwrappedSchema instanceof z.ZodString || unwrappedSchema instanceof z.ZodOptional && unwrappedSchema._def.innerType instanceof z.ZodString) {
    const isUrl = unwrappedSchema.description?.includes("URL") || path[path.length-1]?.toLowerCase().includes("url") || path[path.length-1]?.toLowerCase().includes("link");
    const isImage = path[path.length-1]?.toLowerCase().includes("image");
    const isLargeText = path[path.length-1]?.includes("description") || path[path.length-1]?.includes("content");

    return (
      <div className="w-full">
        {isLargeText ? (
          <textarea
            value={data || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-background border border-border/30 rounded-lg p-2.5 text-sm focus:outline-none focus:border-primary/50 text-foreground resize-y min-h-[80px]"
            placeholder="Type here..."
          />
        ) : (
          <input
            type={isUrl ? "url" : "text"}
            value={data || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-background border border-border/30 rounded-lg p-2.5 text-sm focus:outline-none focus:border-primary/50 text-foreground"
            placeholder={isUrl ? "https://" : "Value..."}
          />
        )}
        {isImage && <ImagePreview url={data} />}
      </div>
    );
  }

  // Render Number
  if (unwrappedSchema instanceof z.ZodNumber || unwrappedSchema instanceof z.ZodDefault && unwrappedSchema._def.innerType instanceof z.ZodNumber) {
    return (
      <input
        type="number"
        value={data ?? 0}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full bg-background border border-border/30 rounded-lg p-2.5 text-sm focus:outline-none focus:border-primary/50 text-foreground"
      />
    );
  }

  // Render Boolean
  if (unwrappedSchema instanceof z.ZodBoolean || unwrappedSchema instanceof z.ZodDefault && unwrappedSchema._def.innerType instanceof z.ZodBoolean) {
    return (
      <label className="flex items-center gap-2 cursor-pointer pt-1">
        <div className={`w-10 h-5 rounded-full p-0.5 transition-colors ${data ? 'bg-primary' : 'bg-border'}`}>
          <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${data ? 'translate-x-5' : 'translate-x-0'}`} />
        </div>
        <span className="text-sm font-medium select-none">{data ? 'Enabled' : 'Disabled'}</span>
        <input 
          type="checkbox" 
          checked={!!data} 
          onChange={(e) => onChange(e.target.checked)}
          className="hidden" 
          aria-hidden="true" 
        />
      </label>
    );
  }

  // Render Enum 
  if (unwrappedSchema instanceof z.ZodEnum) {
    return (
      <select 
        value={data || unwrappedSchema.options[0]} 
        onChange={e => onChange(e.target.value)}
        className="w-full bg-background border border-border/30 rounded-lg p-2.5 text-sm focus:outline-none focus:border-primary/50 text-foreground"
      >
        {unwrappedSchema.options.map((opt: string) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    );
  }

  // Unsupported fallback
  return (
    <textarea
      value={typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data || '')}
      onChange={e => {
        try { onChange(JSON.parse(e.target.value)); }
        catch { onChange(e.target.value); }
      }}
      className="w-full bg-background border border-border/30 rounded-lg p-2.5 text-sm focus:outline-none focus:border-primary/50 font-mono text-[10px] text-foreground/80 h-20"
    />
  );
});
