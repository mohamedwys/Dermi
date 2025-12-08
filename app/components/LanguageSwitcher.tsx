import { Form } from "@remix-run/react";

interface LanguageSwitcherProps {
  locale: string; // matches prop from loader
}

export function LanguageSwitcher({ locale }: LanguageSwitcherProps) {
  return (
    <Form method="post" action="/app/change-locale">
      <select
        name="locale"
        defaultValue={locale}
        onChange={(e) => e.currentTarget.form?.submit()}
      >
        <option value="en">English</option>
        <option value="fr">Français</option>
        <option value="es">Español</option>
      </select>
    </Form>
  );
}
