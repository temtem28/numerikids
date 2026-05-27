import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Check, Share2, Download } from 'lucide-react';
import { toast } from 'sonner';
import { SocialShareButtons } from './SocialShareButtons';

interface ReferralCodeCardProps {
  code: string;
  link: string;
  clicks: number;
  conversions: number;
  totalShares?: number;
}

export function ReferralCodeCard({ code, link, clicks, conversions, totalShares = 0 }: ReferralCodeCardProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadReferralImage = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, 1200, 630);
      gradient.addColorStop(0, '#667eea');
      gradient.addColorStop(1, '#764ba2');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1200, 630);
      
      // Text
      ctx.fillStyle = 'white';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Join Me on PixelWizard!', 600, 200);
      
      ctx.font = '32px Arial';
      ctx.fillText('Use my referral code:', 600, 300);
      
      ctx.font = 'bold 72px monospace';
      ctx.fillText(code, 600, 400);
      
      ctx.font = '24px Arial';
      ctx.fillText(link, 600, 500);
      
      // Download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `referral-${code}.png`;
          a.click();
          URL.revokeObjectURL(url);
          toast.success('Image downloaded!');
        }
      });
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Your Referral Code</h3>
      
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input value={code} readOnly className="font-mono text-lg" />
          <Button onClick={() => copyToClipboard(code)} variant="outline">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>

        <div className="flex gap-2">
          <Input value={link} readOnly className="text-sm" />
          <Button onClick={() => copyToClipboard(link)} variant="outline">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Share on Social Media</p>
          <SocialShareButtons referralCode={code} referralLink={link} />
        </div>

        <Button onClick={downloadReferralImage} variant="outline" className="w-full gap-2">
          <Download className="h-4 w-4" />
          Download Referral Image
        </Button>

        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div>
            <p className="text-sm text-muted-foreground">Clicks</p>
            <p className="text-2xl font-bold">{clicks}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Conversions</p>
            <p className="text-2xl font-bold text-green-600">{conversions}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Shares</p>
            <p className="text-2xl font-bold text-blue-600">{totalShares}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
