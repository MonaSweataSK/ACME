import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-slate-900 group-[.toaster]:text-slate-100 group-[.toaster]:border-slate-800 group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-slate-400",
          actionButton:
            "group-[.toast]:bg-indigo-500 group-[.toast]:text-white",
          cancelButton:
            "group-[.toast]:bg-slate-800 group-[.toast]:text-slate-400",
          error:
            "group-[.toaster]:bg-red-950/50 group-[.toaster]:border-red-900 group-[.toaster]:text-red-200",
          success:
            "group-[.toaster]:bg-emerald-950/50 group-[.toaster]:border-emerald-900 group-[.toaster]:text-emerald-200",
          info:
            "group-[.toaster]:bg-blue-950/50 group-[.toaster]:border-blue-900 group-[.toaster]:text-blue-200",
        },
      }}
    />
  );
}
