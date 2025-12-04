type IconProps = React.HTMLAttributes<HTMLImageElement> & {
  width?: number;
  height?: number;
}

export const Icons = {
  logo: ({ className, width = 150, height = 150, ...props }: IconProps) => (
    <img 
      src="/logo.png" 
      alt="Shopibot Logo" 
      width={width}
      height={height}
      className={className}
      {...props}
    />
  ),
}