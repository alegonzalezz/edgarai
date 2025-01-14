import Link from "next/link"

interface BreadcrumbItem {
  label: string
  href: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex space-x-2">
      {items.map((item, index) => (
        <span key={index}>
          <Link href={item.href} className="text-blue-600 hover:underline">
            {item.label}
          </Link>
          {index < items.length - 1 && <span> / </span>}
        </span>
      ))}
    </nav>
  )
} 