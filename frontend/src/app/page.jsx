import { WeatherDataDashboard } from "../components/weather-data-dashboard"

export default function Home() {
  return (
    <main className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Weather Station Data Dashboard</h1>
      <WeatherDataDashboard />
    </main>
  )
}
