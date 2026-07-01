import { useGrowthContext }
  from "../components/GrowthProvider";

export function useLocale() {
  return useGrowthContext();
}
