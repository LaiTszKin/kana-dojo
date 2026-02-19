'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Expand, Minimize2, Copy, Check, Loader2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { ActionButton } from '@/shared/components/ui/ActionButton';
import type {
  ConjugationResult,
  ConjugationCategory as CategoryType,
  ConjugationForm,
} from '../types';
import { ALL_CONJUGATION_CATEGORIES } from '../types';
import VerbInfoCard from './VerbInfoCard';
import ConjugationCategory from './ConjugationCategory';

interface ConjugationResultsProps {
  /** Conjugation result to display */
  result: ConjugationResult | null;
  /** Whether conjugation is in progress */
  isLoading: boolean;
  /** Currently expanded categories */
  expandedCategories: CategoryType[];
  /** Callback to toggle a category */
  onToggleCategory: (category: CategoryType) => void;
  /** Callback to expand all categories */
  onExpandAll: () => void;
  /** Callback to collapse all categories */
  onCollapseAll: () => void;
  /** Callback to copy a single form */
  onCopyForm: (form: ConjugationForm) => void;
  /** Callback to copy all forms */
  onCopyAll: () => void;
}

/**
 * ConjugationResults - Displays all conjugated forms organized by category
 *
 * Features:
 * - VerbInfoCard showing verb type and stem
 * - All ConjugationCategory components
 * - Expand all / collapse all buttons
 * - Copy all button
 * - aria-live region for dynamic content updates
 *
 * Requirements: 5.2, 6.2, 10.2
 */
export default function ConjugationResults({
  result,
  isLoading,
  expandedCategories,
  onToggleCategory,
  onExpandAll,
  onCollapseAll,
  onCopyForm,
  onCopyAll,
}: ConjugationResultsProps) {
  const [copiedAll, setCopiedAll] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const previousResultRef = useRef<ConjugationResult | null>(null);

  // Group forms by category
  const formsByCategory = useMemo(() => {
    if (!result) return new Map<CategoryType, ConjugationForm[]>();

    const grouped = new Map<CategoryType, ConjugationForm[]>();
    for (const form of result.forms) {
      const existing = grouped.get(form.category) || [];
      existing.push(form);
      grouped.set(form.category, existing);
    }
    return grouped;
  }, [result]);

  // Get categories that have forms
  const categoriesWithForms = useMemo(() => {
    return ALL_CONJUGATION_CATEGORIES.filter(
      cat => (formsByCategory.get(cat)?.length ?? 0) > 0,
    );
  }, [formsByCategory]);

  // Check if all categories are expanded
  const allExpanded = useMemo(() => {
    return categoriesWithForms.every(cat => expandedCategories.includes(cat));
  }, [categoriesWithForms, expandedCategories]);

  // Update status message when result changes for screen readers
  useEffect(() => {
    if (result && result !== previousResultRef.current) {
      setStatusMessage(
        `Conjugation complete for ${result.verb.dictionaryForm}. ${result.forms.length} forms available across ${categoriesWithForms.length} categories.`,
      );
      previousResultRef.current = result;
    } else if (isLoading) {
      setStatusMessage('Conjugating verb, please wait...');
    }
  }, [result, isLoading, categoriesWithForms.length]);

  // Handle copy all with feedback
  const handleCopyAll = useCallback(() => {
    onCopyAll();
    setCopiedAll(true);
    setStatusMessage('All conjugation forms copied to clipboard.');
    setTimeout(() => setCopiedAll(false), 2000);
  }, [onCopyAll]);

  // Loading state
  if (isLoading) {
    return (
      <div
        className={cn(
          'flex min-h-[500px] flex-col items-center justify-center gap-10 rounded-[2.5rem] p-12 text-center',
          'border border-(--border-color)/20 bg-(--card-color)/30 shadow-xl shadow-black/5 backdrop-blur-xl',
        )}
      >
        <div className='relative flex h-32 w-32 items-center justify-center'>
          <div className='absolute inset-0 animate-ping rounded-full bg-(--main-color)/5' />
          <div className='absolute inset-4 animate-pulse rounded-full bg-(--main-color)/10' />
          <Loader2 className='h-12 w-12 animate-spin text-(--main-color) opacity-50' />
        </div>
        <div className='space-y-4'>
          <h3 className='text-3xl font-black tracking-tight text-(--main-color) sm:text-4xl'>
            Synthesizing Forms
          </h3>
          <p className='mx-auto max-w-sm text-lg leading-relaxed font-medium text-(--secondary-color) opacity-50'>
            We're applying high-precision linguistic algorithms to generate your
            conjugation matrix.
          </p>
        </div>
      </div>
    );
  }

  // No result state
  if (!result) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center rounded-[2.5rem] px-8 py-24 text-center',
          'border border-(--border-color)/20 bg-(--card-color)/20 shadow-xl shadow-black/5',
        )}
      >
        <div className='relative mb-10 flex h-28 w-28 items-center justify-center rounded-3xl bg-(--secondary-color)/5 shadow-inner'>
          <div className='absolute inset-0 animate-pulse rounded-3xl bg-(--secondary-color)/5' />
          <span className='relative z-10 text-6xl opacity-50 grayscale transition-all group-hover:opacity-100 group-hover:grayscale-0'>
            🏯
          </span>
        </div>
        <h3 className='text-3xl font-black tracking-tight text-(--main-color) sm:text-4xl'>
          Ready to Deconstruct
        </h3>
        <p className='mt-4 max-w-md text-lg leading-relaxed font-medium text-(--secondary-color) opacity-50'>
          Enter a Japanese verb to see its full conjugation potential analyzed
          through our high-precision engine.
        </p>
      </div>
    );
  }

  return (
    <div
      className='flex flex-col gap-12 sm:gap-20'
      role='region'
      aria-label='Conjugation results'
      aria-busy={isLoading}
    >
      {/* Screen reader status announcements */}
      <div
        className='sr-only'
        role='status'
        aria-live='polite'
        aria-atomic='true'
      >
        {statusMessage}
      </div>

      {/* Results Header and Actions */}
      <div className='flex flex-wrap items-end justify-between gap-8 px-2'>
        <div className='flex flex-col gap-2'>
          <h2 className='text-4xl font-black tracking-tight text-(--main-color) sm:text-6xl'>
            Conjugation{' '}
            <span className='font-serif text-(--secondary-color) italic'>
              Results
            </span>
          </h2>
          <div className='flex items-center gap-3'>
            <div className='h-[1px] w-8 bg-(--main-color)/20' />
            <p className='text-[10px] font-black tracking-[0.3em] text-(--secondary-color) uppercase opacity-50'>
              Linguistic Analysis: {result.verb.dictionaryForm}
            </p>
          </div>
        </div>
        <div className='flex items-center gap-4'>
          <ActionButton
            onClick={allExpanded ? onCollapseAll : onExpandAll}
            colorScheme='secondary'
            borderRadius='xl'
            borderBottomThickness={0}
            className='h-12 !w-auto border border-(--border-color)/50 px-6 text-[10px] font-black tracking-widest uppercase transition-all hover:bg-(--main-color)/5 active:scale-95'
            aria-label={
              allExpanded ? 'Collapse all categories' : 'Expand all categories'
            }
          >
            {allExpanded ? (
              <>
                <Minimize2 className='mr-2 h-4 w-4' />
                <span>Collapse All</span>
              </>
            ) : (
              <>
                <Expand className='mr-2 h-4 w-4' />
                <span>Expand All</span>
              </>
            )}
          </ActionButton>

          <ActionButton
            onClick={handleCopyAll}
            gradient
            borderRadius='xl'
            borderBottomThickness={0}
            className='h-12 !w-auto px-8 text-[10px] font-black tracking-widest uppercase shadow-(--main-color)/10 shadow-lg transition-all hover:scale-[1.02] active:scale-95'
            aria-label='Copy all conjugation forms'
          >
            {copiedAll ? (
              <>
                <Check className='mr-2 h-4 w-4' />
                <span>Copied Matrix</span>
              </>
            ) : (
              <>
                <Copy className='mr-2 h-4 w-4' />
                <span>Copy Matrix</span>
              </>
            )}
          </ActionButton>
        </div>
      </div>

      <div className='flex flex-col gap-12'>
        {/* Verb info card */}
        <VerbInfoCard verb={result.verb} />

        {/* Category cards grid */}
        <div
          className='grid grid-cols-1 gap-10 md:grid-cols-2 lg:gap-12'
          role='list'
          aria-label='Conjugation categories'
        >
          {categoriesWithForms.map(category => (
            <ConjugationCategory
              key={category}
              category={category}
              forms={formsByCategory.get(category) || []}
              isExpanded={expandedCategories.includes(category)}
              onToggle={() => onToggleCategory(category)}
              onCopy={onCopyForm}
            />
          ))}
        </div>
      </div>

      {/* Form count summary */}
      <div className='flex flex-col items-center gap-4 text-center'>
        <div className='h-[1px] w-24 bg-(--border-color)/50' />
        <div className='text-[10px] font-black tracking-widest text-(--secondary-color) uppercase opacity-40'>
          {result.forms.length} total forms synthesized across{' '}
          {categoriesWithForms.length} linguistic categories
        </div>
      </div>
    </div>
  );
}
