import Link from 'next/link'

interface PaginationProps {
  currentPage: number
  totalPages: number
  basePath: string // məs: '/companies'
}

export default function Pagination({ currentPage, totalPages, basePath }: PaginationProps) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      {currentPage > 1 && (
        <Link
          href={`${basePath}${basePath.includes('?') ? '&' : '?'}page=${currentPage - 1}`}
          className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors"
        >
          &larr; Əvvəlki
        </Link>
      )}

      <span className="px-4 py-2 text-sm text-muted-foreground">
        Səhifə {currentPage} / {totalPages}
      </span>

      {currentPage < totalPages && (
        <Link
          href={`${basePath}${basePath.includes('?') ? '&' : '?'}page=${currentPage + 1}`}
          className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors"
        >
          Növbəti &rarr;
        </Link>
      )}
    </div>
  )
}
