import React from 'react';
import { getPriorityColor, getPriorityLabel } from '../../utils/helpers';
import { useLanguage } from '../../context/LanguageContext';
import { Crown } from 'lucide-react';

const PriorityBadge = ({ priority, isParentPriority, className = '' }) => {
  const { t } = useLanguage();
  const isParent = isParentPriority || priority === 1;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold border ${getPriorityColor(priority, isParentPriority)} ${className}`}>
      {isParent && <Crown className="w-3 h-3" />}
      {getPriorityLabel(priority, isParentPriority, t)}
    </span>
  );
};

export default PriorityBadge;
