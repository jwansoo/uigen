import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocation } from "../ToolInvocation";

afterEach(() => {
  cleanup();
});

test("displays 'Creating' message for create command", () => {
  render(
    <ToolInvocation
      toolName="str_replace_editor"
      state="result"
      args={{ command: "create", path: "/App.jsx" }}
    />
  );

  const message = screen.getByText("Creating /App.jsx");
  expect(message).toBeDefined();
});

test("displays 'Editing' message for str_replace command", () => {
  render(
    <ToolInvocation
      toolName="str_replace_editor"
      state="result"
      args={{ command: "str_replace", path: "/components/Card.jsx" }}
    />
  );

  const message = screen.getByText("Editing /components/Card.jsx");
  expect(message).toBeDefined();
});

test("displays 'Editing' message for insert command", () => {
  render(
    <ToolInvocation
      toolName="str_replace_editor"
      state="result"
      args={{ command: "insert", path: "/utils/helper.js" }}
    />
  );

  const message = screen.getByText("Editing /utils/helper.js");
  expect(message).toBeDefined();
});

test("displays 'Viewing' message for view command", () => {
  render(
    <ToolInvocation
      toolName="str_replace_editor"
      state="result"
      args={{ command: "view", path: "/README.md" }}
    />
  );

  const message = screen.getByText("Viewing /README.md");
  expect(message).toBeDefined();
});

test("displays 'Modifying' message for unknown command", () => {
  render(
    <ToolInvocation
      toolName="str_replace_editor"
      state="result"
      args={{ command: "unknown", path: "/test.js" }}
    />
  );

  const message = screen.getByText("Modifying /test.js");
  expect(message).toBeDefined();
});

test("displays 'Renaming' message for rename command", () => {
  render(
    <ToolInvocation
      toolName="file_manager"
      state="result"
      args={{
        command: "rename",
        path: "/old.jsx",
        new_path: "/new.jsx",
      }}
    />
  );

  const message = screen.getByText("Renaming /old.jsx to /new.jsx");
  expect(message).toBeDefined();
});

test("displays 'Deleting' message for delete command", () => {
  render(
    <ToolInvocation
      toolName="file_manager"
      state="result"
      args={{ command: "delete", path: "/unused.jsx" }}
    />
  );

  const message = screen.getByText("Deleting /unused.jsx");
  expect(message).toBeDefined();
});

test("displays 'Managing' message for unknown file_manager command", () => {
  render(
    <ToolInvocation
      toolName="file_manager"
      state="result"
      args={{ command: "unknown", path: "/test.jsx" }}
    />
  );

  const message = screen.getByText("Managing /test.jsx");
  expect(message).toBeDefined();
});

test("displays formatted tool name for unknown tools", () => {
  render(
    <ToolInvocation
      toolName="unknown_tool_name"
      state="result"
      args={{}}
    />
  );

  const message = screen.getByText("unknown tool name");
  expect(message).toBeDefined();
});

test("shows loading indicator when state is not 'result'", () => {
  const { container } = render(
    <ToolInvocation
      toolName="str_replace_editor"
      state="loading"
      args={{ command: "create", path: "/App.jsx" }}
    />
  );

  const spinner = container.querySelector(".animate-spin");
  expect(spinner).toBeDefined();
  expect(spinner).not.toBeNull();
});

test("shows completion indicator when state is 'result'", () => {
  const { container } = render(
    <ToolInvocation
      toolName="str_replace_editor"
      state="result"
      args={{ command: "create", path: "/App.jsx" }}
    />
  );

  const completionDot = container.querySelector(".bg-emerald-500");
  expect(completionDot).toBeDefined();
  expect(completionDot).not.toBeNull();

  const spinner = container.querySelector(".animate-spin");
  expect(spinner).toBeNull();
});

test("handles missing args gracefully", () => {
  render(
    <ToolInvocation
      toolName="str_replace_editor"
      state="result"
    />
  );

  const message = screen.getByText("str replace editor");
  expect(message).toBeDefined();
});
