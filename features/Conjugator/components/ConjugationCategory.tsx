'use client';

import { useState, useCallback } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Edit3,
  Languages,
  XCircle,
  History,
  Lightbulb,
  Zap,
  ShieldAlert,
  ArrowRight,
  RotateCcw,
  AlertCircle,
  GitBranch,
  Heart,
  PlayCircle,
  Crown,
  FileText,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type {
  ConjugationCategory as CategoryType,
  ConjugationForm,
} from '../types';

interface ConjugationCategoryProps {
  /** Category identifier */
  category: CategoryType;
  /** Forms in this category */
  forms: ConjugationForm[];
  /** Whether the category is expanded */
  isExpanded: boolean;
  /** Callback when category is toggled */
  onToggle: () => void;
  /** Callback when a form is copied */
  onCopy: (form: ConjugationForm) => void;
}

/**
 * ConjugationCategory - Collapsible card displaying conjugation forms by category
 *
 * Features:
 * - Collapsible card with smooth animation
 * - Category name in English and Japanese
 * - Forms with kanji, hiragana, romaji
 * - Copy button for each form
 * - Hover/focus highlighting
 * - Proper ARIA labels and roles
 *
 * Requirements: 5.2, 5.3, 5.7, 6.1, 10.2
 */
export default function ConjugationCategory({
  category,
  forms,
  isExpanded,
  onToggle,
  onCopy,
}: ConjugationCategoryProps) {
  const categoryInfo = getCategoryInfo(category);

  if (forms.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        'group flex flex-col overflow-hidden rounded-3xl transition-all duration-500',
        'border border-(--border-color)/20 bg-(--card-color)/30',
        'hover:border-(--main-color)/20 hover:shadow-xl hover:shadow-black/5',
        isExpanded && 'border-(--main-color)/10 bg-(--card-color)/50 shadow-lg',
      )}
      role='listitem'
    >
      {/* Category header - clickable to toggle */}
      <button
        onClick={onToggle}
        className={cn(
          'flex items-center justify-between px-8 py-6 transition-all duration-300',
          'hover:bg-(--main-color)/5',
          'cursor-pointer focus:bg-(--main-color)/5 focus:outline-none',
        )}
        aria-expanded={isExpanded}
        aria-controls={`category-${category}`}
        aria-label={`${categoryInfo.name} (${categoryInfo.nameJa}), ${forms.length} form${forms.length !== 1 ? 's' : ''}. ${isExpanded ? 'Click to collapse' : 'Click to expand'}`}
      >
        <div className='flex items-center gap-6'>
          <div
            className={cn(
              'flex h-14 w-14 items-center justify-center rounded-2xl text-2xl shadow-sm transition-transform duration-500',
              categoryInfo.bgClass,
              isExpanded && 'scale-110 rotate-3',
            )}
            aria-hidden='true'
          >
            {categoryInfo.icon}
          </div>
          <div className='text-left'>
            <h4 className='text-xl font-black tracking-tight text-(--main-color) sm:text-2xl'>
              {categoryInfo.name}
            </h4>
            <div className='mt-1 flex items-center gap-3'>
              <span className='font-japanese text-xs font-bold tracking-widest text-(--secondary-color) opacity-50'>
                {categoryInfo.nameJa}
              </span>
              <div className='h-1 w-1 rounded-full bg-(--border-color)' />
              <span className='text-[10px] font-black tracking-widest text-(--secondary-color) uppercase opacity-30'>
                {forms.length} Variants
              </span>
            </div>
          </div>
        </div>
        <div className='flex items-center gap-4'>
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-full transition-all duration-500',
              isExpanded
                ? 'rotate-180 bg-(--main-color) text-white'
                : 'bg-(--main-color)/5 text-(--main-color) group-hover:bg-(--main-color)/10',
            )}
          >
            <ChevronDown
              className={cn('h-5 w-5', isExpanded ? 'scale-110' : '')}
              aria-hidden='true'
            />
          </div>
        </div>
      </button>

      {/* Forms list - animated expand/collapse */}
      <div
        id={`category-${category}`}
        className={cn(
          'grid transition-all duration-500 ease-in-out',
          isExpanded
            ? 'grid-rows-[1fr] opacity-100'
            : 'grid-rows-[0fr] opacity-0',
        )}
        role='region'
        aria-label={`${categoryInfo.name} conjugation forms`}
        hidden={!isExpanded}
      >
        <div className='overflow-hidden'>
          <div
            className='flex flex-col border-t border-(--border-color)/20'
            role='list'
            aria-label={`${forms.length} ${categoryInfo.name.toLowerCase()} forms`}
          >
            {forms.map((form, index) => (
              <FormRow
                key={form.id}
                form={form}
                onCopy={onCopy}
                index={index}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Individual form row component
 */
function FormRow({
  form,
  onCopy,
  index,
}: {
  form: ConjugationForm;
  onCopy: (form: ConjugationForm) => void;
  index: number;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    onCopy(form);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [form, onCopy]);

  return (
    <div
      className={cn(
        'group flex items-center justify-between gap-6 px-8 py-6 transition-all duration-300',
        'focus-within:bg-(--main-color)/5 hover:bg-(--main-color)/5',
        'animate-in fade-in slide-in-from-left-4 duration-500',
      )}
      style={{ animationDelay: `${index * 50}ms` }}
      role='listitem'
    >
      {/* Form info */}
      <div className='flex min-w-0 flex-1 flex-col gap-3'>
        <div className='flex items-baseline gap-4'>
          <span
            className='font-japanese text-3xl font-black text-(--main-color) sm:text-4xl'
            lang='ja'
          >
            {form.kanji}
          </span>
          {form.kanji !== form.hiragana && (
            <span
              className='font-japanese text-lg font-medium text-(--secondary-color) opacity-40'
              lang='ja'
              aria-label={`Reading: ${form.hiragana}`}
            >
              {form.hiragana}
            </span>
          )}
        </div>
        <div className='flex flex-wrap items-center gap-4'>
          <div className='flex items-center gap-1.5'>
            <span className='h-1 w-1 rounded-full bg-(--main-color)' />
            <span className='text-[10px] font-black tracking-widest text-(--secondary-color) uppercase opacity-60'>
              {form.name}
            </span>
          </div>
          <div className='h-4 w-[1px] bg-(--border-color)/40' />
          <span
            className='font-mono text-[11px] font-bold tracking-tight text-(--secondary-color) opacity-40'
            aria-label={`Romaji: ${form.romaji}`}
          >
            {form.romaji}
          </span>
          {form.formality === 'polite' && (
            <div className='flex items-center gap-2 rounded-md bg-blue-500/5 px-2 py-0.5 ring-1 ring-blue-500/20'>
              <span className='text-[9px] font-black tracking-widest text-blue-500 uppercase'>
                Polite
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Copy icon button (Material ghost style) */}
      <button
        onClick={handleCopy}
        className={cn(
          'flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition-all duration-500 active:scale-90',
          'border border-transparent bg-transparent',
          'hover:border-(--main-color)/20 hover:bg-(--main-color)/10 hover:text-(--main-color)',
          'opacity-0 group-hover:opacity-100 focus:opacity-100',
          copied &&
            'border-transparent bg-green-500 text-white opacity-100 hover:bg-green-600',
        )}
        aria-label={
          copied
            ? `${form.name} copied to clipboard`
            : `Copy ${form.name}: ${form.kanji}`
        }
        aria-live='polite'
      >
        {copied ? (
          <Check className='h-6 w-6' aria-hidden='true' />
        ) : (
          <Copy
            className='h-5 w-5 text-(--secondary-color) group-hover:text-(--main-color)'
            aria-hidden='true'
          />
        )}
      </button>
    </div>
  );
}

/**
 * Get display information for a category
 */
function getCategoryInfo(category: CategoryType): {
  name: string;
  nameJa: string;
  icon: React.ReactNode;
  bgClass: string;
} {
  const categories: Record<
    CategoryType,
    { name: string; nameJa: string; icon: React.ReactNode; bgClass: string }
  > = {
    basic: {
      name: 'Basic Forms',
      nameJa: '基本形',
      icon: <Edit3 className='h-6 w-6 text-blue-500' />,
      bgClass: 'bg-blue-500/10',
    },
    polite: {
      name: 'Polite Forms',
      nameJa: '丁寧形',
      icon: <Languages className='h-6 w-6 text-purple-500' />,
      bgClass: 'bg-purple-500/10',
    },
    negative: {
      name: 'Negative Forms',
      nameJa: '否定形',
      icon: <XCircle className='h-6 w-6 text-red-500' />,
      bgClass: 'bg-red-500/10',
    },
    past: {
      name: 'Past Forms',
      nameJa: '過去形',
      icon: <History className='h-6 w-6 text-amber-500' />,
      bgClass: 'bg-amber-500/10',
    },
    volitional: {
      name: 'Volitional Forms',
      nameJa: '意向形',
      icon: <Lightbulb className='h-6 w-6 text-cyan-500' />,
      bgClass: 'bg-cyan-500/10',
    },
    potential: {
      name: 'Potential Forms',
      nameJa: '可能形',
      icon: <Zap className='h-6 w-6 text-green-500' />,
      bgClass: 'bg-green-500/10',
    },
    passive: {
      name: 'Passive Forms',
      nameJa: '受身形',
      icon: <ShieldAlert className='h-6 w-6 text-indigo-500' />,
      bgClass: 'bg-indigo-500/10',
    },
    causative: {
      name: 'Causative Forms',
      nameJa: '使役形',
      icon: <ArrowRight className='h-6 w-6 text-orange-500' />,
      bgClass: 'bg-orange-500/10',
    },
    'causative-passive': {
      name: 'Causative-Passive',
      nameJa: '使役受身形',
      icon: <RotateCcw className='h-6 w-6 text-pink-500' />,
      bgClass: 'bg-pink-500/10',
    },
    imperative: {
      name: 'Imperative Forms',
      nameJa: '命令形',
      icon: <AlertCircle className='h-6 w-6 text-yellow-500' />,
      bgClass: 'bg-yellow-500/10',
    },
    conditional: {
      name: 'Conditional Forms',
      nameJa: '条件形',
      icon: <GitBranch className='h-6 w-6 text-teal-500' />,
      bgClass: 'bg-teal-500/10',
    },
    'tai-form': {
      name: 'Desire Forms',
      nameJa: 'たい形',
      icon: <Heart className='h-6 w-6 text-rose-500' />,
      bgClass: 'bg-rose-500/10',
    },
    progressive: {
      name: 'Progressive Forms',
      nameJa: '進行形',
      icon: <PlayCircle className='h-6 w-6 text-sky-500' />,
      bgClass: 'bg-sky-500/10',
    },
    honorific: {
      name: 'Honorific Forms',
      nameJa: '敬語',
      icon: <Crown className='h-6 w-6 text-violet-500' />,
      bgClass: 'bg-violet-500/10',
    },
  };

  return (
    categories[category] || {
      name: category,
      nameJa: category,
      icon: <FileText className='h-6 w-6 text-gray-500' />,
      bgClass: 'bg-gray-500/10',
    }
  );
}
