import { Facebook, Twitter, Linkedin, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface SocialShareButtonsProps {
  referralCode: string;
  referralLink: string;
}

export function SocialShareButtons({ referralCode, referralLink }: SocialShareButtonsProps) {
  const shareMessage = `Join me on this amazing learning platform! Use my referral code ${referralCode} to get started. ${referralLink}`;

  const trackShare = async (platform: string) => {
    try {
      await supabase.functions.invoke('referral-manager', {
        body: { action: 'track_share', referralCode, platform }
      });
    } catch (error) {
      console.error('Error tracking share:', error);
    }
  };

  const shareOnFacebook = () => {
    trackShare('facebook');
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}&quote=${encodeURIComponent(shareMessage)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareOnTwitter = () => {
    trackShare('twitter');
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareOnLinkedIn = () => {
    trackShare('linkedin');
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareOnWhatsApp = () => {
    trackShare('whatsapp');
    const url = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="flex gap-2 flex-wrap">
      <Button onClick={shareOnFacebook} variant="outline" size="sm" className="gap-2">
        <Facebook className="h-4 w-4" />
        Facebook
      </Button>
      <Button onClick={shareOnTwitter} variant="outline" size="sm" className="gap-2">
        <Twitter className="h-4 w-4" />
        Twitter
      </Button>
      <Button onClick={shareOnLinkedIn} variant="outline" size="sm" className="gap-2">
        <Linkedin className="h-4 w-4" />
        LinkedIn
      </Button>
      <Button onClick={shareOnWhatsApp} variant="outline" size="sm" className="gap-2">
        <MessageCircle className="h-4 w-4" />
        WhatsApp
      </Button>
    </div>
  );
}