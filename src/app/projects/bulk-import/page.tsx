"use client";

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  ArrowDownTrayIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  TrashIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function BulkImportPage() {
  const [jsonData, setJsonData] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonData(e.target.value);
    setError(null);
  };

  const handleClear = () => {
    setJsonData('');
    setResults(null);
    setError(null);
  };

  const validateJson = (data: string): any[] | null => {
    try {
      const parsed = JSON.parse(data);

      if (!Array.isArray(parsed)) {
        throw new Error('Data must be an array of projects');
      }

      if (parsed.length === 0) {
        throw new Error('No projects found in the data');
      }

      // Basic validation of required fields
      parsed.forEach((project, index) => {
        if (!project.projectTitle) {
          throw new Error(`Project at index ${index} is missing a title`);
        }
      });

      return parsed;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON format');
      return null;
    }
  };

  const handleImport = async () => {
    if (!jsonData.trim()) {
      setError('Please enter JSON data');
      return;
    }

    const projects = validateJson(jsonData);
    if (!projects) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/projects/bulk-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projects }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to import projects');
      }

      setResults(result);

      if (result.imported > 0) {
        toast.success(`Successfully imported ${result.imported} projects`);
      }

      if (result.failed > 0) {
        toast.error(`Failed to import ${result.failed} projects`);
      }
    } catch (err) {
      console.error('Import error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during import');
      toast.error('Import failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSampleData = () => {
    const sampleData = [
      {
        "projectTitle": "Airport Terminal Upgrade",
        "opdFocal": "John Doe",
        "capexOpex": "CAPEX",
        "status": "Possible",
        "subStatus": "Initial Review",
        "percentage": 10,
        "budget": 100000,
        "pr": "PR-2024-001",
        "duration": 12,
        "startDate": "2024-01-15",
        "completionDate": "2024-12-15",
        "pmoNumber": "PMO-2024-001",
        "department": "IT",
        "area": "Departures",
        "year": 2024,
        "note": "Initial assessment phase for terminal modernization project"
      },
      {
        "projectTitle": "Security System Enhancement",
        "opdFocal": "Jane Smith",
        "capexOpex": "CAPEX",
        "status": "Scoping",
        "subStatus": "Requirements Gathering",
        "percentage": 25,
        "budget": 250000,
        "pr": "PR-2024-002",
        "duration": 8,
        "startDate": "2024-02-01",
        "completionDate": "2024-09-30",
        "pmoNumber": "PMO-2024-002",
        "department": "Operations",
        "area": "Terminal",
        "year": 2024,
        "note": "Upgrading security infrastructure to meet new compliance standards"
      }
    ];

    setJsonData(JSON.stringify(sampleData, null, 2));
    setError(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Bulk Import Projects
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Import multiple projects at once by providing JSON data with all required fields.
        </p>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Required Fields Format:</h3>
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Project title, OPD Focal, CAPEX/OPEX, Status, Sub-Status, Completion %, Budget, PR, Duration, Start date, Project Completion date, PMO No., Department, Area, Year, Note
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="card p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">JSON Data</h2>
              <div className="flex space-x-2">
                <button
                  onClick={handleSampleData}
                  className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                >
                  Load Sample
                </button>
                <button
                  onClick={handleClear}
                  className="text-xs px-2 py-1 bg-slate-100 text-slate-700 rounded hover:bg-slate-200 transition-colors"
                  disabled={!jsonData}
                >
                  Clear
                </button>
              </div>
            </div>

            <textarea
              className="w-full h-96 p-4 border border-slate-300 dark:border-slate-700 rounded-lg
                         dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         font-mono text-sm"
              value={jsonData}
              onChange={handleTextareaChange}
              placeholder="Paste your JSON array of projects here..."
            />

            {error && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
                <div className="flex items-start">
                  <ExclamationCircleIcon className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              </div>
            )}

            <div className="mt-4">
              <button
                onClick={handleImport}
                disabled={isLoading || !jsonData}
                className={`px-4 py-3 bg-blue-600 text-white rounded-lg
                           hover:bg-blue-700 transition-colors flex items-center
                           ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                  <>
                    <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                    Import Projects
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">Import Results</h2>

            {!results ? (
              <div className="text-center py-8 text-slate-500">
                <DocumentTextIcon className="h-12 w-12 mx-auto mb-3 text-slate-400" />
                <p>Import results will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div>
                    <p className="font-medium">Total Processed</p>
                    <p className="text-2xl font-bold">
                      {results.imported + results.failed}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center mb-1">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mr-1" />
                      <p className="font-medium text-green-700 dark:text-green-400">Success</p>
                    </div>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                      {results.imported}
                    </p>
                  </div>

                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="flex items-center mb-1">
                      <XCircleIcon className="h-5 w-5 text-red-500 mr-1" />
                      <p className="font-medium text-red-700 dark:text-red-400">Failed</p>
                    </div>
                    <p className="text-2xl font-bold text-red-700 dark:text-red-400">
                      {results.failed}
                    </p>
                  </div>
                </div>

                {results.imported > 0 && (
                  <div>
                    <h3 className="font-medium mb-2 text-sm">Successfully Imported:</h3>
                    <div className="max-h-64 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg">
                      <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                        {results.results.map((result: any, i: number) => (
                          <li key={result.id} className="p-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800">
                            <div className="flex justify-between">
                              <span>{result.projectTitle}</span>
                              <span className="text-green-500">✓</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {results.failed > 0 && results.errors && (
                  <div>
                    <h3 className="font-medium mb-2 text-sm">Errors:</h3>
                    <div className="max-h-64 overflow-y-auto border border-red-200 dark:border-red-700 rounded-lg">
                      <ul className="divide-y divide-red-200 dark:divide-red-700">
                        {results.errors.map((error: any, i: number) => (
                          <li key={i} className="p-2 text-sm bg-red-50 dark:bg-red-900/20">
                            <div className="text-red-700 dark:text-red-400">
                              <span>Index {error.index}: {error.error}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                <div className="pt-4 flex justify-between">
                  <Link
                    href="/"
                    className="px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Go to Dashboard
                  </Link>
                  <button
                    onClick={handleClear}
                    className="px-4 py-2 flex items-center text-slate-600 hover:text-slate-800 transition-colors"
                  >
                    <TrashIcon className="h-4 w-4 mr-1" />
                    Clear Results
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="card p-6 mt-6">
            <h2 className="text-lg font-semibold mb-4">Instructions</h2>
            <div className="space-y-3 text-sm">
              <p>
                1. Prepare a JSON array containing project objects with the following fields:
              </p>
              <div className="ml-4 space-y-1 text-xs">
                <p>• <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">projectTitle</code> - Project title (required)</p>
                <p>• <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">opdFocal</code> - OPD Focal person</p>
                <p>• <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">capexOpex</code> - CAPEX/OPEX type</p>
                <p>• <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">status</code> - Project status</p>
                <p>• <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">subStatus</code> - Sub-status</p>
                <p>• <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">percentage</code> - Completion percentage</p>
                <p>• <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">budget</code> - Project budget</p>
                <p>• <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">pr</code> - PR number</p>
                <p>• <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">duration</code> - Duration in months</p>
                <p>• <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">startDate</code> - Start date (YYYY-MM-DD)</p>
                <p>• <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">completionDate</code> - Completion date (YYYY-MM-DD)</p>
                <p>• <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">pmoNumber</code> - PMO number</p>
                <p>• <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">department</code> - Department</p>
                <p>• <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">area</code> - Area</p>
                <p>• <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">year</code> - Project year</p>
                <p>• <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">note</code> - Additional notes</p>
              </div>
              <p>
                2. Click the &quot;Load Sample&quot; button to see the expected format.
              </p>
              <p>
                3. Click &quot;Import Projects&quot; to start the import process.
              </p>
              <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <strong>CSV to JSON Conversion:</strong> If you have data in CSV format, you can use online tools like
                  <a href="https://csvjson.com/csv2json" target="_blank" rel="noopener noreferrer" className="underline ml-1">csvjson.com</a>
                  to convert your CSV to JSON format before importing.
                </p>
              </div>
              <p className="italic text-slate-500 text-xs mt-2">
                Note: This bulk import feature is temporary and may be replaced in the production version.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}