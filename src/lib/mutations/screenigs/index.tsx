import { useMutation } from "@tanstack/react-query";
import { axios } from "@/lib/request/axios";

export function useCreateScreening() {
  return useMutation({
    mutationFn: async (data) => {
      const req = await axios.post("/api/screenings", data);
      return req.data;
    },
  });
}
