import React, { useMemo } from "react";
import { useCMSData } from "@/context/CMSContext";
import { cn } from "@/lib/utils";

/**
 * A specialized text component whose hover effect is driven by YAML configuration.
 * Maps 'textHoverColors' and 'textTransitionSpeed' from portfolio.yaml
 * into dynamic CSS variables used by the .dynamic-hover-text utility.
 * 
 * Uses generics to support any HTML element (span, a, p, etc.) and its associated props.
 */
export const DynamicHoverText = <T extends React.ElementType = "span">({ 
  children, 
  as, 
  className, 
  style, 
  ...props 
}: { as?: T; children: React.ReactNode } & React.ComponentPropsWithoutRef<T>) => {
  const settings = useCMSData((data) => data.settings);
  const Component = as || "span";

  const dynamicStyles = useMemo(() => {
    if (!settings) return style;
    
    const colors = settings.textHoverColors?.length 
      ? settings.textHoverColors 
      : (settings.ropeLightColors?.length ? settings.ropeLightColors : ["#6366f1"]);
    
    // If multiple colors, use first one as fallback for single property use
    const baseColor = colors[0];
    const isGradient = colors.length > 1;
    const gradient = `linear-gradient(135deg, ${colors.join(', ')})`;

    return {
      "--hover-target-color": isGradient ? "transparent" : baseColor,
      "--hover-transition": settings.textTransitionSpeed || "0.4s",
      "--hover-gradient": isGradient ? gradient : "none",
      ...style,
    } as React.CSSProperties;
  }, [settings, style]);

  return (
    <Component
      className={cn("dynamic-hover-text", className)}
      style={dynamicStyles}
      {...props}
    >
      {children}
    </Component>
  );
};
