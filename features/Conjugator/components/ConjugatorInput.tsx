'use client';

import { useCallback, useRef, useEffect } from 'react';
import { X, Keyboard, Search, Loader2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { ActionButton } from '@/shared/components/ui/ActionButton';
import type { ConjugationError } from '../types';

interface ConjugatorInputProps {
  /** Current input value */
  value: string;
  /** Callback when input changes */
  onChange: (value: string) => void;
  /** Callback when conjugate is triggered */
  onConjugate: () => void;
  /** Whether conjugation is in progress */
  isLoading: boolean;
  /** Error from conjugation attempt */
  error: ConjugationError | null;
}

/**
 * ConjugatorInput - Text input component for Japanese verb conjugation
 *
 * Features:
 * - Japanese font support
 * - Conjugate button with loading state
 * - Enter key shortcut to conjugate
 * - Validation error display
 * - Proper ARIA labels and roles
 *
 * Requirements: 1.1, 1.3, 1.4, 5.1, 5.3, 10.2
 */
export default function ConjugatorInput({
  value,
  onChange,
  onConjugate,
  isLoading,
  error,
}: ConjugatorInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isDisabled = isLoading;
  const canConjugate = value.trim().length > 0 && !isLoading;

  // Handle keyboard shortcut (Enter to conjugate, Escape to clear)
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (canConjugate) {
          onConjugate();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        if (value.length > 0) {
          onChange('');
        }
      }
    },
    [canConjugate, onConjugate, value, onChange],
  );

  // Handle text change
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    },
    [onChange],
  );

  // Handle clear button
  const handleClear = useCallback(() => {
    onChange('');
    inputRef.current?.focus();
  }, [onChange]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div
      className={cn(
        'group relative flex w-full flex-col gap-8 rounded-3xl p-8 transition-all duration-500 sm:p-10',
        'bg-(--card-color)/50 backdrop-blur-sm',
        'border border-(--border-color)/30 shadow-2xl shadow-black/5',
        'hover:border-(--main-color)/20 hover:shadow-black/10',
      )}
      role='search'
      aria-label='Japanese verb conjugation input'
    >
      {/* Search Header */}
      <div className='flex items-center gap-6'>
        <div
          className='flex h-12 w-12 items-center justify-center rounded-xl bg-(--main-color) text-(--background-color) shadow-(--main-color)/20 shadow-lg'
          aria-hidden='true'
        >
          <Search className='h-5 w-5' />
        </div>
        <div>
          <h2
            className='text-xl font-black tracking-tight text-(--main-color) sm:text-2xl'
            id='verb-input-label'
          >
            Universal Search
          </h2>
          <p
            className='text-sm font-medium text-(--secondary-color) opacity-50'
            id='verb-input-hint'
          >
            Enter a Japanese verb in any form
          </p>
        </div>
      </div>

      {/* Input Field Container */}
      <div className='relative flex flex-col gap-4'>
        <div className='relative flex items-center'>
          <input
            ref={inputRef}
            type='text'
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={isDisabled}
            placeholder='e.g. 食べる, 行く, する...'
            className={cn(
              'h-20 w-full rounded-2xl px-8 sm:h-24 sm:px-10',
              'bg-(--background-color) text-3xl text-(--main-color) placeholder:text-(--secondary-color)/30 sm:text-4xl',
              'font-japanese tracking-wide',
              'border border-(--border-color)/20 shadow-inner transition-all duration-300',
              'focus:border-(--main-color)/40 focus:ring-8 focus:ring-(--main-color)/5 focus:outline-none',
              error &&
                'border-red-500/50 focus:border-red-500 focus:ring-red-500/5',
              isDisabled && 'cursor-not-allowed opacity-60',
            )}
            aria-labelledby='verb-input-label'
            aria-describedby={
              error ? 'input-error verb-input-hint' : 'verb-input-hint'
            }
            aria-invalid={!!error}
            autoComplete='off'
            autoCorrect='off'
            autoCapitalize='off'
            spellCheck='false'
            lang='ja'
          />

          {/* Clear button */}
          {value.length > 0 && !isDisabled && (
            <button
              onClick={handleClear}
              className={cn(
                'absolute right-6 flex h-10 w-10 items-center justify-center rounded-full transition-all sm:right-8',
                'bg-(--secondary-color)/10 text-(--secondary-color) hover:bg-(--secondary-color)/20 hover:text-(--main-color)',
              )}
              aria-label='Clear input field'
            >
              <X className='h-5 w-5' aria-hidden='true' />
            </button>
          )}
        </div>

        {/* Error Message Section */}
        {error && (
          <div
            id='input-error'
            className={cn(
              'flex items-center gap-3 rounded-xl p-4',
              'border border-red-500/20 bg-red-500/5',
              'animate-in fade-in slide-in-from-top-2 text-sm font-bold text-red-500',
            )}
            role='alert'
            aria-live='polite'
          >
            <div className='h-1.5 w-1.5 scale-125 rounded-full bg-red-500' />
            {getErrorMessage(error)}
          </div>
        )}
      </div>

      {/* Action Section */}
      <div className='flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between'>
        <ActionButton
          onClick={onConjugate}
          disabled={!canConjugate}
          gradient
          borderRadius='xl'
          borderBottomThickness={0}
          className={cn(
            'h-16 w-full text-sm font-black tracking-[0.2em] uppercase sm:h-18 sm:w-auto sm:px-12',
            'shadow-(--main-color)/10 shadow-xl transition-all hover:scale-[1.02] hover:shadow-(--main-color)/20 active:scale-95',
            'disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:hover:scale-100',
          )}
          aria-label={
            isLoading ? 'Conjugating verb, please wait' : 'Conjugate verb'
          }
          aria-busy={isLoading}
        >
          {isLoading ? (
            <div className='flex items-center gap-3'>
              <Loader2 className='h-5 w-5 animate-spin' />
              <span>Conjugating</span>
            </div>
          ) : (
            'Conjugate Now'
          )}
        </ActionButton>

        {/* Keyboard hints */}
        <div className='flex items-center gap-4 text-[10px] font-black tracking-widest text-(--secondary-color) uppercase opacity-40'>
          <div className='flex items-center gap-2'>
            <kbd className='rounded bg-(--secondary-color)/10 px-1.5 py-0.5 font-mono'>
              ENTER
            </kbd>
            <span>Conjugate</span>
          </div>
          <div className='h-4 w-[1px] bg-(--border-color)/50' />
          <div className='flex items-center gap-2'>
            <kbd className='rounded bg-(--secondary-color)/10 px-1.5 py-0.5 font-mono'>
              ESC
            </kbd>
            <span>Clear</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Get user-friendly error message from error code
 */
function getErrorMessage(error: ConjugationError): string {
  switch (error.code) {
    case 'EMPTY_INPUT':
      return 'Please enter a Japanese verb';
    case 'INVALID_CHARACTERS':
      return 'Please enter a valid Japanese verb using hiragana, katakana, or kanji';
    case 'UNKNOWN_VERB':
      return 'This verb is not recognized. Please check the spelling or try the dictionary form';
    case 'AMBIGUOUS_VERB':
      return 'This input could be multiple verbs. Please be more specific';
    case 'CONJUGATION_FAILED':
      return error.message || 'An unexpected error occurred';
    default:
      return error.message || 'An error occurred';
  }
}
