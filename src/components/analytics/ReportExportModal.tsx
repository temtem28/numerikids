import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download, FileText, FileSpreadsheet } from 'lucide-react';
import { format as formatDate } from 'date-fns';
import { generateCSVReport } from '@/utils/reportExport';
import { useToast } from '@/hooks/use-toast';

interface ReportExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: Array<{ id: string; name: string }>;
}

export function ReportExportModal({ open, onOpenChange, children }: ReportExportModalProps) {
  const { toast } = useToast();
  const [selectedChildren, setSelectedChildren] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeAchievements, setIncludeAchievements] = useState(true);
  const [includeInsights, setIncludeInsights] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!startDate || !endDate) {
      toast({ title: 'Erreur', description: 'Veuillez sélectionner une période', variant: 'destructive' });
      return;
    }
    if (selectedChildren.length === 0) {
      toast({ title: 'Erreur', description: 'Veuillez sélectionner au moins un enfant', variant: 'destructive' });
      return;
    }

    setIsExporting(true);
    try {
      await generateCSVReport({
        childIds: selectedChildren,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        format: exportFormat,
        includeCharts,
        includeAchievements,
        includeInsights
      });
      toast({ title: 'Succès', description: 'Rapport exporté avec succès' });
      onOpenChange(false);
    } catch (error) {
      toast({ title: 'Erreur', description: 'Échec de l\'export du rapport', variant: 'destructive' });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Exporter un rapport d'activité</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <Label>Enfants</Label>
            <div className="space-y-2 mt-2">
              {children.map(child => (
                <div key={child.id} className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedChildren.includes(child.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedChildren([...selectedChildren, child.id]);
                      } else {
                        setSelectedChildren(selectedChildren.filter(id => id !== child.id));
                      }
                    }}
                  />
                  <Label>{child.name}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Date de début</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? formatDate(startDate, 'PPP') : 'Sélectionner'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent><Calendar mode="single" selected={startDate} onSelect={setStartDate} /></PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>Date de fin</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? formatDate(endDate, 'PPP') : 'Sélectionner'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent><Calendar mode="single" selected={endDate} onSelect={setEndDate} /></PopoverContent>
              </Popover>
            </div>
          </div>

          <div>
            <Label>Format</Label>
            <Select value={exportFormat} onValueChange={(v: any) => setExportFormat(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv"><FileSpreadsheet className="inline mr-2 h-4 w-4" />CSV</SelectItem>
                <SelectItem value="pdf"><FileText className="inline mr-2 h-4 w-4" />PDF</SelectItem>
              </SelectContent>
            </Select>
          </div>


          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox checked={includeCharts} onCheckedChange={(c: any) => setIncludeCharts(c)} />
              <Label>Inclure les graphiques</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox checked={includeAchievements} onCheckedChange={(c: any) => setIncludeAchievements(c)} />
              <Label>Inclure les succès</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox checked={includeInsights} onCheckedChange={(c: any) => setIncludeInsights(c)} />
              <Label>Inclure les analyses</Label>
            </div>
          </div>

          <Button onClick={handleExport} disabled={isExporting} className="w-full">
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? 'Export en cours...' : 'Exporter le rapport'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
