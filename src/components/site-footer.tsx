import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-brand-100 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-semibold text-brand-900">TribeTip</p>
          <p className="mt-1 max-w-sm text-sm text-brand-700/80">
            Creator tips built for Africa — mobile money, local currencies, and payouts
            that actually reach your bank.
          </p>
        </div>
        <div className="flex flex-wrap gap-6 text-sm text-brand-700">
          <Link href="/sign-up" className="hover:text-brand-600">
            Create page
          </Link>
          <Link href="/sign-in" className="hover:text-brand-600">
            Sign in
          </Link>
          <a href="#how-it-works" className="hover:text-brand-600">
            How it works
          </a>
        </div>
      </div>
      <div className="border-t border-brand-50 py-4 text-center text-xs text-brand-600/70">
        © {new Date().getFullYear()} TribeTip Africa. Built for creators across the continent.
      </div>
    </footer>
  );
}
