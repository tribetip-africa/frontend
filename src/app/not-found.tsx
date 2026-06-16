import { ErrorPage } from "@/components/errors/error-page";
import { getNotFoundContent } from "@/lib/error-pages";

export default function NotFound() {
  return <ErrorPage {...getNotFoundContent()} />;
}
