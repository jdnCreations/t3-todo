import { api } from "~/utils/api";
import type { Todo } from "../types";
import { toast } from "react-hot-toast";

type TodoProps = {
  todo: Todo;
};

export default function Todo({ todo }: TodoProps) {
  const { id, text, done } = todo;

  const trpc = api.useContext();

  const { mutate: doneMutation } = api.todo.toggle.useMutation({
    onMutate: async ({ id, done }) => {
      // canel any outgoing refetches so they don't overwrite our optimistic update
      await trpc.todo.all.cancel();

      // snapshot previous value
      const previousTodos = trpc.todo.all.getData();

      // optimistically update to the new value
      trpc.todo.all.setData(undefined, (prev) => {
        if (!prev) return previousTodos;
        return prev.map((t) => {
          if (t.id === id) {
            return {
              ...t,
              done,
            };
          }
          return t;
        });
      });

      return { previousTodos };
    },
    onSuccess: (err, { done }) => {
      if (done) {
        toast.success("Todo completed! 🥳");
      }
    },
    onError: (err, newTodo, context) => {
      toast.error(
        `An error occurred when setting todo to ${done ? "done" : "undone"}`
      );
      // set todos to previous data
      trpc.todo.all.setData(undefined, () => context?.previousTodos);
    },
    onSettled: async () => {
      await trpc.todo.all.invalidate();
    },
  });

  const { mutate: deleteMutation } = api.todo.delete.useMutation({
    onMutate: async (deleteId) => {
      // canel any outgoing refetches so they don't overwrite our optimistic update
      await trpc.todo.all.cancel();

      // snapshot previous value
      const previousTodos = trpc.todo.all.getData();

      // optimistically update to the new value
      trpc.todo.all.setData(undefined, (prev) => {
        if (!prev) return previousTodos;
        return prev.filter((t) => t.id !== deleteId);
      });

      return { previousTodos };
    },
    onError: (err, newTodo, context) => {
      toast.error("An error occurred when deleting todo");
      // set todos to previous data
      trpc.todo.all.setData(undefined, () => context?.previousTodos);
    },
    onSettled: async () => {
      await trpc.todo.all.invalidate();
    },
  });

  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="done"
            id={id}
            className="h-4 w-4 cursor-pointer rounded border border-gray-300 bg-gray-50 "
            checked={done}
            onChange={(e) => {
              doneMutation({ id, done: e.target.checked });
            }}
          />
          <label
            htmlFor={id}
            className={`cursor-pointer ${done ? "line-through" : ""}`}
          >
            {text}
          </label>
        </div>
        <button
          className="rounded bg-red-700 p-1 hover:bg-red-800"
          onClick={() => {
            deleteMutation(id);
          }}
        >
          Delete
        </button>
      </div>
    </>
  );
}
