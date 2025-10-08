import { Upload, FileText, AlertCircle } from 'lucide-react';
import { Button } from '../button';
import { PdfUploadItem } from './PdfUploadItem';
import { usePdfUpload } from './usePdfUpload';
import { cn } from '../../../common/lib/utils';

export function PdfUpload() {
  const {
    files,
    isUploading,
    isGeneratingUrls,
    dragActive,
    error,
    hasFiles,
    hasPendingFiles,
    hasUploadingFiles,
    hasErrorFiles,
    hasSuccessFiles,
    removeFile,
    clearFiles,
    uploadFiles,
    handleDrag,
    handleDrop,
    handleFileInput,
  } = usePdfUpload();

  const handleUpload = () => {
    if (hasPendingFiles) {
      uploadFiles();
    }
  };

  const handleClear = () => {
    clearFiles();
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-8 text-center transition-colors",
          dragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50",
          error && "border-red-500 bg-red-50"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept=".pdf,application/pdf"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading || isGeneratingUrls}
        />
        
        <div className="flex flex-col items-center space-y-2">
          <div className={cn(
            "p-3 rounded-full",
            dragActive ? "bg-primary/10" : "bg-muted/50"
          )}>
            <Upload className={cn(
              "h-6 w-6",
              dragActive ? "text-primary" : "text-muted-foreground"
            )} />
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium">
              {dragActive ? "Drop PDF files here" : "Click to upload or drag and drop"}
            </p>
            <p className="text-xs text-muted-foreground">
              PDF files only, up to 10MB each, maximum 200 files
            </p>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* File List */}
      {hasFiles && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">
              Files ({files.length})
            </h4>
            <div className="flex items-center space-x-2">
              {hasSuccessFiles && (
                <span className="text-xs text-green-600">
                  {files.filter(f => f.status === 'success').length} uploaded
                </span>
              )}
              {hasErrorFiles && (
                <span className="text-xs text-red-600">
                  {files.filter(f => f.status === 'error').length} failed
                </span>
              )}
              {hasUploadingFiles && (
                <span className="text-xs text-blue-600">
                  {files.filter(f => f.status === 'uploading').length} uploading
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {files.map((file) => (
              <PdfUploadItem
                key={file.id}
                file={file}
                onRemove={removeFile}
              />
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {hasFiles && (
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              disabled={isUploading || isGeneratingUrls}
            >
              Clear All
            </Button>
            {hasErrorFiles && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Remove only error files
                  files.forEach(file => {
                    if (file.status === 'error') {
                      removeFile(file.id);
                    }
                  });
                }}
                disabled={isUploading || isGeneratingUrls}
              >
                Clear Errors
              </Button>
            )}
          </div>

          <Button
            onClick={handleUpload}
            disabled={!hasPendingFiles || isUploading || isGeneratingUrls}
            className="min-w-24"
          >
            {isUploading || isGeneratingUrls ? (
              <>
                <FileText className="h-4 w-4 mr-2 animate-pulse" />
                {isGeneratingUrls ? 'Preparing...' : 'Uploading...'}
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload {files.filter(f => f.status === 'pending').length} Files
              </>
            )}
          </Button>
        </div>
      )}

      {/* Upload Summary */}
      {hasFiles && !hasPendingFiles && !hasUploadingFiles && (
        <div className="p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Upload complete: {hasSuccessFiles ? files.filter(f => f.status === 'success').length : 0} successful
              {hasErrorFiles && `, ${files.filter(f => f.status === 'error').length} failed`}
            </span>
            {hasSuccessFiles && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
              >
                Start New Upload
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
