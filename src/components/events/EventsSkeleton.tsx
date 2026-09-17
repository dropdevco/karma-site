export function EventsSkeleton() {
  return (
    <div className="mt-2 grid gap-4 py-4 sm:grid-cols-2" aria-hidden="true">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="grid grid-cols-[6rem_1fr] overflow-hidden rounded-card border border-karma-tan-dark/25 bg-white sm:grid-cols-[7rem_1fr]"
        >
          <div className="h-32 animate-pulse bg-karma-tan-light" />
          <div className="flex flex-col gap-3 p-4">
            <div className="h-3 w-20 animate-pulse rounded-full bg-karma-tan-light" />
            <div className="h-5 w-3/4 animate-pulse rounded-full bg-karma-tan-light" />
            <div className="h-3 w-1/2 animate-pulse rounded-full bg-karma-tan-light" />
            <div className="h-6 w-24 animate-pulse rounded-full bg-karma-tan-light" />
          </div>
        </div>
      ))}
    </div>
  )
}
