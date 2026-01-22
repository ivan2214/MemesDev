import { format } from "date-fns";
import { es } from "date-fns/locale";

export const ToTitleCase = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const formatDate = (date: Date) => {
  const descriptive = format(date, "'El' d 'de' MMMM 'de' yyyy", {
    locale: es,
  });
  const numeric = format(date, "dd/MM/yyyy", { locale: es });
  return `${descriptive} (${numeric})`;
};
