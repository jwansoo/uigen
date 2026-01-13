import { Loader2, FileEdit, FilePlus, FileX, ArrowRight } from "lucide-react";

interface ToolInvocationProps {
  toolName: string;
  state: string;
  args?: Record<string, any>;
}

function getToolMessage(toolName: string, args?: Record<string, any>): {
  icon: React.ReactNode;
  message: string;
} {
  if (toolName === "str_replace_editor" && args) {
    const { command, path } = args;

    switch (command) {
      case "create":
        return {
          icon: <FilePlus className="w-3 h-3 text-emerald-600" />,
          message: `Creating ${path}`,
        };
      case "str_replace":
      case "insert":
        return {
          icon: <FileEdit className="w-3 h-3 text-blue-600" />,
          message: `Editing ${path}`,
        };
      case "view":
        return {
          icon: <FileEdit className="w-3 h-3 text-neutral-600" />,
          message: `Viewing ${path}`,
        };
      default:
        return {
          icon: <FileEdit className="w-3 h-3 text-neutral-600" />,
          message: `Modifying ${path}`,
        };
    }
  }

  if (toolName === "file_manager" && args) {
    const { command, path, new_path } = args;

    switch (command) {
      case "rename":
        return {
          icon: <ArrowRight className="w-3 h-3 text-blue-600" />,
          message: `Renaming ${path} to ${new_path}`,
        };
      case "delete":
        return {
          icon: <FileX className="w-3 h-3 text-red-600" />,
          message: `Deleting ${path}`,
        };
      default:
        return {
          icon: <FileEdit className="w-3 h-3 text-neutral-600" />,
          message: `Managing ${path}`,
        };
    }
  }

  return {
    icon: <FileEdit className="w-3 h-3 text-neutral-600" />,
    message: toolName.replace(/_/g, " "),
  };
}

export function ToolInvocation({ toolName, state, args }: ToolInvocationProps) {
  const { icon, message } = getToolMessage(toolName, args);
  const isComplete = state === "result";

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs border border-neutral-200">
      {isComplete ? (
        <>
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          {icon}
          <span className="text-neutral-700">{message}</span>
        </>
      ) : (
        <>
          <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
          {icon}
          <span className="text-neutral-700">{message}</span>
        </>
      )}
    </div>
  );
}
