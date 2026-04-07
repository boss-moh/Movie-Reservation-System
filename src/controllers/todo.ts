import { Request, Response } from "express";
import { TodoUtils } from "@/models";
import createEntityNotFoundError from "@/errors/EntityNotFoundError";

export const createTodoController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const todo = await TodoUtils.create(req.body);

  res.status(201).json({
    message: "Todo created successfully",
    data: todo,
  });
};

export const getAllTodosController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const todos = await TodoUtils.find();

  res.status(200).json({
    message: "Todos retrieved successfully",
    count: todos.length,
    data: todos,
  });
};

export const getTodoByIdController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { id } = req.params;
  const todo = await TodoUtils.findById(id);

  if (!todo) {
    throw createEntityNotFoundError("Todo");
  }

  res.status(200).json({ message: "Todo retrieved successfully", data: todo });
};

export const updateTodoController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { id } = req.params;

  const todo = await TodoUtils.findById(id);
  if (!todo) {
    throw createEntityNotFoundError("Todo");
  }

  todo.set(req.body);
  const updatedTodo = await todo.save();
  res
    .status(200)
    .json({ message: "Todo updated successfully", data: updatedTodo });
};

export const deleteTodoController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { id } = req.params;
  const deletedTodo = await TodoUtils.findByIdAndDelete(id);

  if (!deletedTodo) {
    throw createEntityNotFoundError("Todo");
  }

  res
    .status(200)
    .json({ message: "Todo deleted successfully", data: deletedTodo });
};

export const toggleTodoCompletionController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { id } = req.params;
  const todo = await TodoUtils.findById(id);

  if (!todo) {
    throw createEntityNotFoundError("Todo");
  }

  todo.completed = !todo.completed;
  const updatedTodo = await todo.save();
  res.status(200).json({
    message: "Todo completion status toggled successfully",
    data: updatedTodo,
  });
};
