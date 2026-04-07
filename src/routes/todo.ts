import { Router } from "express";

import {
  createTodoController,
  deleteTodoController,
  getAllTodosController,
  getTodoByIdController,
  updateTodoController,
} from "@/controllers";
import { validator } from "@/middleware";
import { createTodoRules, editTodoRules, idRules } from "@/utils";

const router = Router();

// GET all todos
router.get("/", getAllTodosController);

// GET todo by id
router.get("/:id", idRules(), validator, getTodoByIdController);

// POST create todo
router.post("/", createTodoRules(), validator, createTodoController);

// PUT update todo
router.put("/:id", idRules(), editTodoRules(), validator, updateTodoController);

// DELETE todo
router.delete("/:id", idRules(), validator, deleteTodoController);

export default router;
