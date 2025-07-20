import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function PerformancePage() {
  return (
    <div>
      <div className="pb-4">
        <h1 className="text-3xl font-bold font-headline">Performance</h1>
        <p className="text-muted-foreground">
          Track OKRs, manage reviews, and analyze skill gaps.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Performance Management</CardTitle>
          <CardDescription>
            This section is under construction. Check back soon for performance tracking features.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">Coming Soon</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
