'use client';

import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface ActionButton {
  icon: LucideIcon;
  onClick: () => void;
  title?: string;
  variant?: 'default' | 'danger';
  disabled?: boolean;
}

interface ActionButtonsProps {
  actions: Array<ActionButton | null | false | undefined>;
}

export default function ActionButtons({ actions }: ActionButtonsProps) {
  const visibleActions = actions.filter((action): action is ActionButton => Boolean(action));

  return (
    <div className="flex items-center gap-2">
      {visibleActions.map((action, index) => (
        <button
          key={index}
          onClick={action.onClick}
          disabled={action.disabled}
          title={action.title}
          className={`p-1.5 rounded transition-colors duration-200 ${
            action.variant === 'danger'
              ? 'text-slate-400 hover:text-red-500 hover:bg-red-50'
              : 'text-slate-400 hover:text-emerald-700 hover:bg-emerald-50'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <action.icon size={16} />
        </button>
      ))}
    </div>
  );
}
