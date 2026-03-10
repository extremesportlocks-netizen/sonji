import { Plus } from "lucide-react";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4 text-gray-400">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-xs text-gray-500 text-center max-w-xs mb-5">{description}</p>
      {actionLabel && onAction && (
        <button onClick={onAction}
          className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-sm">
          <Plus className="w-4 h-4" />
          {actionLabel}
        </button>
      )}
    </div>
  );
}
