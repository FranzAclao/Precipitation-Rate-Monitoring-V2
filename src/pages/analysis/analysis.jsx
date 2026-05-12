import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";
import {
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

const PREDICTION_API_URL = "http://127.0.0.1:8001/predict/latest";
const REFRESH_INTERVAL_MS = 30000;

function toNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function formatCm(value) {
  const number = toNumber(value);
  return number === null ? "--" : `${number.toFixed(2)} cm`;
}

function formatValue(value) {
  return value === null || value === undefined || value === "" ? "--" : value;
}

function formatMinutes(value) {
  const number = toNumber(value);
  return number === null ? "--" : `${number} min`;
}

function getRiskConfig(riskStatus) {
  const normalizedRisk = String(riskStatus || "").toLowerCase();

  if (normalizedRisk === "critical") {
    return {
      label: "Critical",
      subtitle: "Critical downstream water level predicted.",
      alertTitle: "Critical Flood Warning",
      alertMessage: "The LSTM model predicts a critical downstream water level. Immediate monitoring and response are recommended.",
      alertClassName: "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-900/50",
      iconClassName: "text-red-600",
      titleClassName: "text-red-800 dark:text-red-200",
      descriptionClassName: "text-red-700 dark:text-red-200/80",
    };
  }

  if (normalizedRisk === "warning") {
    return {
      label: "Warning",
      subtitle: "Water level may require monitoring.",
      alertTitle: "Water Level Warning",
      alertMessage: "The LSTM model predicts elevated downstream water level. Continue monitoring Node 2 conditions.",
      alertClassName: "bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-900/50",
      iconClassName: "text-orange-600",
      titleClassName: "text-orange-800 dark:text-orange-200",
      descriptionClassName: "text-orange-700 dark:text-orange-200/80",
    };
  }

  return {
    label: normalizedRisk === "normal" ? "Normal" : formatValue(riskStatus),
    subtitle: "Water level is within normal range.",
    alertTitle: "Water Level Normal",
    alertMessage: "The LSTM model indicates the downstream water level is within the normal range.",
    alertClassName: "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-900/50",
    iconClassName: "text-green-600",
    titleClassName: "text-green-800 dark:text-green-200",
    descriptionClassName: "text-green-700 dark:text-green-200/80",
  };
}

export default function Analysis() {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    let activeController = null;

    async function fetchPrediction({ showLoading = false } = {}) {
      activeController?.abort();
      activeController = new AbortController();

      if (showLoading) setLoading(true);
      if (!showLoading) setRefreshing(true);
      setError("");

      try {
        const response = await fetch(PREDICTION_API_URL, {
          signal: activeController.signal,
        });

        if (!response.ok) {
          throw new Error(`Prediction backend returned ${response.status}`);
        }

        const data = await response.json();
        if (!isMounted) return;

        setPrediction(data || {});
      } catch (err) {
        if (err.name === "AbortError" || !isMounted) return;
        setError("Prediction backend is offline or unavailable.");
      } finally {
        if (isMounted) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    }

    fetchPrediction({ showLoading: true });
    const refreshId = window.setInterval(fetchPrediction, REFRESH_INTERVAL_MS);

    return () => {
      isMounted = false;
      activeController?.abort();
      window.clearInterval(refreshId);
    };
  }, []);

  const currentNode1 = prediction?.current_water_level_n1;
  const currentNode2 = prediction?.current_water_level_n2;
  const predictedNode2 = prediction?.predicted_water_level_n2_5min_ahead;
  const latestTimestamp = prediction?.latest_timestamp;
  const predictionTimestamp = prediction?.prediction_timestamp;
  const modelInfo = prediction?.model_info || {};
  const riskConfig = getRiskConfig(prediction?.risk_status);

  const predictionData = useMemo(() => {
    const current = toNumber(currentNode2);
    const predicted = toNumber(predictedNode2);

    return [
      { time: "Current", level: current },
      { time: "+5 min", level: predicted },
    ].filter((item) => item.level !== null);
  }, [currentNode2, predictedNode2]);

  const predictedReference = toNumber(predictedNode2);
  const showData = !loading && !error;

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <p className="text-muted-foreground">
            Neural Network Forecast (LSTM Model) based on Node 1 & Node 2 telemetry.
          </p>
          {loading && (
            <p className="text-xs font-bold uppercase text-muted-foreground mt-2">
              Loading latest LSTM prediction...
            </p>
          )}
          {refreshing && !loading && (
            <p className="text-xs font-bold uppercase text-muted-foreground mt-2">
              Refreshing latest LSTM prediction...
            </p>
          )}
          {error && (
            <p className="text-xs font-bold uppercase text-red-500 mt-2">
              {error}
            </p>
          )}
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-t-4 border-t-purple-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase text-muted-foreground">Forecast Reliability</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{loading ? "--" : "Moderate"}</div>
              <p className="text-xs text-muted-foreground mt-1">Model R²: 65.54%</p>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-red-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase text-muted-foreground">Projected Peak</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl lg:text-3xl font-bold text-foreground">Predicted Node 2: {formatCm(showData ? predictedNode2 : null)}</div>
              <p className="text-xs text-red-500 font-bold mt-1">Expected at {formatValue(showData ? predictionTimestamp : null)}</p>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase text-muted-foreground">Risk Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl lg:text-3xl font-bold text-foreground">Risk Status: {showData ? riskConfig.label : "--"}</div>
              <p className="text-xs text-muted-foreground mt-1">{showData ? riskConfig.subtitle : "Waiting for prediction data."}</p>
            </CardContent>
          </Card>
        </div>

        {/* MAIN CHART SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 shadow-sm">
            <CardHeader>
              <CardTitle>Node 2 Water Level Forecast</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={predictionData} margin={{ top: 10, right: 20, left: 24, bottom: 10 }}>
                  <defs>
                    <linearGradient id="colorLevel" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="time" />
                  <YAxis
                    width={90}
                    domain={["auto", "auto"]}
                    tickFormatter={(value) => `${Number(value).toFixed(2)} cm`}
                  />
                  <Tooltip formatter={(value) => [`${Number(value).toFixed(2)} cm`, "Water Level"]} />
                  {predictedReference !== null && (
                    <ReferenceLine y={predictedReference} label="Predicted" stroke="red" strokeDasharray="3 3" />
                  )}
                  <Area type="monotone" dataKey="level" stroke="#8884d8" fillOpacity={1} fill="url(#colorLevel)" />
                  <Line type="monotone" dataKey="level" stroke="#8b5cf6" strokeWidth={3} dot={{r: 4}} />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Alert className={error ? "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-900/50" : riskConfig.alertClassName}>
              <AlertTriangle className={`h-4 w-4 ${error ? "text-red-600" : riskConfig.iconClassName}`} />
              <AlertTitle className={`${error ? "text-red-800 dark:text-red-200" : riskConfig.titleClassName} font-bold`}>
                {error ? "Prediction Backend Offline" : riskConfig.alertTitle}
              </AlertTitle>
              <AlertDescription className={`${error ? "text-red-700 dark:text-red-200/80" : riskConfig.descriptionClassName} text-xs mt-1`}>
                {error ? "Start the local FastAPI LSTM backend and make sure /predict/latest is reachable." : riskConfig.alertMessage}
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Model Inputs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500"/> Current Node 1</span>
                  <span className="font-bold">{formatCm(showData ? currentNode1 : null)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500"/> Current Node 2</span>
                  <span className="font-bold">{formatCm(showData ? currentNode2 : null)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-blue-500"/> Predicted Node 2</span>
                  <span className="font-bold">{formatCm(showData ? predictedNode2 : null)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Latest timestamp</span>
                  <span className="font-bold text-right">{formatValue(showData ? latestTimestamp : null)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Prediction timestamp</span>
                  <span className="font-bold text-right">{formatValue(showData ? predictionTimestamp : null)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Model type</span>
                  <span className="font-bold">{formatValue(showData ? modelInfo.model_type : null)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">History window</span>
                  <span className="font-bold">{formatMinutes(showData ? modelInfo.history_window_minutes : null)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Prediction horizon</span>
                  <span className="font-bold">{formatMinutes(showData ? modelInfo.prediction_horizon_minutes : null)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
