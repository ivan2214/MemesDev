"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function useQueryParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const params = new URLSearchParams(searchParams.toString());

  const get = (key: string) => params.get(key);

  const getArray = (key: string) =>
    params.get(key)?.split(",").filter(Boolean) ?? [];

  const set = (key: string, value: string) => {
    params.set(key, value);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const toggleInArray = (key: string, value: string) => {
    const values = getArray(key);

    const nextValues = values.includes(value)
      ? values.filter((v) => v !== value)
      : [...values, value];

    if (nextValues.length === 0) {
      params.delete(key);
    } else {
      params.set(key, nextValues.join(","));
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const addToArray = (key: string, value: string) => {
    const values = getArray(key);
    if (!values.includes(value)) {
      params.set(key, [...values, value].join(","));
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  };

  const removeFromArray = (key: string, value: string) => {
    const values = getArray(key).filter((v) => v !== value);
    values.length ? params.set(key, values.join(",")) : params.delete(key);

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const clear = () => {
    router.replace(pathname, { scroll: false });
  };

  return {
    get,
    getArray,
    set,
    addToArray,
    removeFromArray,
    clear,
    toggleInArray,
  };
}
