import { useMemo } from "react";

export default function useMemoizedValue(factory, deps) {
  return useMemo(factory, deps);
}
