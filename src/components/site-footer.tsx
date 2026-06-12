import Link from "next/link";
import { Logo } from "@/components/brand/logo";

type SiteFooterProps = {
  fixed?: boolean;
};

export function SiteFooter({ fixed = false }: SiteFooterProps) {
  return (
    <footer
      className={[
        "bg-white",
        fixed ? "fixed inset-x-0 bottom-0 z-40" : "",
      ].join(" ")}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div>
          <Logo href="/" size="sm" />
          <p className="mt-3 max-w-xs text-sm text-muted">
            Creator tips built for Africa — one link, local payments, payouts that reach your bank.
          </p>
        </div>

        <div className="flex flex-wrap gap-10 text-sm">
          <div>
            <p className="font-semibold text-ink">Product</p>
            <ul className="mt-3 space-y-2 text-muted">
              <li>
                <Link href="/sign-up" className="hover:text-ink">
                  Start my page
                </Link>
              </li>
              <li>
                <Link href="/sign-in" className="hover:text-ink">
                  Log in
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-ink">Company</p>
            <ul className="mt-3 space-y-2 text-muted">
              <li>
                <a href="#markets" className="hover:text-ink">
                  Markets
                </a>
              </li>
              <li>
                <a href="#creators" className="hover:text-ink">
                  For creators
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="py-5 text-center text-xs text-muted">
        © {new Date().getFullYear()} TribeTip Africa
      </div>
    </footer>
  );
}
