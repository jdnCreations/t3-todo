import { api } from "~/utils/api";
import type { Todo } from "../types";

type TodoProps = {
  todo: Todo;
};

export default function Todo({ todo }: TodoProps) {
  const { id, text, done } = todo;

  const trpc = api.useContext();

  const { mutate: doneMutation } = api.todo.toggle.useMutation({
    onSettled: async () => {
      await trpc.todo.all.invalidate();
    },
  });

  const { mutate: deleteMutation } = api.todo.delete.useMutation({
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
            id="done"
            className="h-4 w-4 cursor-pointer rounded border border-gray-300 bg-gray-50 "
            checked={done}
            onChange={(e) => {
              doneMutation({ id, done: e.target.checked });
            }}
          />
          <label htmlFor="done" className={`cursor-pointer`}>
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
