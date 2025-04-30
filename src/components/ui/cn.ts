import type { ClassValue } from 'clsx';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

/** A utility function to merge class names by composing clsx and tailwind merge */
export const cn = (...classLists: ClassValue[]) => twMerge(clsx(classLists));
