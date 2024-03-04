import { useLocale, useTranslations } from 'next-intl';
import { usePathname } from '@/navigation';
import { ReactElement } from 'react';

export default function LocaleSwitcher(): ReactElement {
  const t = useTranslations('LocaleSwitcher');
  const locale = useLocale();
  const pathname = usePathname();

  const localeList = ['en-US', 'sr_RS', 'de', 'fr', 'es'];

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLocale = e.target.value;
    const newPathname = `/${selectedLocale}${pathname}`;
    window.location.href = newPathname;
  };

  return (
    <select value={locale} onChange={handleChange}>
      {localeList.map((localeOption) => (
        <option key={localeOption} value={localeOption}>
          {t(`${localeOption}`)}
        </option>
      ))}
    </select>
  );
}
