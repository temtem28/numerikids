import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertTriangle, Trash2, Shield, Clock } from 'lucide-react';

export default function AccountDeletion() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [gracePeriodDays, setGracePeriodDays] = useState('7');
  const [reason, setReason] = useState('');
  const [confirmations, setConfirmations] = useState({
    understand: false,
    dataLoss: false,
    noRefund: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const allConfirmed = confirmations.understand && confirmations.dataLoss && confirmations.noRefund;

  const handleSubmit = async () => {
    if (!password) {
      setError('Password is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data, error: fnError } = await supabase.functions.invoke('account-deletion', {
        body: {
          action: 'request',
          password,
          twoFactorCode: twoFactorCode || undefined,
          gracePeriodDays: parseInt(gracePeriodDays),
          reason
        }
      });

      if (fnError) throw fnError;

      setSuccess(true);
      setTimeout(() => {
        supabase.auth.signOut();
        navigate('/');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to process deletion request');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-green-600">Deletion Scheduled</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                Your account deletion has been scheduled. Check your email for confirmation and cancellation instructions.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Delete Account
          </CardTitle>
          <CardDescription>Step {step} of 3</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  This action will permanently delete your account and all associated data.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="understand"
                    checked={confirmations.understand}
                    onCheckedChange={(checked) =>
                      setConfirmations({ ...confirmations, understand: !!checked })
                    }
                  />
                  <Label htmlFor="understand" className="text-sm">
                    I understand this action cannot be undone after the grace period
                  </Label>
                </div>

                <div className="flex items-start gap-2">
                  <Checkbox
                    id="dataLoss"
                    checked={confirmations.dataLoss}
                    onCheckedChange={(checked) =>
                      setConfirmations({ ...confirmations, dataLoss: !!checked })
                    }
                  />
                  <Label htmlFor="dataLoss" className="text-sm">
                    I understand all my data, progress, and purchases will be lost
                  </Label>
                </div>

                <div className="flex items-start gap-2">
                  <Checkbox
                    id="noRefund"
                    checked={confirmations.noRefund}
                    onCheckedChange={(checked) =>
                      setConfirmations({ ...confirmations, noRefund: !!checked })
                    }
                  />
                  <Label htmlFor="noRefund" className="text-sm">
                    I understand no refunds will be issued for active subscriptions
                  </Label>
                </div>
              </div>

              <Button
                onClick={() => setStep(2)}
                disabled={!allConfirmed}
                variant="destructive"
                className="w-full"
              >
                Continue
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <Label>Grace Period</Label>
                <Select value={gracePeriodDays} onValueChange={setGracePeriodDays}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="14">14 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 mt-1">
                  You can cancel the deletion during this period
                </p>
              </div>

              <div>
                <Label>Reason (Optional)</Label>
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Help us improve by sharing why you're leaving..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={() => setStep(1)} variant="outline" className="flex-1">
                  Back
                </Button>
                <Button onClick={() => setStep(3)} variant="destructive" className="flex-1">
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Verify your identity to proceed with account deletion
                </AlertDescription>
              </Alert>

              <div>
                <Label>Password</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />
              </div>

              <div>
                <Label>2FA Code (if enabled)</Label>
                <Input
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={() => setStep(2)} variant="outline" className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={loading || !password}
                  variant="destructive"
                  className="flex-1"
                >
                  {loading ? 'Processing...' : 'Delete Account'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
