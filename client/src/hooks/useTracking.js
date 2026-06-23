import { useQuery, useMutation } from '@tanstack/react-query'
import { getLocation, getAllLocations, updateLocation } from '../services/trackingService.js'

export const useAllLocations = () => {
  return useQuery({
    queryKey: ['locations'],
    queryFn: getAllLocations,
    refetchInterval: 30000
  })
}

export const useLocation = (loadId) => {
  return useQuery({
    queryKey: ['location', loadId],
    queryFn: () => getLocation(loadId),
    enabled: !!loadId,
    refetchInterval: 10000
  })
}

export const useUpdateLocation = () => {
  return useMutation({
    mutationFn: updateLocation
  })
}