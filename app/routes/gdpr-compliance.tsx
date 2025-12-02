import type { MetaFunction } from "@remix-run/node";
import { GDPRCompliance } from "./../components/legal/GDPRCompliance";

export const meta: MetaFunction = () => {
  return [
    { title: "GDPR Compliance | ShopiBot" },
    { name: "description", content: "GDPR Compliance information for ShopiBot" },
  ];
};

export default function GDPRComplianceRoute() {
  return <GDPRCompliance />;
}