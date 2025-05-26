'use client';

import { useState, useEffect } from 'react';
import {
  FunnelIcon,
  XMarkIcon,
  ChevronDownIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  UserIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

interface FilterOptions {
  departments: string[];
  statuses: string[];
  years: number[];
  opdFocals: string[];
}

interface FilterValues {
  departments: string[];
  statuses: string[];
  years: number[];
  opdFocals: string[];
  budgetRange: { min: number; max: number };
  percentageRange: { min: number; max: number };
  dateRange: { start: string; end: string };
  capexOpex: string[];
  searchTerm: string;
}

interface AdvancedFiltersProps {
  projects: any[];
  onFiltersChange: (filteredProjects: any[]) => void;
  onFilterValuesChange?: (filterValues: FilterValues) => void;
}

export default function AdvancedFilters({ projects, onFiltersChange, onFilterValuesChange }: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    departments: [],
    statuses: [],
    years: [],
    opdFocals: []
  });

  const [filters, setFilters] = useState<FilterValues>({
    departments: [],
    statuses: [],
    years: [],
    opdFocals: [],
    budgetRange: { min: 0, max: 1000000 },
    percentageRange: { min: 0, max: 100 },
    dateRange: { start: '', end: '' },
    capexOpex: [],
    searchTerm: ''
  });

  // Extract filter options from projects
  useEffect(() => {
    if (projects.length > 0) {
      const departments = [...new Set(projects.map(p => p.department).filter(Boolean))];
      const statuses = [...new Set(projects.map(p => p.status).filter(Boolean))];
      const years = [...new Set(projects.map(p => p.year).filter(Boolean))].sort((a, b) => b - a);
      const opdFocals = [...new Set(projects.map(p => p.opdFocal).filter(Boolean))];

      setFilterOptions({
        departments,
        statuses,
        years,
        opdFocals
      });

      // Set budget range based on actual data
      const budgets = projects.map(p => p.budget || 0).filter(b => b > 0);
      if (budgets.length > 0) {
        const maxBudget = Math.max(...budgets);
        setFilters(prev => ({
          ...prev,
          budgetRange: { min: 0, max: maxBudget }
        }));
      }
    }
  }, [projects]);

  // Apply filters
  useEffect(() => {
    let filtered = [...projects];

    // Department filter
    if (filters.departments.length > 0) {
      filtered = filtered.filter(p => filters.departments.includes(p.department));
    }

    // Status filter
    if (filters.statuses.length > 0) {
      filtered = filtered.filter(p => filters.statuses.includes(p.status));
    }

    // Year filter
    if (filters.years.length > 0) {
      filtered = filtered.filter(p => filters.years.includes(p.year));
    }

    // OPD Focal filter
    if (filters.opdFocals.length > 0) {
      filtered = filtered.filter(p => filters.opdFocals.includes(p.opdFocal));
    }

    // CAPEX/OPEX filter
    if (filters.capexOpex.length > 0) {
      filtered = filtered.filter(p => filters.capexOpex.includes(p.capexOpex));
    }

    // Budget range filter
    filtered = filtered.filter(p => {
      const budget = p.budget || 0;
      return budget >= filters.budgetRange.min && budget <= filters.budgetRange.max;
    });

    // Percentage range filter
    filtered = filtered.filter(p => {
      const percentage = p.percentage || 0;
      return percentage >= filters.percentageRange.min && percentage <= filters.percentageRange.max;
    });

    // Date range filter
    if (filters.dateRange.start && filters.dateRange.end) {
      filtered = filtered.filter(p => {
        if (!p.startDate) return false;
        const projectDate = new Date(p.startDate);
        const startDate = new Date(filters.dateRange.start);
        const endDate = new Date(filters.dateRange.end);
        return projectDate >= startDate && projectDate <= endDate;
      });
    }

    // Search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.projectTitle?.toLowerCase().includes(searchLower) ||
        p.department?.toLowerCase().includes(searchLower) ||
        p.opdFocal?.toLowerCase().includes(searchLower) ||
        p.pmoNumber?.toLowerCase().includes(searchLower) ||
        p.pr?.toLowerCase().includes(searchLower)
      );
    }

    onFiltersChange(filtered);
    if (onFilterValuesChange) {
      onFilterValuesChange(filters);
    }
  }, [filters, projects, onFiltersChange]);

  const handleMultiSelectChange = (field: keyof FilterValues, value: string | number) => {
    setFilters(prev => {
      if (field === 'years') {
        const currentValues = prev[field] as number[];
        const numValue = typeof value === 'string' ? parseInt(value) : value;
        const newValues = currentValues.includes(numValue)
          ? currentValues.filter(v => v !== numValue)
          : [...currentValues, numValue];

        return { ...prev, [field]: newValues };
      } else {
        const currentValues = prev[field] as string[];
        const strValue = typeof value === 'number' ? value.toString() : value;
        const newValues = currentValues.includes(strValue)
          ? currentValues.filter(v => v !== strValue)
          : [...currentValues, strValue];

        return { ...prev, [field]: newValues };
      }
    });
  };

  const clearAllFilters = () => {
    setFilters({
      departments: [],
      statuses: [],
      years: [],
      opdFocals: [],
      budgetRange: { min: 0, max: 1000000 },
      percentageRange: { min: 0, max: 100 },
      dateRange: { start: '', end: '' },
      capexOpex: [],
      searchTerm: ''
    });
  };

  const hasActiveFilters = () => {
    return filters.departments.length > 0 ||
           filters.statuses.length > 0 ||
           filters.years.length > 0 ||
           filters.opdFocals.length > 0 ||
           filters.capexOpex.length > 0 ||
           filters.searchTerm ||
           filters.dateRange.start ||
           filters.dateRange.end ||
           filters.budgetRange.min > 0 ||
           filters.budgetRange.max < 1000000 ||
           filters.percentageRange.min > 0 ||
           filters.percentageRange.max < 100;
  };

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm">
      {/* Filter Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <FunnelIcon className="h-5 w-5" />
          <span className="font-medium">Advanced Filters</span>
          <ChevronDownIcon className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {hasActiveFilters() && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
              {Object.values(filters).flat().filter(Boolean).length} filters active
            </span>
            <button
              onClick={clearAllFilters}
              className="text-sm text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Filter Content */}
      {isOpen && (
        <div className="p-4 space-y-6">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Search Projects
            </label>
            <input
              type="text"
              value={filters.searchTerm}
              onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
              placeholder="Search by title, department, focal, PMO number..."
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Department Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                <BuildingOfficeIcon className="h-4 w-4 inline mr-1" />
                Departments
              </label>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {filterOptions.departments.map(dept => (
                  <label key={dept} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.departments.includes(dept)}
                      onChange={() => handleMultiSelectChange('departments', dept)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">{dept}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Status
              </label>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {filterOptions.statuses.map(status => (
                  <label key={status} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.statuses.includes(status)}
                      onChange={() => handleMultiSelectChange('statuses', status)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">{status}</span>
                  </label>
                ))}
              </div>
            </div>



            {/* Year Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                <CalendarIcon className="h-4 w-4 inline mr-1" />
                Years
              </label>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {filterOptions.years.map(year => (
                  <label key={year} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.years.includes(year)}
                      onChange={() => handleMultiSelectChange('years', year)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">{year}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* OPD Focal Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                <UserIcon className="h-4 w-4 inline mr-1" />
                OPD Focal
              </label>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {filterOptions.opdFocals.map(focal => (
                  <label key={focal} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.opdFocals.includes(focal)}
                      onChange={() => handleMultiSelectChange('opdFocals', focal)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">{focal}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* CAPEX/OPEX Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Type
              </label>
              <div className="space-y-1">
                {['CAPEX', 'OPEX'].map(type => (
                  <label key={type} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.capexOpex.includes(type)}
                      onChange={() => handleMultiSelectChange('capexOpex', type)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">{type}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Range Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200 dark:border-slate-700">
            {/* Budget Range */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                <CurrencyDollarIcon className="h-4 w-4 inline mr-1" />
                Budget Range (OMR)
              </label>
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={filters.budgetRange.min}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      budgetRange: { ...prev.budgetRange, min: Number(e.target.value) }
                    }))}
                    placeholder="Min"
                    className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                  />
                  <input
                    type="number"
                    value={filters.budgetRange.max}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      budgetRange: { ...prev.budgetRange, max: Number(e.target.value) }
                    }))}
                    placeholder="Max"
                    className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Completion Percentage Range */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Completion Percentage
              </label>
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={filters.percentageRange.min}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      percentageRange: { ...prev.percentageRange, min: Number(e.target.value) }
                    }))}
                    placeholder="Min %"
                    className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={filters.percentageRange.max}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      percentageRange: { ...prev.percentageRange, max: Number(e.target.value) }
                    }))}
                    placeholder="Max %"
                    className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              <CalendarIcon className="h-4 w-4 inline mr-1" />
              Start Date Range
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">From</label>
                <input
                  type="date"
                  value={filters.dateRange.start}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, start: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">To</label>
                <input
                  type="date"
                  value={filters.dateRange.end}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, end: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
