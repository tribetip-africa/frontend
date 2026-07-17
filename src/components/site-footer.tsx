import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { isSignInOpen, isSignupOpen, primaryLaunchCta } from "@/lib/launch-mode";

type SiteFooterProps = {
  fixed?: boolean;
};

export function SiteFooter({ fixed = false }: SiteFooterProps) {
  const launchCta = primaryLaunchCta();
  const signupOpen = isSignupOpen();
  const signInOpen = isSignInOpen();

  return (
    <footer
      className={[
        "border-t border-line bg-background",
        fixed ? "fixed inset-x-0 bottom-0 z-40" : "",
      ].join(" ")}
    >
      <div className="mx-auto flex max-w-landing flex-col gap-8 px-4 py-12 sm:px-6 md:flex-row md:items-start md:justify-between">
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
              {signupOpen ? (
                <>
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
                </>
              ) : (
                <>
                  {signInOpen && (
                    <li>
                      <Link href="/sign-in" className="hover:text-ink">
                        Log in
                      </Link>
                    </li>
                  )}
                  {launchCta ? (
                    <li>
                      <Link href={launchCta.href} className="hover:text-ink">
                        {launchCta.label}
                      </Link>
                    </li>
                  ) : (
                    <li className="text-muted">Launching soon</li>
                  )}
                </>
              )}
            </ul>
          </div>
          <div>
            <p className="font-semibold text-ink">Company</p>
            <ul className="mt-3 space-y-2 text-muted">
              <li>
                <Link href="/#markets" className="hover:text-ink">
                  Markets
                </Link>
              </li>
              <li>
                <Link href="/for-creators" className="hover:text-ink">
                  For creators
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-ink">Support</p>
            <ul className="mt-3 space-y-2 text-muted">
              <li>
                <Link href="/faq" className="hover:text-ink">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-ink">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-ink">
                  Privacy Policy
                </Link>
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
