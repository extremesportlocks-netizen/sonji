const variants: Record<string, string> = {
  default: "bg-gray-100 text-gray-700 border-gray-200",
  primary: "bg-indigo-50 text-indigo-700 border-indigo-200",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  danger: "bg-red-50 text-red-600 border-red-200",
  info: "bg-blue-50 text-blue-700 border-blue-200",
  violet: "bg-violet-50 text-violet-700 border-violet-200",
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: keyof typeof variants;
  dot?: boolean;
  dotColor?: string;
  className?: string;
}

export default function Badge({ children, variant = "default", dot, dotColor, className = "" }: BadgeProps) {
  const style = variants[variant] || variants.default;

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${style} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColor || "bg-current"}`} />}
      {children}
    </span>
  );
}
