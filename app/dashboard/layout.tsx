'use client';
import { PowerIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import {
  ChartBarIcon,
  NewspaperIcon,
  PencilSquareIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const links = [
  { name: '', href: '/dashboard/calendar', icon: PencilSquareIcon },
  { name: '', href: '/dashboard/databoard', icon: ChartBarIcon },
  { name: '', href: '/dashboard/report', icon: NewspaperIcon },
  { name: '', href: '/dashboard/setting', icon: Cog6ToothIcon },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      <div className="w-full flex-none md:w-24">
        <div className="flex h-full flex-col px-3 py-4 md:px-2">
          <div className="mb-2 flex h-20 items-end justify-start rounded-md bg-blue-600 p-4 md:h-20">
            <div className="w-32 text-white md:w-40">
              <div
                className={`flex flex-row items-center leading-none text-white`}
              >
                <CalendarDaysIcon className="h-12 w-12 rotate-[15deg]" />
              </div>
            </div>
          </div>
          <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
            <>
              {links.map((link) => {
                const LinkIcon = link.icon;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={clsx(
                      'flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-center md:pr-2 md:px-3',
                      {
                        'bg-sky-100 text-blue-600': pathname === link.href,
                      },
                    )}
                  >
                    <LinkIcon className="w-6" />
                    <p className="hidden md:block">{link.name}</p>
                  </Link>
                );
              })}
            </>
            <div className="hidden h-auto w-full grow rounded-md bg-gray-50 md:block"></div>
            <form>
              <button className="flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-center md:p-2 md:px-3">
                <PowerIcon className="w-6" />
              </button>
            </form>
          </div>
        </div>
      </div>
      <div className="flex-grow md:overflow-y-auto">{children}</div>
    </div>
  );
}
