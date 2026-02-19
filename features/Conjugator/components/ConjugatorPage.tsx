'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Languages, Share2, Check } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

import useConjugatorStore from '../store/useConjugatorStore';
import ConjugatorInput from './ConjugatorInput';
import ConjugationResults from './ConjugationResults';
import ConjugationHistory from './ConjugationHistory';

interface ConjugatorPageProps {
  /** Current locale for i18n */
  locale?: string;
}

/**
 * ConjugatorPage - Main page component for the Japanese Verb Conjugator
 *
 * Features:
 * - Composes all conjugator components
 * - Responsive layout (mobile-first)
 * - ARIA labels and keyboard navigation
 * - URL parameter handling for shareable links
 * - URL state synchronization
 * - aria-live regions for dynamic content updates
 *
 * Requirements: 5.1, 5.4, 5.5, 5.6, 10.1, 10.2, 10.3, 12.1, 12.2, 12.3
 */
export default function ConjugatorPage({ locale = 'en' }: ConjugatorPageProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const initializedFromUrl = useRef(false);
  const [shareButtonState, setShareButtonState] = useState<
    'idle' | 'copied' | 'error'
  >('idle');

  const {
    inputText,
    result,
    isLoading,
    error,
    expandedCategories,
    history,
    setInputText,
    conjugate,
    toggleCategory,
    expandAllCategories,
    collapseAllCategories,
    copyForm,
    copyAllForms,
    deleteFromHistory,
    clearHistory,
    restoreFromHistory,
    initFromUrlParams,
  } = useConjugatorStore();

  // Handle URL parameters for shareable conjugations (Requirements: 12.2)
  useEffect(() => {
    if (initializedFromUrl.current) return;

    const verb = searchParams.get('verb') || searchParams.get('v');

    if (verb) {
      const hasParams = initFromUrlParams({ verb });
      if (hasParams) {
        initializedFromUrl.current = true;
      }
    }
  }, [searchParams, initFromUrlParams]);

  // Update URL when verb is conjugated (Requirements: 12.1)
  useEffect(() => {
    if (!result) return;

    const currentVerb = searchParams.get('verb') || searchParams.get('v');
    const newVerb = result.verb.dictionaryForm;

    // Only update URL if the verb has changed
    if (currentVerb !== newVerb) {
      const newUrl = `${pathname}?verb=${encodeURIComponent(newVerb)}`;
      router.replace(newUrl, { scroll: false });
    }
  }, [result, searchParams, pathname, router]);

  // Handle conjugate action
  const handleConjugate = useCallback(() => {
    if (inputText.trim().length > 0 && !isLoading) {
      conjugate();
    }
  }, [inputText, isLoading, conjugate]);

  // Handle share button click (Requirements: 12.3)
  const handleShare = useCallback(async () => {
    if (!result) return;

    const shareUrl = `${window.location.origin}${pathname}?verb=${encodeURIComponent(result.verb.dictionaryForm)}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareButtonState('copied');
      setTimeout(() => setShareButtonState('idle'), 2000);
    } catch {
      if (navigator.share) {
        try {
          await navigator.share({
            title: `${result.verb.dictionaryForm} Conjugation - KanaDojo`,
            text: `Check out the conjugation of ${result.verb.dictionaryForm} (${result.verb.romaji})`,
            url: shareUrl,
          });
        } catch {
          setShareButtonState('error');
          setTimeout(() => setShareButtonState('idle'), 2000);
        }
      } else {
        setShareButtonState('error');
        setTimeout(() => setShareButtonState('idle'), 2000);
      }
    }
  }, [result, pathname]);

  return (
    <div
      className='mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-8 sm:gap-16 sm:px-6'
      role='main'
      aria-label='Japanese verb conjugator'
    >
      {/* Header Section */}
      <header className='relative flex flex-col items-center gap-8'>
        <div className='flex flex-col items-center text-center'>
          <div
            className='mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-(--main-color)/5 ring-1 ring-(--main-color)/10'
            aria-hidden='true'
          >
            <Languages className='h-7 w-7 text-(--main-color)' />
          </div>
          <h1 className='relative text-4xl font-black tracking-tight text-(--main-color) sm:text-6xl lg:text-7xl'>
            <span className='hero-text-glow bg-gradient-to-br from-(--main-color) to-(--secondary-color) bg-clip-text text-transparent'>
              Japanese Verb
            </span>
            <span className='mt-2 block font-serif text-(--secondary-color) italic sm:mt-0 sm:ml-4 sm:inline'>
              Conjugator
            </span>
          </h1>
          <p className='mt-6 max-w-2xl text-lg leading-relaxed font-medium text-(--secondary-color) opacity-70 sm:text-xl'>
            A precision-engineered tool for mastering Japanese grammar.
            Experience the art of conjugation with absolute clarity.
          </p>
        </div>

        {/* Share Button (Material FAB style approach) */}
        {result && (
          <button
            onClick={handleShare}
            className={cn(
              'group flex items-center gap-2 rounded-full px-6 py-3 text-xs font-black tracking-widest uppercase transition-all active:scale-95',
              'bg-(--card-color) text-(--secondary-color)',
              'border border-(--border-color)/40 shadow-lg shadow-black/5 hover:border-(--main-color)/30 hover:shadow-xl',
              shareButtonState === 'copied' &&
                'border-transparent bg-green-500 text-white shadow-green-500/20',
              shareButtonState === 'error' &&
                'border-transparent bg-red-500 text-white shadow-red-500/20',
            )}
            aria-label={
              shareButtonState === 'copied'
                ? 'Link copied to clipboard'
                : shareButtonState === 'error'
                  ? 'Failed to copy link'
                  : `Share conjugation of ${result.verb.dictionaryForm}`
            }
            aria-live='polite'
          >
            {shareButtonState === 'copied' ? (
              <>
                <Check className='h-4 w-4' aria-hidden='true' />
                <span>Copied to Clipboard</span>
              </>
            ) : (
              <>
                <Share2 className='h-4 w-4 transition-transform group-hover:rotate-12' />
                <span>Share Results</span>
              </>
            )}
          </button>
        )}
      </header>

      {/* Main content area */}
      <div className='grid grid-cols-1 gap-12 lg:grid-cols-[1fr_380px] lg:gap-20'>
        {/* Left column - Input and Results */}
        <div className='flex flex-col gap-12 sm:gap-20'>
          {/* Input section */}
          <section aria-label='Verb Search'>
            <ConjugatorInput
              value={inputText}
              onChange={setInputText}
              onConjugate={handleConjugate}
              isLoading={isLoading}
              error={error}
            />
          </section>

          {/* Results section */}
          <section aria-label='Conjugation Results'>
            <ConjugationResults
              result={result}
              isLoading={isLoading}
              expandedCategories={expandedCategories}
              onToggleCategory={toggleCategory}
              onExpandAll={expandAllCategories}
              onCollapseAll={collapseAllCategories}
              onCopyForm={copyForm}
              onCopyAll={copyAllForms}
            />
          </section>
        </div>

        {/* Right column - History (desktop) */}
        <aside
          className='hidden lg:block'
          aria-label='Conjugation history sidebar'
        >
          <div className='sticky top-8'>
            <ConjugationHistory
              entries={history}
              onSelect={restoreFromHistory}
              onDelete={deleteFromHistory}
              onClearAll={clearHistory}
            />
          </div>
        </aside>
      </div>

      {/* History section (mobile) */}
      <aside className='lg:hidden' aria-label='Conjugation history'>
        <ConjugationHistory
          entries={history}
          onSelect={restoreFromHistory}
          onDelete={deleteFromHistory}
          onClearAll={clearHistory}
        />
      </aside>

      {/* Keyboard shortcuts info (screen reader only) */}
      <div className='sr-only' aria-live='polite'>
        <p>
          Keyboard shortcuts: Press Enter in the input field to conjugate. Press
          Escape to clear the input. Use Tab to navigate between elements.
        </p>
      </div>
    </div>
  );
}
