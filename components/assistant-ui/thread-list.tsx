"use client";

import {
  ThreadListItemPrimitive,
  ThreadListPrimitive,
} from "@assistant-ui/react";
import { PlusIcon, MessageSquareIcon, Trash2Icon } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThreadList() {
  return (
    <div className="flex h-full w-64 flex-col border-r bg-muted/30">
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <MessageSquareIcon className="size-4 text-muted-foreground" />
        <span className="text-sm font-semibold">대화 목록</span>
      </div>

      <ThreadListPrimitive.Root className="flex flex-1 flex-col overflow-hidden">
        <div className="p-2">
          <ThreadListPrimitive.New className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground border border-dashed border-muted-foreground/30 text-muted-foreground">
            <PlusIcon className="size-4" />
            새 대화
          </ThreadListPrimitive.New>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-2">
          <ThreadListPrimitive.Items>
            {() => <ThreadListItem />}
          </ThreadListPrimitive.Items>
        </div>
      </ThreadListPrimitive.Root>
    </div>
  );
}

function ThreadListItem() {
  return (
    <ThreadListItemPrimitive.Root className="group relative flex items-center rounded-lg hover:bg-accent data-[active]:bg-accent data-[active]:text-accent-foreground mb-0.5">
      <ThreadListItemPrimitive.Trigger className="flex flex-1 items-center gap-2 truncate px-3 py-2 text-sm text-left">
        <MessageSquareIcon className="size-3.5 shrink-0 text-muted-foreground group-data-[active]:text-accent-foreground" />
        <span className="truncate">
          <ThreadListItemPrimitive.Title fallback="새 대화" />
        </span>
      </ThreadListItemPrimitive.Trigger>

      <div className="absolute right-1 hidden items-center group-hover:flex group-data-[active]:flex">
        <ThreadListItemPrimitive.Delete className="rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100 group-data-[active]:opacity-100">
          <Trash2Icon className="size-3.5" />
        </ThreadListItemPrimitive.Delete>
      </div>
    </ThreadListItemPrimitive.Root>
  );
}
