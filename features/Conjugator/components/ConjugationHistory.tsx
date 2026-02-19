'use client';

import { useState } from 'react';
import { Trash2, Clock, X, History } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { ActionButton } from '@/shared/components/ui/ActionButton';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/components/ui/alert-dialog';
import type { HistoryEntry, VerbType } from '../types';

interface ConjugationHistoryProps {
  /** History entries to display */
  entries: HistoryEntry[];
  /** Callback when an entry is selected */
  onSelect: (entry: HistoryEntry) => void;
  /** Callback when an entry is deleted */
  onDelete: (id: string) => void;
  /** Callback when all entries are cleared */
  onClearAll: () => void;
}

/**
 * ConjugationHistory - Displays recent conjugated verbs
 *
 * Features:
 * - Recent verbs as clickable chips/cards
 * - Delete button for individual entries
 * - Clear all button
 * - Proper ARIA labels and roles
 *
 * Requirements: 8.2, 8.3, 8.4, 10.2
 */
export default function ConjugationHistory({
  entries,
  onSelect,
  onDelete,
  onClearAll,
}: ConjugationHistoryProps) {
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  // Empty state
  if (entries.length === 0) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center rounded-3xl px-6 py-12 text-center',
          'border border-dashed border-(--border-color)/50 bg-(--card-color)/20',
          'text-(--secondary-color)',
        )}
        role='region'
        aria-label='Conjugation history'
      >
        <div
          className={cn(
            'mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-(--secondary-color)/5',
          )}
          aria-hidden='true'
        >
          <History className='h-8 w-8 opacity-20' />
        </div>
        <h4 className='text-sm font-black tracking-widest uppercase opacity-40'>
          Archive Empty
        </h4>
        <p className='mt-2 text-xs leading-relaxed font-medium opacity-30'>
          Your linguistic transformations will be archived here for quick
          retrieval.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-col gap-8 rounded-3xl p-8',
        'border border-(--border-color)/20 bg-(--card-color)/30 shadow-2xl shadow-black/5',
      )}
      role='region'
      aria-label='Conjugation history'
    >
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <div
            className='flex h-10 w-10 items-center justify-center rounded-xl bg-(--main-color) text-(--background-color) shadow-(--main-color)/20 shadow-lg'
            aria-hidden='true'
          >
            <Clock className='h-5 w-5' />
          </div>
          <div>
            <h3 className='text-sm font-black tracking-[0.2em] text-(--main-color) uppercase'>
              Recent Logs
            </h3>
            <p className='text-[10px] font-bold text-(--secondary-color) opacity-40'>
              {entries.length} Synths Archived
            </p>
          </div>
        </div>

        {/* Clear all button */}
        <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
          <AlertDialogTrigger asChild>
            <button
              className='flex h-8 w-8 items-center justify-center rounded-lg bg-(--secondary-color)/5 text-(--secondary-color) transition-all hover:bg-red-500 hover:text-white active:scale-90'
              aria-label='Clear all history archive'
            >
              <Trash2 className='h-4 w-4' />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent
            className={cn(
              'border-(--border-color) bg-(--background-color)',
              'rounded-3xl',
            )}
          >
            <AlertDialogHeader>
              <AlertDialogTitle className='text-xl font-black text-(--main-color)'>
                Purge Archive?
              </AlertDialogTitle>
              <AlertDialogDescription className='text-base leading-relaxed font-medium text-(--secondary-color)/70'>
                This will permanently delete all your linguistic transformation
                records. This action is irreversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className='flex-row gap-4 pt-4'>
              <ActionButton
                colorScheme='secondary'
                borderRadius='xl'
                borderBottomThickness={0}
                className='flex-1 border border-(--border-color)/50 text-xs font-black tracking-widest uppercase'
                onClick={() => setClearDialogOpen(false)}
              >
                Retain
              </ActionButton>
              <ActionButton
                colorScheme='main'
                borderRadius='xl'
                borderBottomThickness={0}
                className='flex-1 bg-red-600 text-xs font-black tracking-widest uppercase hover:bg-red-700'
                onClick={() => {
                  onClearAll();
                  setClearDialogOpen(false);
                }}
              >
                Purge All
              </ActionButton>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* History entries as a vertical list */}
      <div
        className='flex flex-col gap-3'
        role='list'
        aria-label='Recent conjugated verbs'
      >
        {entries.map(entry => (
          <HistoryRecord
            key={entry.id}
            entry={entry}
            onSelect={onSelect}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Individual history record component
 */
function HistoryRecord({
  entry,
  onSelect,
  onDelete,
}: {
  entry: HistoryEntry;
  onSelect: (entry: HistoryEntry) => void;
  onDelete: (id: string) => void;
}) {
  const typeInfo = getVerbTypeInfo(entry.verbType);

  return (
    <div
      className={cn(
        'group flex items-center justify-between rounded-xl transition-all duration-300',
        'border border-(--border-color)/20 bg-(--background-color)/50 shadow-sm',
        'hover:-translate-x-1 hover:border-(--main-color)/30 hover:shadow-md',
      )}
      role='listitem'
    >
      {/* Clickable verb part */}
      <button
        onClick={() => onSelect(entry)}
        className='flex min-w-0 flex-1 items-center gap-4 py-3 pl-4 text-left focus:outline-none'
        aria-label={`Conjugate ${entry.verb}, ${typeInfo.label} verb, conjugated ${formatTimestamp(entry.timestamp)} ago`}
      >
        {/* Type Icon */}
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xs font-black shadow-inner',
            typeInfo.bgClass,
            typeInfo.textClass,
          )}
          aria-hidden='true'
        >
          {typeInfo.abbrev}
        </div>

        <div className='flex min-w-0 flex-col'>
          <span
            className='font-japanese truncate text-lg font-black tracking-tight text-(--main-color)'
            lang='ja'
          >
            {entry.verb}
          </span>
          <div className='flex items-center gap-2'>
            <span className='text-[9px] font-black tracking-widest text-(--secondary-color) uppercase opacity-30'>
              {typeInfo.label}
            </span>
            <div className='h-1 w-1 rounded-full bg-(--border-color)' />
            <span className='flex items-center gap-1 text-[9px] font-black tracking-widest text-(--secondary-color) uppercase opacity-30'>
              {formatTimestamp(entry.timestamp)}
            </span>
          </div>
        </div>
      </button>

      {/* Action Area */}
      <div className='flex items-center pr-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100'>
        <button
          onClick={e => {
            e.stopPropagation();
            onDelete(entry.id);
          }}
          className='flex h-10 w-10 items-center justify-center rounded-lg text-(--secondary-color) opacity-20 transition-all hover:bg-red-500 hover:text-white hover:opacity-100 focus:outline-none'
          aria-label={`Remove ${entry.verb} from history`}
        >
          <X className='h-4 w-4' aria-hidden='true' />
        </button>
      </div>
    </div>
  );
}

/**
 * Format timestamp to relative time
 */
function formatTimestamp(timestamp: number): string {
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;

  return new Date(timestamp).toLocaleDateString();
}

/**
 * Get display info for verb type
 */
function getVerbTypeInfo(type: VerbType): {
  label: string;
  abbrev: string;
  bgClass: string;
  textClass: string;
} {
  switch (type) {
    case 'godan':
      return {
        label: 'Godan (五段)',
        abbrev: 'G',
        bgClass: 'bg-blue-500/20',
        textClass: 'text-blue-500',
      };
    case 'ichidan':
      return {
        label: 'Ichidan (一段)',
        abbrev: 'I',
        bgClass: 'bg-green-500/20',
        textClass: 'text-green-500',
      };
    case 'irregular':
      return {
        label: 'Irregular',
        abbrev: '!',
        bgClass: 'bg-purple-500/20',
        textClass: 'text-purple-500',
      };
    default:
      return {
        label: 'Unknown',
        abbrev: '?',
        bgClass: 'bg-gray-500/20',
        textClass: 'text-gray-500',
      };
  }
}
