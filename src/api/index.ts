import cors from "cors";
import { Router } from "express";
import configLoader from "@medusajs/medusa/dist/loaders/config";
import { authenticate } from "@medusajs/medusa";
import { registerLoggedInUser } from "./middlewares/logged-in-user";

export default (rootDirectory: string) => {
  const router = Router();
  const config = configLoader(rootDirectory);

  const adminCorsOptions = {
    origin: config.projectConfig.admin_cors.split(","),
    credentials: true,
  };

  console.log("am i running 1");
  router.use(
    /\/admin\/[^(auth)].*/,
    cors(adminCorsOptions),
    authenticate(),
    registerLoggedInUser()
  );
  console.log("am i running 3");

  return router;
};
