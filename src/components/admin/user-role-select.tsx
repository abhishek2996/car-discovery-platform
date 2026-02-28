"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateUserRole } from "@/lib/actions/admin";
import { toast } from "sonner";

const ROLES = ["BUYER", "DEALER", "ADMIN"] as const;

interface UserRoleSelectProps {
  userId: string;
  currentRole: string;
}

export function UserRoleSelect({ userId, currentRole }: UserRoleSelectProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleChange(role: string) {
    if (role === currentRole) return;
    startTransition(async () => {
      const fd = new FormData();
      fd.set("userId", userId);
      fd.set("role", role);
      const result = await updateUserRole(fd);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <Select
      defaultValue={currentRole}
      onValueChange={handleChange}
      disabled={isPending}
    >
      <SelectTrigger size="sm" className="w-28">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ROLES.map((role) => (
          <SelectItem key={role} value={role}>
            {role}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
