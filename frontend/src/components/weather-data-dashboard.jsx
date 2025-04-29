"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Alert, AlertDescription, AlertTitle } from "./ui/alert"
import { useToast } from "../hooks/use-toast"
import { AlertCircle } from "lucide-react"

// Sample data based on the provided format
const sampleData = [
  {
    id: 1,
    date: "14/04/2025",
    timestamp: "22:19:31",
    temperature: 33.04,
    altitude: 298.11,
    pressure: 977.95,
    hasTemperatureAlert: false,
    hasAltitudeAlert: false,
  },
  {
    id: 2,
    date: "14/04/2025",
    timestamp: "22:19:42",
    temperature: 33.49,
    altitude: 297.48,
    pressure: 978.03,
    hasTemperatureAlert: false,
    hasAltitudeAlert: false,
  },
  {
    id: 3,
    date: "14/04/2025",
    timestamp: "22:19:51",
    temperature: 33.51,
    altitude: 297.67,
    pressure: 978.0,
    hasTemperatureAlert: false,
    hasAltitudeAlert: false,
  },
  // Additional sample data with alerts
  {
    id: 4,
    date: "14/04/2025",
    timestamp: "22:20:02",
    temperature: 35.8, // Sudden temperature increase
    altitude: 297.7,
    pressure: 978.05,
    hasTemperatureAlert: true,
    hasAltitudeAlert: false,
  },
  {
    id: 5,
    date: "14/04/2025",
    timestamp: "22:20:13",
    temperature: 35.85,
    altitude: 301.5, // Sudden altitude increase
    pressure: 977.8,
    hasTemperatureAlert: false,
    hasAltitudeAlert: true,
  },
  {
    id: 6,
    date: "14/04/2025",
    timestamp: "22:20:24",
    temperature: 32.1, // Sudden temperature decrease
    altitude: 301.55,
    pressure: 977.75,
    hasTemperatureAlert: true,
    hasAltitudeAlert: false,
  },
]

// Constants for alert thresholds
const TEMPERATURE_THRESHOLD = 1.5 // Celsius
const ALTITUDE_THRESHOLD = 2.0 // meters

export function WeatherDataDashboard() {
  const [weatherData, setWeatherData] = useState([])
  const [alerts, setAlerts] = useState([])
  const { toast } = useToast()

  // Function to check for sudden changes and generate alerts
  const processData = (data) => {
    if (data.length < 2) return data

    const processedData = [...data]
    const newAlerts = []

    // Start from the second entry to compare with previous
    for (let i = 1; i < processedData.length; i++) {
      const current = processedData[i]
      const previous = processedData[i - 1]

      // Check for temperature change
      const tempDiff = Math.abs(current.temperature - previous.temperature)
      if (tempDiff > TEMPERATURE_THRESHOLD) {
        processedData[i].hasTemperatureAlert = true
        const direction = current.temperature > previous.temperature ? "increase" : "decrease"
        const message = `Sudden temperature ${direction} detected: ${previous.temperature.toFixed(2)}°C → ${current.temperature.toFixed(2)}°C (${tempDiff.toFixed(2)}°C change)`
        newAlerts.push({ message, timestamp: `${current.date} ${current.timestamp}` })

        // Show toast notification
        toast({
          title: "Temperature Alert",
          description: message,
          variant: "destructive",
        })
      }

      // Check for altitude change
      const altDiff = Math.abs(current.altitude - previous.altitude)
      if (altDiff > ALTITUDE_THRESHOLD) {
        processedData[i].hasAltitudeAlert = true
        const direction = current.altitude > previous.altitude ? "increase" : "decrease"
        const message = `Sudden altitude ${direction} detected: ${previous.altitude.toFixed(2)}m → ${current.altitude.toFixed(2)}m (${altDiff.toFixed(2)}m change)`
        newAlerts.push({ message, timestamp: `${current.date} ${current.timestamp}` })

        // Show toast notification
        toast({
          title: "Altitude Alert",
          description: message,
          variant: "destructive",
        })
      }
    }

    setAlerts((prev) => [...prev, ...newAlerts])
    return processedData
  }

  // Load and process data
  useEffect(() => {
    // In a real application, you would fetch data from an API
    // For this example, we're using the sample data
    const processedData = processData(sampleData)
    setWeatherData(processedData)
  }, [])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Weather Station Data</CardTitle>
          <CardDescription>Real-time temperature, altitude, and pressure readings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Temperature (°C)</TableHead>
                  <TableHead>Altitude (m)</TableHead>
                  <TableHead>Pressure (hPa)</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {weatherData.map((entry) => (
                  <TableRow
                    key={entry.id}
                    className={
                      entry.hasTemperatureAlert || entry.hasAltitudeAlert ? "bg-red-50 dark:bg-red-950/20" : ""
                    }
                  >
                    <TableCell>{entry.date}</TableCell>
                    <TableCell>{entry.timestamp}</TableCell>
                    <TableCell className={entry.hasTemperatureAlert ? "font-bold text-red-600 dark:text-red-400" : ""}>
                      {entry.temperature.toFixed(2)}
                    </TableCell>
                    <TableCell className={entry.hasAltitudeAlert ? "font-bold text-red-600 dark:text-red-400" : ""}>
                      {entry.altitude.toFixed(2)}
                    </TableCell>
                    <TableCell>{entry.pressure.toFixed(2)}</TableCell>
                    <TableCell>
                      {entry.hasTemperatureAlert || entry.hasAltitudeAlert ? (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Alert
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400"
                        >
                          Normal
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Alert History</CardTitle>
          <CardDescription>Recent alerts for significant changes in readings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {alerts.length > 0 ? (
              alerts.map((alert, index) => (
                <Alert key={index} variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Alert at {alert.timestamp}</AlertTitle>
                  <AlertDescription>{alert.message}</AlertDescription>
                </Alert>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">No alerts detected</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
