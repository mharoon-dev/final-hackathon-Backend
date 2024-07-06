import express from "express";
import { add, deleteSlot, getSlots, } from "../controller/slotController.js";

export const slotRoutes = express.Router();

// add
// POST http://localhost:9000/api/slot/add
// Public
slotRoutes.post("/add", add);

// update
// put http://localhost:9000/api/slot/update/:id
// Public
// slotRoutes.put("/update/:id", update);

// // delete
// // delete http://localhost:9000/api/slot/delete/:id
// // Public
slotRoutes.delete("/delete/:id", deleteSlot);

// get all slotes
// delete http://localhost:9000/api/slot
// Public
slotRoutes.get("/", getSlots);
