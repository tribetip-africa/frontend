export type ErrorPageContent = {
  code: string;
  title: string;
  description: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
};

export function getNotFoundContent(): ErrorPageContent {
  return {
    code: "404",
    title: "Page not found",
    description:
      "The page you're looking for doesn't exist. The link may be outdated, or the creator may have changed their page.",
    primaryLabel: "Go home",
    primaryHref: "/",
    secondaryLabel: "Sign in",
    secondaryHref: "/sign-in",
  };
}

export function getErrorContent(): ErrorPageContent {
  return {
    code: "500",
    title: "Something went wrong",
    description: "We hit an unexpected error. Please try again in a moment.",
    primaryLabel: "Try again",
    primaryHref: "#retry",
    secondaryLabel: "Go home",
    secondaryHref: "/",
  };
}

export function getGlobalErrorContent(): ErrorPageContent {
  return {
    code: "Error",
    title: "Something went wrong",
    description: "The app ran into a problem. Reload the page or return to the homepage.",
    primaryLabel: "Reload page",
    primaryHref: "#reload",
    secondaryLabel: "Go home",
    secondaryHref: "/",
  };
}
