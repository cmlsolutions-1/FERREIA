"use client"

import { Bar, BarChart, CartesianGrid, XAxis, Cell, Pie, PieChart } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { SALES_CHART, CATEGORY_SALES } from "@/lib/data"

const salesConfig = {
  ventas: { label: "Ventas", color: "var(--chart-1)" },
  compras: { label: "Compras", color: "var(--chart-2)" },
}

const pieColors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"]

const categoryConfig = CATEGORY_SALES.reduce(
  (acc, c, i) => {
    acc[c.name] = { label: c.name, color: pieColors[i % pieColors.length] }
    return acc
  },
  {} as Record<string, { label: string; color: string }>,
)

export function DashboardCharts() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Ventas vs. Compras</CardTitle>
          <CardDescription>Millones de pesos (COP) por mes</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={salesConfig} className="h-[280px] w-full">
            <BarChart data={SALES_CHART} accessibilityLayer>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="mes" tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="ventas" fill="var(--color-ventas)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="compras" fill="var(--color-compras)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ventas por categoría</CardTitle>
          <CardDescription>Participación %</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={categoryConfig} className="mx-auto h-[280px] w-full">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
              <Pie data={CATEGORY_SALES} dataKey="value" nameKey="name" innerRadius={55} strokeWidth={4}>
                {CATEGORY_SALES.map((entry, i) => (
                  <Cell key={entry.name} fill={pieColors[i % pieColors.length]} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <div className="mt-2 space-y-1">
            {CATEGORY_SALES.map((c, i) => (
              <div key={c.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: pieColors[i % pieColors.length] }} />
                  {c.name}
                </span>
                <span className="font-medium text-foreground">{c.value}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
