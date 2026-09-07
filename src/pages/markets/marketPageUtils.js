import { useCallback, useEffect, useState } from "react";
import { toList } from "../../components/market/MarketComponents";

export function useMarketList(loader, initialFilters = {}, ready = true) {
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [errorStatus, setErrorStatus] = useState(null);
  const load = useCallback(async () => {
    if (!ready) return;
    setLoading(true);
    setError("");
    setErrorStatus(null);
    try {
      setData(toList(await loader(filters)));
    } catch (err) {
      setErrorStatus(err.response?.status || null);
      setError(err.response?.data?.detail || "Impossible de charger les données.");
    } finally {
      setLoading(false);
    }
  }, [loader, filters, ready]);
  useEffect(() => {
    load();
  }, [load]);
  return { data, setData, filters, setFilters, loading, error, errorStatus, load };
}

export const filterChange = (setFilters) => (name, value) => setFilters((current) => ({ ...current, [name]: value }));
