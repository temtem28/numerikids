import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, Upload, AlertCircle, CheckCircle } from 'lucide-react';

interface CSVImportModalProps {
  open: boolean;
  onClose: () => void;
  onImport: (children: Array<{ pseudo: string; birth_year: number }>) => Promise<void>;
}

interface ParsedChild {
  pseudo: string;
  birth_year: number;
  valid: boolean;
  error?: string;
}

export default function CSVImportModal({ open, onClose, onImport }: CSVImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedChild[]>([]);
  const [importing, setImporting] = useState(false);

  const downloadTemplate = () => {
    const csv = 'pseudo,birth_year\nAlice,2015\nBob,2018';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'children_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseCSV(selectedFile);
    }
  };

  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      const data: ParsedChild[] = [];

      for (let i = 1; i < lines.length; i++) {
        const [pseudo, birthYear] = lines[i].split(',').map(s => s.trim());
        const year = parseInt(birthYear);
        const currentYear = new Date().getFullYear();
        
        let valid = true;
        let error = '';

        if (!pseudo || pseudo.length < 2) {
          valid = false;
          error = 'Pseudo must be at least 2 characters';
        } else if (!year || year < 2000 || year > currentYear) {
          valid = false;
          error = `Birth year must be between 2000 and ${currentYear}`;
        }

        data.push({ pseudo, birth_year: year, valid, error });
      }

      setParsedData(data);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    const validChildren = parsedData.filter(c => c.valid);
    if (validChildren.length === 0) return;

    setImporting(true);
    try {
      await onImport(validChildren);
      onClose();
      setFile(null);
      setParsedData([]);
    } catch (error) {
      console.error('Import failed:', error);
    } finally {
      setImporting(false);
    }
  };

  const validCount = parsedData.filter(c => c.valid).length;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Children from CSV</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={downloadTemplate} variant="outline" className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Download Template
            </Button>
            <label className="flex-1">
              <Button variant="outline" className="w-full" asChild>
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload CSV
                </span>
              </Button>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          {file && <p className="text-sm text-gray-600">File: {file.name}</p>}

          {parsedData.length > 0 && (
            <>
              <Alert>
                <AlertDescription>
                  Found {parsedData.length} entries: {validCount} valid, {parsedData.length - validCount} invalid
                </AlertDescription>
              </Alert>

              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Pseudo</th>
                      <th className="px-4 py-2 text-left">Birth Year</th>
                      <th className="px-4 py-2 text-left">Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.map((child, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="px-4 py-2">
                          {child.valid ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-500" />
                          )}
                        </td>
                        <td className="px-4 py-2">{child.pseudo}</td>
                        <td className="px-4 py-2">{child.birth_year}</td>
                        <td className="px-4 py-2 text-red-500 text-xs">{child.error}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Button
                onClick={handleImport}
                disabled={validCount === 0 || importing}
                className="w-full"
              >
                {importing ? 'Importing...' : `Import ${validCount} Children`}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
