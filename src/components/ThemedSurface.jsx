// Reusable colored-background wrapper. Pass a `color` name ("pink", "blue",
// "yellow", "lime", "khaki", ...) and it applies the matching .theme-<color>
// class (defined once in styles.css) on top of whatever element/classes you
// give it. No color = no theming, renders as a plain element.
/**
 * @param {{
 *   as?: any,
 *   color?: string,
 *   className?: string,
 *   children?: import('react').ReactNode,
 * } & Record<string, any>} props
 */
export default function ThemedSurface({ as: Tag = "div", color, className = "", children, ...rest }) {
  const classes = [className, color ? `theme-${color}` : ""].filter(Boolean).join(" ");

  return (
    <Tag className={classes} {...rest}>
      {children}
    </Tag>
  );
}
