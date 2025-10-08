import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/card';
import { PdfUpload } from '../components/pdf-upload';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="space-y-6">
      {/* PDF Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload PDF Files</CardTitle>
          <CardDescription>
            Upload one or multiple PDF files to S3. Maximum 200 files, 10MB each.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PdfUpload />
        </CardContent>
      </Card>

      {/* Main Dashboard Content */}
      {children}
    </div>
  );
}
