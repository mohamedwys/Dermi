import type { MetaFunction } from "@remix-run/node";
import { CookiePolicy } from "./../components/legal/CookiePolicy";

export const meta: MetaFunction = () => {
  return [
    { title: "Cookie Policy | ShopiBot" },
    { name: "description", content: "Cookie Policy for ShopiBot" },
  ];
};

export default function CookiePolicyRoute() {
  return <CookiePolicy />;
}