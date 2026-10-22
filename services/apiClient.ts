import axios from 'axios'
import { withVisitorIdHeader } from './visitorId'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use(withVisitorIdHeader)
