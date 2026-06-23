import { useMutation, useQuery } from '@tanstack/react-query'
import { uploadDocument, getPresignedUrl } from '../services/documentService.js'

export const useUploadDocument = () => {
  return useMutation({
    mutationFn: uploadDocument
  })
}

export const usePresignedUrl = (key) => {
  return useQuery({
    queryKey: ['presigned', key],
    queryFn: () => getPresignedUrl(key),
    enabled: !!key,
    staleTime: 50 * 60 * 1000
  })
}