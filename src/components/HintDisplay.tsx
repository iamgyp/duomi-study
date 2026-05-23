'use client';

import { Lightbulb } from 'lucide-react';

interface HintDisplayProps {
  hint: string;
  visible: boolean;
}

export function HintDisplay({ hint, visible }: HintDisplayProps) {
  if (!visible || !hint) return null;

  return (
    <div className="mb-6 bg-yellow-50 border-2 border-yellow-300 rounded-sm p-4 text-center">
      <div className="flex items-center justify-center gap-2 mb-2">
        <Lightbulb className="h-5 w-5 text-yellow-600" />
        <span className="text-sm font-bold text-yellow-700">提示</span>
      </div>
      <p className="text-lg text-yellow-800">{hint}</p>
    </div>
  );
}
