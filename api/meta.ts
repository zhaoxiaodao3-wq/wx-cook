import { request } from '@/api/request'

export interface FilterMeta {
  categories: { key: string; label: string }[]
  cuisines: string[]
  tags: string[]
  difficulties: string[]
}

export function fetchFilterMeta() {
  return request<FilterMeta>({
    url: '/meta/filters',
    auth: false,
  })
}
