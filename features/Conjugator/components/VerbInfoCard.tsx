'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, BookOpen, Info } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { VerbInfo, VerbType, IrregularType } from '../types';

interface VerbInfoCardProps {
  /** Verb information from classification */
  verb: VerbInfo;
}

/**
 * VerbInfoCard - Displays detected verb type and stem information
 *
 * Features:
 * - Shows verb type (Godan/Ichidan/Irregular)
 * - Displays verb stem
 * - Expandable section with conjugation rule explanation
 * - Proper ARIA labels and roles
 *
 * Requirements: 9.1, 9.2, 9.3, 10.2
 */
export default function VerbInfoCard({ verb }: VerbInfoCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const verbTypeInfo = getVerbTypeInfo(verb.type, verb.irregularType);

  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden rounded-[2.5rem]',
        'bg-(--card-color)/40 backdrop-blur-md',
        'border border-(--border-color)/30 shadow-2xl shadow-black/5',
      )}
      role='region'
      aria-label={`Verb information for ${verb.dictionaryForm}`}
    >
      {/* Main info section */}
      <div className='flex flex-col gap-10 p-8 sm:p-12'>
        {/* Header with verb */}
        <div className='flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between'>
          <div className='flex items-start gap-6'>
            <div
              className='flex h-20 w-20 items-center justify-center rounded-3xl bg-(--main-color) text-(--background-color) shadow-(--main-color)/20 shadow-xl'
              aria-hidden='true'
            >
              <BookOpen className='h-8 w-8' />
            </div>
            <div className='flex flex-col gap-1'>
              <h3
                className='font-japanese text-5xl font-black tracking-tight text-(--main-color) sm:text-7xl lg:text-8xl'
                lang='ja'
              >
                {verb.dictionaryForm}
              </h3>
              <div className='flex items-center gap-3 text-lg font-medium text-(--secondary-color) opacity-60 sm:text-2xl'>
                <span className='font-japanese' lang='ja'>
                  {verb.reading}
                </span>
                <div className='h-1.5 w-1.5 rounded-full bg-(--border-color)' />
                <span className='italic'>{verb.romaji}</span>
              </div>
            </div>
          </div>

          <div className='flex items-center gap-2 rounded-full bg-(--main-color)/5 px-4 py-2 ring-1 ring-(--main-color)/10'>
            <Info className='h-3.5 w-3.5 text-(--main-color) opacity-50' />
            <span className='text-[10px] font-black tracking-widest text-(--main-color) uppercase'>
              Analyzed Segment
            </span>
          </div>
        </div>

        {/* Verb classification metrics */}
        <div
          className='grid grid-cols-1 gap-6 sm:grid-cols-3'
          role='group'
          aria-label='Verb classification details'
        >
          {/* Verb Type */}
          <div className='group flex flex-col gap-3 rounded-2xl bg-(--background-color)/50 p-6 ring-1 ring-(--border-color)/50 transition-all hover:bg-(--background-color) hover:ring-(--main-color)/20'>
            <span className='text-[10px] font-black tracking-[0.2em] text-(--secondary-color) uppercase opacity-40 transition-opacity group-hover:opacity-100'>
              Grammar Class
            </span>
            <span className={cn('text-xl font-black', verbTypeInfo.colorClass)}>
              {verbTypeInfo.label}
            </span>
          </div>

          {/* Stem */}
          <div className='group flex flex-col gap-3 rounded-2xl bg-(--background-color)/50 p-6 ring-1 ring-(--border-color)/50 transition-all hover:bg-(--background-color) hover:ring-(--main-color)/20'>
            <span className='text-[10px] font-black tracking-[0.2em] text-(--secondary-color) uppercase opacity-40 transition-opacity group-hover:opacity-100'>
              Morpheme Stem
            </span>
            <span
              className='font-japanese text-2xl font-black text-(--main-color)'
              lang='ja'
            >
              {verb.stem || '—'}
            </span>
          </div>

          {/* Ending */}
          <div className='group flex flex-col gap-3 rounded-2xl bg-(--background-color)/50 p-6 ring-1 ring-(--border-color)/50 transition-all hover:bg-(--background-color) hover:ring-(--main-color)/20'>
            <span className='text-[10px] font-black tracking-[0.2em] text-(--secondary-color) uppercase opacity-40 transition-opacity group-hover:opacity-100'>
              Ending Particle
            </span>
            <span
              className='font-japanese text-2xl font-black text-(--main-color)'
              lang='ja'
            >
              {verb.ending || '—'}
            </span>
          </div>
        </div>

        {/* Compound prefix alert */}
        {verb.compoundPrefix && (
          <div
            className='flex items-center gap-4 rounded-2xl bg-(--main-color)/5 p-5 ring-1 ring-(--main-color)/10'
            role='note'
          >
            <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-(--main-color)/10'>
              <Info className='h-5 w-5 text-(--main-color)' />
            </div>
            <div className='flex flex-col'>
              <span className='text-[10px] font-black tracking-widest text-(--main-color) uppercase opacity-40'>
                Complex Structure Detected
              </span>
              <span className='text-sm font-medium text-(--main-color)'>
                Compound verb with prefix:{' '}
                <span className='font-japanese font-black' lang='ja'>
                  {verb.compoundPrefix}
                </span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Expandable detailed rules section */}
      <section className='border-t border-(--border-color)/30'>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            'flex w-full items-center justify-between px-8 py-6 sm:px-12',
            'bg-(--background-color)/20 hover:bg-(--main-color)/5',
            'transition-all duration-300',
            'cursor-pointer focus:bg-(--main-color)/5 focus:outline-none',
          )}
          aria-expanded={isExpanded}
          aria-controls='verb-explanation'
          aria-label={`${isExpanded ? 'Hide' : 'Show'} conjugation rules for ${verbTypeInfo.label} verbs`}
        >
          <div className='flex items-center gap-4'>
            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-(--main-color)/10'>
              <BookOpen className='h-4 w-4 text-(--main-color)' />
            </div>
            <span className='text-xs font-black tracking-[0.2em] text-(--main-color) uppercase'>
              Linguistic Principles
            </span>
          </div>
          <div className='flex items-center gap-4'>
            <span className='text-[10px] font-bold tracking-widest text-(--secondary-color) uppercase opacity-40'>
              {isExpanded ? 'Hide details' : 'View documentation'}
            </span>
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full transition-transform duration-500',
                isExpanded
                  ? 'rotate-180 bg-(--main-color) text-white'
                  : 'bg-(--main-color)/10 text-(--main-color)',
              )}
            >
              <ChevronDown className='h-4 w-4' />
            </div>
          </div>
        </button>

        {/* Animated content expansion */}
        <div
          id='verb-explanation'
          className={cn(
            'grid transition-all duration-500 ease-in-out',
            isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
          )}
        >
          <div className='overflow-hidden'>
            <div className='space-y-8 bg-(--background-color)/50 p-8 sm:p-12'>
              <div className='flex flex-col gap-2'>
                <h4 className='text-sm font-black tracking-widest text-(--main-color) uppercase'>
                  Morphological Overview
                </h4>
                <p className='text-base leading-relaxed text-(--secondary-color) opacity-70'>
                  {verbTypeInfo.description}
                </p>
              </div>

              <div className='flex flex-col gap-4'>
                <h4 className='text-sm font-black tracking-widest text-(--main-color) uppercase'>
                  Core Transformation Rules
                </h4>
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                  {verbTypeInfo.rules.map((rule, index) => (
                    <div
                      key={index}
                      className='flex items-start gap-4 rounded-xl border border-(--border-color)/30 bg-(--background-color) p-4'
                    >
                      <span className='flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-(--main-color) text-[10px] font-black text-white'>
                        {index + 1}
                      </span>
                      <span className='text-sm leading-relaxed font-medium text-(--secondary-color)'>
                        {rule}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/**
 * Get display information for verb type
 */
function getVerbTypeInfo(
  type: VerbType,
  irregularType?: IrregularType,
): {
  label: string;
  colorClass: string;
  description: string;
  rules: string[];
} {
  if (type === 'irregular' && irregularType) {
    return getIrregularTypeInfo(irregularType);
  }

  switch (type) {
    case 'godan':
      return {
        label: 'Godan (五段)',
        colorClass: 'text-blue-500',
        description:
          'Godan verbs (also called u-verbs or Group I verbs) conjugate across five vowel sounds. The final kana changes based on the conjugation form.',
        rules: [
          'The stem changes based on the vowel grade (a, i, u, e, o)',
          'Te-form has sound changes based on the ending (って, んで, いて, etc.)',
          'Negative form uses the a-grade stem + ない',
          'Masu-form uses the i-grade stem + ます',
        ],
      };
    case 'ichidan':
      return {
        label: 'Ichidan (一段)',
        colorClass: 'text-green-500',
        description:
          'Ichidan verbs (also called ru-verbs or Group II verbs) have a simpler conjugation pattern. The る ending is replaced with the appropriate suffix.',
        rules: [
          'Remove る and add the conjugation suffix',
          'Te-form: stem + て',
          'Negative form: stem + ない',
          'Masu-form: stem + ます',
          'Potential form has both traditional (-られる) and colloquial (-れる) forms',
        ],
      };
    case 'irregular':
      return {
        label: 'Irregular',
        colorClass: 'text-purple-500',
        description:
          'This verb has irregular conjugation patterns that must be memorized.',
        rules: ['Conjugation patterns do not follow standard rules'],
      };
    default:
      return {
        label: 'Unknown',
        colorClass: 'text-(--secondary-color)',
        description: 'Unable to determine verb type.',
        rules: [],
      };
  }
}

/**
 * Get display information for specific irregular verb types
 */
function getIrregularTypeInfo(irregularType: IrregularType): {
  label: string;
  colorClass: string;
  description: string;
  rules: string[];
} {
  switch (irregularType) {
    case 'suru':
      return {
        label: 'する-verb',
        colorClass: 'text-purple-500',
        description:
          'する (to do) is one of the two main irregular verbs in Japanese. It has unique conjugation patterns.',
        rules: [
          'Te-form: して',
          'Negative: しない',
          'Masu-form: します',
          'Potential: できる (separate verb)',
          'Passive: される',
          'Causative: させる',
        ],
      };
    case 'kuru':
      return {
        label: '来る-verb',
        colorClass: 'text-purple-500',
        description:
          '来る (to come) is one of the two main irregular verbs. The reading changes between く and こ depending on the form.',
        rules: [
          'Te-form: 来て (きて)',
          'Negative: 来ない (こない)',
          'Masu-form: 来ます (きます)',
          'Potential: 来られる (こられる)',
          'Past: 来た (きた)',
        ],
      };
    case 'aru':
      return {
        label: 'ある-verb',
        colorClass: 'text-orange-500',
        description:
          'ある (to exist, for inanimate objects) has a unique negative form.',
        rules: [
          'Negative: ない (not あらない)',
          'Other forms follow Godan patterns',
          'Te-form: あって',
          'Past: あった',
        ],
      };
    case 'iku':
      return {
        label: '行く-verb',
        colorClass: 'text-orange-500',
        description:
          '行く (to go) is mostly regular but has an irregular te-form.',
        rules: [
          'Te-form: 行って (not 行いて)',
          'Ta-form: 行った (not 行いた)',
          'Other forms follow regular Godan patterns',
        ],
      };
    case 'honorific':
      return {
        label: 'Honorific',
        colorClass: 'text-pink-500',
        description:
          'Honorific verbs (くださる, なさる, いらっしゃる, おっしゃる, ござる) have irregular masu-forms.',
        rules: [
          'Masu-form uses ます instead of ります',
          'Example: くださる → くださいます (not くださります)',
          'Other forms follow Godan patterns',
        ],
      };
    default:
      return {
        label: 'Irregular',
        colorClass: 'text-purple-500',
        description: 'This verb has irregular conjugation patterns.',
        rules: [],
      };
  }
}
