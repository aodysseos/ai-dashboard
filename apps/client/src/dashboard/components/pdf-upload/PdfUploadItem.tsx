import { FileText, X, Check, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../button';
import { Progress } from '../progress';
import { Badge } from '../badge';

interface PdfUploadItemProps {
  file: {
    id: string;
    file: File;
    status: 'pending' | 'uploading' | 'success' | 'error';
    progress: number;
    error?: string;
  };
  onRemove: (id: string) => void;
}

export function PdfUploadItem({ file, onRemove }: PdfUploadItemProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = () => {
    switch (file.status) {
      case 'pending':
        return <FileText className="h-4 w-4 text-muted-foreground" />;
      case 'uploading':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'success':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = () => {
    switch (file.status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'uploading':
        return <Badge variant="default">Uploading</Badge>;
      case 'success':
        return <Badge variant="default" className="bg-green-500">Success</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="flex items-center space-x-3 p-3 border rounded-lg bg-card">
      <div className="flex-shrink-0">
        {getStatusIcon()}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-foreground truncate">
            {file.file.name}
          </p>
          <div className="flex items-center space-x-2">
            {getStatusBadge()}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(file.id)}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-muted-foreground">
            {formatFileSize(file.file.size)}
          </p>
          {file.status === 'uploading' && (
            <p className="text-xs text-muted-foreground">
              {file.progress}%
            </p>
          )}
        </div>

        {file.status === 'uploading' && (
          <div className="mt-2">
            <Progress value={file.progress} className="h-2" />
          </div>
        )}

        {file.status === 'error' && file.error && (
          <p className="text-xs text-red-500 mt-1">
            {file.error}
          </p>
        )}
      </div>
    </div>
  );
}
