import { ReactNode } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface SectionCardProps {
  title: string
  subtitle?: string
  children: ReactNode
  cta?: ReactNode
}

export function SectionCard({ title, subtitle, children, cta }: SectionCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {subtitle && <CardDescription>{subtitle}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
        {cta && <div className="pt-2">{cta}</div>}
      </CardContent>
    </Card>
  )
}

