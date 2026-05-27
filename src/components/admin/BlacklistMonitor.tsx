import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, ExternalLink, CheckCircle, XCircle } from 'lucide-react';

export default function BlacklistMonitor() {
  const [checking, setChecking] = useState(false);
  const [blacklists] = useState([
    { name: 'Spamhaus ZEN', isListed: false, severity: 'high', url: 'https://www.spamhaus.org' },
    { name: 'Barracuda', isListed: false, severity: 'medium', url: 'https://barracudacentral.org' },
    { name: 'SORBS', isListed: false, severity: 'medium', url: 'http://www.sorbs.net' },
    { name: 'SpamCop', isListed: false, severity: 'high', url: 'https://www.spamcop.net' },
    { name: 'URIBL', isListed: false, severity: 'low', url: 'https://admin.uribl.com' },
    { name: 'SURBL', isListed: false, severity: 'low', url: 'http://www.surbl.org' }
  ]);

  const handleCheck = async () => {
    setChecking(true);
    setTimeout(() => setChecking(false), 2000);
  };

  const listedCount = blacklists.filter(b => b.isListed).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Blacklist Status</CardTitle>
            <Button onClick={handleCheck} disabled={checking} size="sm">
              <RefreshCw className={`w-4 h-4 mr-2 ${checking ? 'animate-spin' : ''}`} />
              Check Now
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="text-6xl font-bold text-green-600 mb-2">
                {listedCount}/{blacklists.length}
              </div>
              <div className="text-muted-foreground">Blacklists</div>
              <Badge variant={listedCount === 0 ? 'default' : 'destructive'} className="mt-4">
                {listedCount === 0 ? 'All Clear' : 'Action Required'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monitored Blacklists</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {blacklists.map((blacklist, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {blacklist.isListed ? (
                    <XCircle className="w-5 h-5 text-red-600" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
                  <div>
                    <div className="font-medium">{blacklist.name}</div>
                    <div className="text-xs text-muted-foreground">
                      Severity: {blacklist.severity}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={blacklist.isListed ? 'destructive' : 'secondary'}>
                    {blacklist.isListed ? 'Listed' : 'Clear'}
                  </Badge>
                  <Button variant="ghost" size="sm" asChild>
                    <a href={blacklist.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}