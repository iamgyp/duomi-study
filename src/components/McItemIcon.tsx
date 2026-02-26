import { McItem, getItemDisplayName, getCurrencySymbol } from '@/lib/algebra-generator';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface McItemIconProps {
  item: McItem;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  showPrice?: boolean;
  className?: string;
  language?: 'zh' | 'en';
}

export function McItemIcon({
  item,
  size = 'md',
  showName = false,
  showPrice = false,
  className,
  language = 'zh',
}: McItemIconProps) {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const displayName = getItemDisplayName(item, language);
  const currency = getCurrencySymbol(language);

  return (
    <div className={twMerge(clsx('flex items-center gap-2', className))}>
      <img
        src={`/items/${item.icon}`}
        alt={displayName}
        className={twMerge(clsx(sizeClasses[size], 'object-contain'))}
        width={size === 'sm' ? 20 : size === 'md' ? 32 : 48}
        height={size === 'sm' ? 20 : size === 'md' ? 32 : 48}
      />
      {(showName || showPrice) && (
        <div className="flex flex-col">
          {showName && <span className="text-sm font-bold text-gray-700">{displayName}</span>}
          {showPrice && <span className="text-xs text-gray-500">{item.price}{currency}</span>}
        </div>
      )}
    </div>
  );
}

// 物品价格表组件（用于题目顶部）
interface ItemPriceListProps {
  items: McItem[];
  language?: 'zh' | 'en';
}

export function ItemPriceList({ items, language = 'zh' }: ItemPriceListProps) {
  const label = language === 'zh' ? '💰 价格表：' : '💰 Price:';
  const currency = getCurrencySymbol(language);

  return (
    <div className="flex flex-wrap gap-3 items-center bg-gray-50 p-3 rounded border-2 border-gray-300">
      <span className="text-sm font-bold text-gray-600 mr-1 whitespace-nowrap">{label}</span>
      {items.map((item) => {
        const displayName = getItemDisplayName(item, language);
        // 使用简短名称（英文时去掉材质前缀）
        const shortName = language === 'en' 
          ? displayName.replace('Iron ', '').replace('Wood ', '').replace('Stone ', '').replace('Gold ', '').replace('Diamond ', '').replace('Cooked ', '')
          : displayName;
        
        return (
          <div
            key={item.id}
            className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-gray-200 shadow-sm"
          >
            <img
              src={`/items/${item.icon}`}
              alt={displayName}
              className="w-6 h-6 object-contain"
              width={24}
              height={24}
            />
            <span className="text-xs font-bold text-gray-700 whitespace-nowrap">{shortName}</span>
            <span className="text-xs text-gray-500">=</span>
            <span className="text-xs font-bold text-green-600">{item.price}{currency}</span>
          </div>
        );
      })}
    </div>
  );
}
