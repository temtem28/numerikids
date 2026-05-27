import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Star, Sparkles, Loader2 } from 'lucide-react';

export default function ShowcasePage() {
  const [equippedItems, setEquippedItems] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [userStats, setUserStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadShowcaseData();
  }, []);

  const loadShowcaseData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [equippedRes, achievementsRes, statsRes] = await Promise.all([
      supabase.from('user_inventory').select('*, store_items(*)').eq('user_id', user.id).eq('is_equipped', true),
      supabase.from('user_achievements').select('*, achievements(*)').eq('user_id', user.id).order('unlocked_at', { ascending: false }).limit(6),
      supabase.from('user_progress').select('*').eq('user_id', user.id).single()
    ]);

    if (equippedRes.data) setEquippedItems(equippedRes.data);
    if (achievementsRes.data) setAchievements(achievementsRes.data);
    if (statsRes.data) setUserStats(statsRes.data);
    setLoading(false);
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  const equippedAvatar = equippedItems.find(i => i.store_items?.category === 'avatar');
  const equippedBadges = equippedItems.filter(i => i.store_items?.category === 'badge');

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-3 mb-8">
        <Sparkles className="w-8 h-8 text-yellow-500" />
        <h1 className="text-4xl font-bold">My Showcase</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <Avatar className="w-32 h-32 mb-4">
              {equippedAvatar?.store_items?.image_url ? (
                <AvatarImage src={equippedAvatar.store_items.image_url} />
              ) : (
                <AvatarFallback className="text-4xl">
                  {userStats?.username?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              )}
            </Avatar>
            <h2 className="text-2xl font-bold mb-2">{userStats?.username || 'Student'}</h2>
            <div className="flex gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600">Lvl {userStats?.level || 1}</div>
                <div className="text-sm text-muted-foreground">Level</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-yellow-600">{userStats?.total_xp || 0}</div>
                <div className="text-sm text-muted-foreground">Total XP</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              Equipped Badges
            </CardTitle>
          </CardHeader>
          <CardContent>
            {equippedBadges.length === 0 ? (
              <p className="text-muted-foreground">No badges equipped yet</p>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {equippedBadges.map(item => (
                  <div key={item.id} className="text-center">
                    {item.store_items?.image_url && (
                      <img src={item.store_items.image_url} alt={item.store_items.name} className="w-20 h-20 mx-auto mb-2" />
                    )}
                    <p className="text-xs font-medium">{item.store_items?.name}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Recent Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          {achievements.length === 0 ? (
            <p className="text-muted-foreground">No achievements unlocked yet</p>
          ) : (
            <div className="grid md:grid-cols-3 gap-4">
              {achievements.map(ach => (
                <Card key={ach.id} className="bg-gradient-to-br from-yellow-50 to-orange-50">
                  <CardContent className="p-4 text-center">
                    <div className="text-4xl mb-2">{ach.achievements?.icon}</div>
                    <h3 className="font-bold mb-1">{ach.achievements?.name}</h3>
                    <p className="text-xs text-muted-foreground mb-2">{ach.achievements?.description}</p>
                    <Badge className={
                      ach.achievements?.rarity === 'legendary' ? 'bg-yellow-500' :
                      ach.achievements?.rarity === 'epic' ? 'bg-purple-500' :
                      ach.achievements?.rarity === 'rare' ? 'bg-blue-500' : 'bg-gray-500'
                    }>
                      {ach.achievements?.rarity}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
