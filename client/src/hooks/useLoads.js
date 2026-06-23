import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getLoads, getLoadById, createLoad, updateLoadStatus, assignCarrier } from '../services/loadService.js'



export const useLoads = (params = {}) => {
  return useQuery({
    queryKey: ['loads', params],
    queryFn: () => getLoads(params)
  })
}

export const useLoad = (id) => {
  return useQuery({
    queryKey: ['load', id],
    queryFn: () => getLoadById(id),
    enabled: !!id
  })
}

export const useCreateLoad = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createLoad,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loads'] })
    }
  })
}

export const useUpdateLoadStatus = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateLoadStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loads'] })
    }
  })
}

export const useAssignCarrier = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: assignCarrier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loads'] })
    }
  })
}