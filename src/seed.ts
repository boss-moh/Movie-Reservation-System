import { faker } from "@faker-js/faker";
import { prisma } from "@/libs/prisma";

async function seed() {
  try {
    console.log("Connected to DB — seeding...");

    // Clear existing data (optional but good practice to prevent duplicates)
    console.log("Clearing existing data...");
    await prisma.reservedSeat.deleteMany();
    await prisma.reservation.deleteMany();
    await prisma.showtime.deleteMany();
    await prisma.seat.deleteMany();
    await prisma.hall.deleteMany();
    await prisma.movie.deleteMany();
    await prisma.user.deleteMany();

    // Create Users
    console.log("Seeding Users...");
    const users = [];
    for (let i = 0; i < 5; i++) {
        const user = await prisma.user.create({
            data: {
                name: faker.person.fullName(),
                email: faker.internet.email(),
                hashPassword: faker.internet.password(),
                keyForHashing: faker.string.uuid(),
                role: i === 0 ? "ADMIN" : "USER" // First user is admin
            }
        });
        users.push(user);
    }

    // Create Halls
    console.log("Seeding Halls...");
    const halls = [];
    for (let i = 0; i < 3; i++) {
        const hall = await prisma.hall.create({
            data: {
                name: `Hall ${faker.string.alpha(1).toUpperCase()}`,
                seatsNumber: 30
            }
        });
        halls.push(hall);
    }

    // Create Seats for Halls
    console.log("Seeding Seats...");
    const seats = [];
    for (const hall of halls) {
        const rows = ["A", "B", "C"];
        for (const row of rows) {
            for (let num = 1; num <= 10; num++) {
                const seat = await prisma.seat.create({
                    data: {
                        hallId: hall.id,
                        row,
                        number: num,
                        type: num > 8 ? "VIP" : "STANDARD"
                    }
                });
                seats.push(seat);
            }
        }
    }

    // Create Movies
    console.log("Seeding Movies...");
    const movies = [];
    for (let i = 0; i < 5; i++) {
        const movie = await prisma.movie.create({
            data: {
                title: faker.book.title(),
                description: faker.lorem.paragraph(),
                durationMinutes: faker.number.int({ min: 90, max: 180 }),
                genre: faker.music.genre(),
                posterUrl: faker.image.url()
            }
        });
        movies.push(movie);
    }

    // Create Showtimes
    console.log("Seeding Showtimes...");
    const showtimes = [];
    for (const movie of movies) {
        for (let i = 0; i < 2; i++) {
            const hall = faker.helpers.arrayElement(halls);
            const showtime = await prisma.showtime.create({
                data: {
                    startTime: faker.date.soon({ days: 7 }),
                    priceForSeat: faker.number.int({ min: 10, max: 25 }),
                    movieId: movie.id,
                    hallId: hall.id
                }
            });
            showtimes.push(showtime);
        }
    }

    // Create Reservations and Reserved Seats
    console.log("Seeding Reservations...");
    for (let i = 0; i < 10; i++) {
        const user = faker.helpers.arrayElement(users);
        const showtime = faker.helpers.arrayElement(showtimes);
        
        // Find seats for the showtime's hall
        const hallSeats = seats.filter(s => s.hallId === showtime.hallId);
        const selectedSeats = faker.helpers.arrayElements(hallSeats, faker.number.int({ min: 1, max: 4 }));
        
        const reservation = await prisma.reservation.create({
            data: {
                totalPrice: showtime.priceForSeat * selectedSeats.length,
                status: "ACTIVE",
                userId: user.id,
                showtimeId: showtime.id
            }
        });

        for (const seat of selectedSeats) {
             try {
                await prisma.reservedSeat.create({
                    data: {
                        reservationId: reservation.id,
                        seatId: seat.id
                    }
                });
             } catch (error) {
                // Ignore unique constraint errors for duplicate seat bookings in seed
             }
        }
    }

    console.log("✅ Seeding completed successfully!");
  } catch (err) {
    console.error("Seeding failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
