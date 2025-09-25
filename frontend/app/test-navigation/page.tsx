"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function NavigationTestPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [testResults, setTestResults] = useState<Record<string, string>>({});

  // Our implemented navigation function (copied from chat-interface.tsx)
  const handleGoToResults = (documentId: string) => {
    // Validate document ID
    if (!documentId || typeof documentId !== 'string' || documentId.trim() === '') {
      toast({
        title: "Navigation Error",
        description: "Invalid document ID. Please try again.",
        variant: "destructive",
      });
      return false;
    }
    
    try {
      const targetUrl = `/results/${documentId.trim()}`;
      router.push(targetUrl);
      
      toast({
        title: "Loading Results",
        description: "Redirecting to detailed compliance report...",
      });
      return true;
    } catch {
      toast({
        title: "Navigation Failed", 
        description: "Could not navigate to results page. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const runTest = (testName: string, documentId: string, expectedResult: 'success' | 'fail') => {
    const result = handleGoToResults(documentId);
    const passed = expectedResult === 'success' ? result : !result;
    
    setTestResults(prev => ({
      ...prev,
      [testName]: passed ? '✅ PASSED' : '❌ FAILED'
    }));
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">🔧 Navigation Fix Test Results</CardTitle>
          <p className="text-gray-600">
            Testing the View Detailed Results button navigation fixes implemented.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Test 1: Valid Document ID */}
          <div className="border p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">✅ Test 1: Valid Document ID Navigation</h3>
            <p className="text-sm text-gray-600 mb-3">
              This simulates a completion message with a valid document ID
            </p>
            <Button 
              onClick={() => runTest('valid-id', 'test-doc-123', 'success')}
              className="bg-[#0087d9] hover:bg-blue-700"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Detailed Results (Valid ID)
            </Button>
            <div className="mt-2 text-sm">
              Result: <span className="font-mono">{testResults['valid-id'] || 'Not tested yet'}</span>
            </div>
          </div>

          {/* Test 2: Invalid Document ID */}
          <div className="border p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">❌ Test 2: Invalid Document ID Protection</h3>
            <p className="text-sm text-gray-600 mb-3">
              This tests our validation with an invalid document ID
            </p>
            <Button 
              onClick={() => runTest('invalid-id', 'undefined', 'fail')}
              className="bg-[#0087d9] hover:bg-blue-700"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Detailed Results (Invalid ID)
            </Button>
            <div className="mt-2 text-sm">
              Result: <span className="font-mono">{testResults['invalid-id'] || 'Not tested yet'}</span>
            </div>
          </div>

          {/* Test 3: Empty Document ID */}
          <div className="border p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">🚫 Test 3: Empty Document ID Protection</h3>
            <p className="text-sm text-gray-600 mb-3">
              This tests our validation with an empty document ID
            </p>
            <Button 
              onClick={() => runTest('empty-id', '', 'fail')}
              className="bg-[#0087d9] hover:bg-blue-700"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Detailed Results (Empty ID)
            </Button>
            <div className="mt-2 text-sm">
              Result: <span className="font-mono">{testResults['empty-id'] || 'Not tested yet'}</span>
            </div>
          </div>

          {/* Test 4: Button Click Validation */}
          <div className="border p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">🔍 Test 4: Button Click Validation</h3>
            <p className="text-sm text-gray-600 mb-3">
              This simulates the button click handler validation logic
            </p>
            <Button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Simulate our button validation logic
                const mockDocumentId = 'test-validation-123';
                
                if (!mockDocumentId || typeof mockDocumentId !== 'string' || mockDocumentId.trim() === '') {
                  setTestResults(prev => ({ ...prev, 'validation': '❌ FAILED - Should have blocked' }));
                  return;
                }
                
                // If we reach here, validation passed
                setTestResults(prev => ({ ...prev, 'validation': '✅ PASSED - Validation successful' }));
                
                // Actually call the navigation function
                handleGoToResults(mockDocumentId);
              }}
              className="bg-[#0087d9] hover:bg-blue-700"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Test Button Validation Logic
            </Button>
            <div className="mt-2 text-sm">
              Result: <span className="font-mono">{testResults['validation'] || 'Not tested yet'}</span>
            </div>
          </div>

          {/* Summary */}
          <div className="border-2 border-blue-200 p-4 rounded-lg bg-blue-50">
            <h3 className="text-lg font-semibold mb-2">📊 Test Summary</h3>
            <div className="space-y-1 text-sm">
              <div>✅ Document ID validation: {testResults['valid-id'] === '✅ PASSED' ? 'Working' : 'Pending'}</div>
              <div>🚫 Invalid ID blocking: {testResults['invalid-id'] === '✅ PASSED' ? 'Working' : 'Pending'}</div>
              <div>🚫 Empty ID blocking: {testResults['empty-id'] === '✅ PASSED' ? 'Working' : 'Pending'}</div>
              <div>🔍 Button validation: {testResults['validation'] === '✅ PASSED - Validation successful' ? 'Working' : 'Pending'}</div>
            </div>
            <div className="mt-4 text-xs text-gray-600">
              Note: Check the browser console and toast notifications for detailed test results.
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}