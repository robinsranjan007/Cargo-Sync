import { documentsAPI } from './api.js'

export const uploadDocument = async (formData) => {
  const res = await documentsAPI.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  return res.data
}

export const getPresignedUrl = async (key) => {
  const res = await documentsAPI.get(`/presigned/${encodeURIComponent(key)}`)
  return res.data
}