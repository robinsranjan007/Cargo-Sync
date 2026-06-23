import { trackingAPI } from './api.js'

export const updateLocation = async (data) => {
  const res = await trackingAPI.post('/location', data)
  return res.data
}

export const getLocation = async (loadId) => {
  const res = await trackingAPI.get(`/location/${loadId}`)
  return res.data
}

export const getAllLocations = async () => {
  const res = await trackingAPI.get('/locations')
  return res.data
}