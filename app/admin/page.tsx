"use client";

import { useEffect, useState } from "react";
import { StatsCards } from "@/components/admin/dashboard/StatsCards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch stats");
        }
        return res.json();
      })
      .then((data) => {
        if (data.error) {
          console.error("Stats error:", data.error);
          setLoading(false);
          return;
        }
        setStats(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Fetch error:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-32 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">لوحة التحكم</h1>
          <p className="text-muted-foreground">
            نظرة عامة على إحصائيات النظام والأداء
          </p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              <p className="mb-2">حدث خطأ أثناء تحميل البيانات</p>
              <p className="text-sm">
                يرجى التحقق من اتصال قاعدة البيانات وإعدادات Supabase
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Prepare data for charts
  const trackData = Object.entries(stats.distributions.tracks || {}).map(
    ([name, value]) => ({
      name,
      value,
    })
  );

  const resultData = Object.entries(stats.distributions.results || {}).map(
    ([name, value]) => ({
      name,
      value,
    })
  );

  const leadsTrendData = Object.entries(stats.trends.leads || {})
    .map(([date, count]) => ({
      date: new Date(date).toLocaleDateString("ar-SA", {
        month: "short",
        day: "numeric",
      }),
      leads: count,
    }))
    .slice(-14); // Last 14 days

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">لوحة التحكم</h1>
        <p className="text-muted-foreground">
          نظرة عامة على إحصائيات النظام والأداء
        </p>
      </div>

      <StatsCards stats={stats.stats} />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Track Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>توزيع المسارات</CardTitle>
          </CardHeader>
          <CardContent>
            {trackData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={trackData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {trackData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                لا توجد بيانات
              </div>
            )}
          </CardContent>
        </Card>

        {/* Result Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>توزيع النتائج</CardTitle>
          </CardHeader>
          <CardContent>
            {resultData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={resultData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                لا توجد بيانات
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Leads Trend */}
      <Card>
        <CardHeader>
          <CardTitle>اتجاهات الزبائن المحتملين</CardTitle>
        </CardHeader>
        <CardContent>
          {leadsTrendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={leadsTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="leads"
                  stroke="#8884d8"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
              لا توجد بيانات
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
