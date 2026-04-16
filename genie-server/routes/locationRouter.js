import express from "express";
import { getCity, getCountries, getLocationById, getStates, updateLocation } from "../controller/locationController.js";

const locationRouter = express.Router();

locationRouter.get("/location/:userId", getLocationById);
locationRouter.put("/location/:userId", updateLocation);
locationRouter.get("/fetch-countries", getCountries);
locationRouter.get("/fetch-states", getStates);
locationRouter.get("/fetch-city", getCity);

export default locationRouter;