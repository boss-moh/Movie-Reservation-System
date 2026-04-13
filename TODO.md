# 🎬 Movie Reservation System - High Level Todo List

- [ ] **Phase 1: Project Setup & Foundation**
  - Initialize the Node/Express app, install dependencies, and set up `.env` configuration.

- [ ] **Phase 2: Database & Models**
  - Set up ORM (Prisma or Sequelize) and define all SQL tables (Users, Movies, Halls, Seats, Reservations, etc.).

- [ ] **Phase 3: Initial Data Seeding**
  - Populate the DB with starting data (Halls, pre-defined Seats, Genres, and an initial Admin user).

- [ ] **Phase 4: Global Middleware**
  - Implement error handling, JSON validation (Zod/Joi), and file upload settings (Multer).

- [ ] **Phase 5: Authentication**
  - Implement Registration, Login, and JWT (Access & Refresh tokens) security protocols.

- [ ] **Phase 6: Movies & Genres APIs**
  - Build out the public endpoints to browse movies, and the Admin endpoints to create/edit/delete movies.

- [ ] **Phase 7: Showtimes API**
  - Set up the scheduling endpoints to assign movies to halls at specific dates & times.

- [ ] **Phase 8: Seats & Reservations Engine**
  - Build the core reservation logic utilizing DB transactions to securely book seats and prevent double-booking.

- [ ] **Phase 9: Admin Reports & Users**
  - Add endpoints for admins to view revenue/capacity statistics and promote ordinary users to admin.

- [ ] *(Optional)* **Phase 10: Enhancements**
  - Add feature polish such as Stripe (payments), Nodemailer (receipts), and QR-coded ticket generation.
