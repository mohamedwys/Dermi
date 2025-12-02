import type { MetaFunction } from "@remix-run/node";
import { PrivacyPolicy } from "./../components/legal/PrivacyPolicy";

export const meta: MetaFunction = () => {
  return [
    { title: "Privacy Policy | ShopiBot" },
    { name: "description", content: "Privacy Policy for ShopiBot" },
  ];
};

export default function PrivacyPolicyRoute() {
  return <PrivacyPolicy />;
}