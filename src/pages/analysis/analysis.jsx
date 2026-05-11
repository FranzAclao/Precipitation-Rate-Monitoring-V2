import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Brain, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart
} from "recharts";

// Mock Prediction Data (Replace with your Python/ML output later)
const predictionData = [
  { time: "Now", level: 1.2, limit: 3.0 },
  { time: "+1h", level: 1.5, limit: 3.0 },
  { time: "+2h", level: 1.8, limit: 3.0 },
  { time: "+3h", level: 2.4, limit: 3.0 },
  { time: "+4h", level: 3.2, limit: 3.0 }, // Crosses threshold
  { time: "+5h", level: 3.5, limit: 3.0 },
  { time: "+6h", level: 3.1, limit: 3.0 },
  { time: "+7h", level: 2.8, limit: 3.0 },
];

export default function Analysis() {
  return (
    <div className="p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Brain className="h-8 w-8 text-purple-600" />
            ML Predictive Analysis
          </h1>
          <p className="text-muted-foreground">
            Neural Network Forecast (LSTM Model) based on Node 1 & Node 2 telemetry.
          </p>
        </header>

        {/* TOP METRICS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-t-4 border-t-purple-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase text-muted-foreground">Prediction Confidence</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">82.4%</div>
              <p className="text-xs text-muted-foreground mt-1">Based on last 100 iterations</p>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-red-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase text-muted-foreground">Projected Peak</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">3.5 meters</div>
              <p className="text-xs text-red-500 font-bold mt-1">Expected in +5 Hours</p>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase text-muted-foreground">Impact Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">Zone 3</div>
              <p className="text-xs text-muted-foreground mt-1">Low-lying residential area</p>
            </CardContent>
          </Card>
        </div>

        {/* MAIN CHART SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 shadow-sm">
            <CardHeader>
              <CardTitle>24-Hour Water Level Forecast</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={predictionData}>
                  <defs>
                    <linearGradient id="colorLevel" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="time" />
                  <YAxis unit="m" domain={[0, 4]} />
                  <Tooltip />
                  <ReferenceLine y={3.0} label="Critical Limit" stroke="red" strokeDasharray="3 3" />
                  <Area type="monotone" dataKey="level" stroke="#8884d8" fillOpacity={1} fill="url(#colorLevel)" />
                  <Line type="monotone" dataKey="level" stroke="#8b5cf6" strokeWidth={3} dot={{r: 4}} />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Alert className="bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-900/50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-800 dark:text-red-200 font-bold">Flood Warning Issued</AlertTitle>
              <AlertDescription className="text-red-700 dark:text-red-200/80 text-xs mt-1">
                The ML model has detected a rising trend consistent with flash flood patterns. Evacuation of Zone 3 is recommended if rain continues.
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Model Inputs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500"/> Soil Saturation</span>
                  <span className="font-bold">High (85%)</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500"/> River Flow</span>
                  <span className="font-bold">Moderate</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-blue-500"/> Rain Trend</span>
                  <span className="font-bold">Increasing</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
