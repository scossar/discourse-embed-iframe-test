import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  return (
    <div className="max-w-screen-sm mx-auto">
      <h1 className="text-2xl">
        Load Discourse comment iframe on button click
      </h1>
    </div>
  );
}
