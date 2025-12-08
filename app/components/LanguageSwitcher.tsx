import { Form } from "@remix-run/react";

interface LanguageSwitcherProps {
  currentLocale: string; // must match prop name
}

export function LanguageSwitcher({ currentLocale }: LanguageSwitcherProps) {
  return (
    <Form method="post" action="/app/change-locale">
      <select
        name="locale"
        defaultValue={currentLocale}
        onChange={(e) => e.currentTarget.form?.submit()}
      >
        <option value="en">English</option>
        <option value="fr">Français</option>
        <option value="es">Español</option>
      </select>
    </Form>
  );
}
