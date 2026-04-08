import { PORT } from "@/config/index";

import app from "@/app";
import prisma from "./libs/prisma";

const startServer = async () => {
  try {
  
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Access the API at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    prisma.$disconnect();
    process.exit(1);
  }
};


startServer();