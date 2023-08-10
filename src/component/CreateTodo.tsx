import { useState } from "react";
import { api } from "~/utils/api";
import { todoInput } from "~/types";
import { toast } from "react-hot-toast";

export default function CreateTodo() {
  const [newTodo, setNewTodo] = useState("");

  const trpc = api.useContext();

  const { mutate } = api.todo.create.useMutation({
    onMutate: async (newTodo) => {
      // canel any outgoing refetches so they don't overwrite our optimistic update
      await trpc.todo.all.cancel();

      // snapshot previous value
      const previousTodos = trpc.todo.all.getData();

      // optimistically update to the new value
      trpc.todo.all.setData(undefined, (prev) => {
        const optimisticTodo = {
          id: "optimistic",
          text: newTodo,
          done: false,
        };
        if (!prev) return [optimisticTodo];
        return [...prev, optimisticTodo];
      });

      setNewTodo("");

      return { previousTodos };
    },
    onError: (err, newTodo, context) => {
      toast.error("An error occurred when creating todo");
      // bring back todo into textbox
      setNewTodo(newTodo);
      // set todos to previous data
      trpc.todo.all.setData(undefined, () => context?.previousTodos);
    },
    // invalidate queries, re-fetch data
    onSettled: async () => {
      await trpc.todo.all.invalidate();
    },
  });

  return (
    <div>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();

          const result = todoInput.safeParse(newTodo);

          if (!result.success) {
            toast.error(result.error.format()._errors.join("\n"));
            return;
          }

          // create todo mutation
          mutate(newTodo);

          // clear input and reset state
          setNewTodo("");
        }}
      >
        <input
          type="text"
          name="new-todo"
          id="new-todo"
          placeholder="New Todo ..."
          value={newTodo}
          onChange={(e) => {
            setNewTodo(e.target.value);
          }}
          className="rounded-lg border border-gray-600 bg-slate-900 p-2 text-sm text-white focus:ring-4"
        />
        <button className="rounded bg-blue-700 px-2 py-1 text-white hover:bg-blue-800 focus:outline-none focus:ring-4">
          Create
        </button>
      </form>
    </div>
  );
}
