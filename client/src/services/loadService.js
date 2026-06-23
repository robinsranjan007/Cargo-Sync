import { loadsAPI } from './api.js'

export const getLoads = async (params = {}) => {
  const res = await loadsAPI.get('/', { params })
  return res.data
}

export const getLoadById = async (id) => {
  const res = await loadsAPI.get(`/${id}`)
  return res.data
}

export const createLoad = async (data) => {
  const res = await loadsAPI.post('/', data)
  return res.data
}

export const updateLoadStatus = async ({ id, status, note }) => {
  const res = await loadsAPI.patch(`/${id}/status`, { status, note })
  return res.data
}

export const assignCarrier = async ({ id, ...data }) => {
  const res = await loadsAPI.patch(`/${id}/carrier`, data)
  return res.data
}