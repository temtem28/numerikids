import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Coins, Check, Lock } from 'lucide-react';

interface StoreItemCardProps {
  item: {
    id: string;
    name: string;
    description: string;
    category: string;
    price: number;
    image_url?: string;
    rarity: string;
  };
  owned?: boolean;
  onPurchase: (itemId: string) => void;
  disabled?: boolean;
  userCoins?: number;
}

const rarityColors = {
  common: 'bg-gray-500',
  rare: 'bg-blue-500',
  epic: 'bg-purple-500',
  legendary: 'bg-yellow-500'
};

export function StoreItemCard({ item, owned, onPurchase, disabled, userCoins }: StoreItemCardProps) {
  const canAfford = userCoins !== undefined ? userCoins >= item.price : true;
  const isDisabled = disabled || !canAfford;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {item.image_url && (
        <div className="aspect-square bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
        </div>
      )}
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-bold text-lg">{item.name}</h3>
          <Badge className={rarityColors[item.rarity as keyof typeof rarityColors]}>
            {item.rarity}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
        <div className="flex items-center gap-1 text-yellow-600 font-semibold">
          <Coins className="w-4 h-4" />
          <span>{item.price}</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        {owned ? (
          <Button disabled className="w-full" variant="secondary">
            <Check className="w-4 h-4 mr-2" />
            Owned
          </Button>
        ) : !canAfford ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button disabled className="w-full" variant="outline">
                  <Lock className="w-4 h-4 mr-2" />
                  Insufficient Funds
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>You need {item.price - (userCoins || 0)} more coins</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <Button 
            onClick={() => onPurchase(item.id)} 
            disabled={isDisabled}
            className="w-full"
          >
            Purchase
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
