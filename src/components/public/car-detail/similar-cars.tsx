import { CarCard } from "@/components/public/car-card";

interface SimilarCar {
  id: string;
  name: string;
  slug: string;
  bodyType: string | null;
  minPrice: { toString(): string } | null;
  maxPrice: { toString(): string } | null;
  imageUrl: string | null;
  brand: { name: string; slug: string };
  variants: {
    id: string;
    name: string;
    fuelType: string | null;
    transmission: string | null;
    seating: number | null;
  }[];
  _count: { variants: number };
}

interface SimilarCarsProps {
  cars: SimilarCar[];
}

export function SimilarCars({ cars }: SimilarCarsProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight">Similar Cars</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Cars you might also like based on segment and budget.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cars.map((car) => (
          <CarCard
            key={car.id}
            car={{
              ...car,
              minPrice: car.minPrice ? String(car.minPrice) : null,
              maxPrice: car.maxPrice ? String(car.maxPrice) : null,
            }}
          />
        ))}
      </div>
    </div>
  );
}
