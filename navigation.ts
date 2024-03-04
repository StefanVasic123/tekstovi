import { createSharedPathnamesNavigation } from 'next-intl/navigation';

export const locales = ['en-US', 'sr_RS', 'de', 'fr', 'es'] as const;
export const { Link, redirect, usePathname, useRouter } =
  createSharedPathnamesNavigation({ locales });
