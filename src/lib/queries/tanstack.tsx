import { useQuery } from "@tanstack/react-query";
import { axios } from "../request/axios";

export function getScreeningsQuery() {
  return useQuery({
    queryKey: ["screenings"],
    queryFn: async () => {
      const response = await axios.get("/api/screenings");
    },
  });
}
