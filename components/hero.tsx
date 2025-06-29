import Login from './login'

export default function Hero() {
  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Hero Section */}
      <section className="flex flex-1 flex-col items-center justify-between gap-10 px-6 py-10 md:flex-row md:gap-20 md:px-16">
        {/* Left Content */}
        <div className="w-full md:w-1/2">
          <h2 className="text-3xl font-bold mb-4">
            Tame the chaos of your job search
          </h2>
          <p className="mb-6 text-muted-foreground">
            A simple tool to log, track, and manage your job hunt.
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Minimal UI, fast navigation</li>
            <li>• Status tracking: Applied → Interview → Offer</li>
            <li>• Quick filters and sorting</li>
          </ul>
        </div>
        <Login />
      </section>
    </main>
  )
}
