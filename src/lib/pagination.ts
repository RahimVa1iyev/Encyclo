export const DEFAULT_PER_PAGE = 12

export function getPaginationParams(searchParams: { [key: string]: string | string[] | undefined }) {
  const page = Math.max(1, parseInt(searchParams.page as string) || 1)
  const perPage = Math.min(50, Math.max(1, parseInt(searchParams.per_page as string) || DEFAULT_PER_PAGE))
  const from = (page - 1) * perPage
  const to = from + perPage - 1
  return { page, perPage, from, to }
}

export function getTotalPages(totalCount: number, perPage: number) {
  return Math.ceil(totalCount / perPage)
}
