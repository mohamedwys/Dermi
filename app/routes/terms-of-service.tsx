import type { MetaFunction } from "@remix-run/node";
import { TermsOfService } from "./../components/legal/TermsOfService";

export const meta: MetaFunction = () => {
  return [
    { title: "Terms of Service | ShopiBot" },
    { name: "description", content: "Terms of Service for ShopiBot" },
  ];
};

export default function TermsOfServiceRoute() {
  return <TermsOfService />;
}