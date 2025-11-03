import { useMutation } from "@tanstack/react-query";
import { axios } from "@/lib/request/axios";

export function useCreateScreening() {
  return useMutation({
    mutationFn: async (data) => {
      const req = await axios.post("/api/screening", data);
      return req.data;
    },
  });
}
