import mongoose, { InferSchemaType, Schema } from "mongoose";

const todoSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    completed: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    dueDate: {
      type: Date,
    },
  },
  {
    timestamps: true, // auto adds createdAt and updatedAt
  },
);

const TodoUtils = mongoose.model("Todo", todoSchema);

type TodoType = InferSchemaType<typeof todoSchema>;

export { TodoUtils };
export type { TodoType };
