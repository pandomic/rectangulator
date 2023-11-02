import { Theme, ThemeColorVariation, CartesianPoint } from "@/types";
import { computeLabelDimensions } from "@/layouts";

export interface SetLabelProps {
  theme: Theme;
  label: string;
  setWidth: number;
  position: CartesianPoint;
  colorVariation: ThemeColorVariation;
  onHover: (hovered: boolean) => void;
  active?: boolean;
  inactive?: boolean;
}

const labelRendererStyles = (theme: Theme, colorVariation: ThemeColorVariation) => ({
  root: {
    fontFamily: theme.fontFamily,
    fontSize: `${theme.fontSize}px`,
    lineHeight: `${theme.fontSize}px`,
    letterSpacing: '0px',
    color: colorVariation.setLabelColor,
  },
});

export const SetLabelRenderer = ({ theme, colorVariation, label, setWidth, position, onHover, active, inactive }: SetLabelProps) => {
  const styles = labelRendererStyles(theme, colorVariation);
  const dimensions = computeLabelDimensions(theme, label, setWidth);

  return (
    <g
      data-type="set-label"
      style={styles.root}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      transform={`translate(${position.x},${position.y})`}
      className={`svg-label ${active ? 'active' : ''} ${inactive ? 'inactive' : ''}`}
    >
      <rect
        x={0}
        y={0}
        width={dimensions.width}
        height={dimensions.height}
        stroke={colorVariation.setOutlineColor}
        fill={colorVariation.setBackgroundColor}
      />
      <text
        x={theme.setLabelPadding}
        y={theme.setLabelPadding + theme.fontSize}
        fill={colorVariation.setLabelColor}
      >
        {label}
      </text>
    </g>
  );
};
