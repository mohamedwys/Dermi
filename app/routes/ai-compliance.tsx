import type { MetaFunction } from "@remix-run/node";
import { AICompliance } from "./../components/legal/AICompliance";

export const meta: MetaFunction = () => {
  return [
    { title: "AI Compliance | ShopiBot" },
    { name: "description", content: "AI Compliance information for ShopiBot" },
  ];
};

export default function AIComplianceRoute() {
  return <AICompliance />;
}