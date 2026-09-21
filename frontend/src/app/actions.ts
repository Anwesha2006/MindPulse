"use server";

import { cookies } from "next/headers";
import { api } from "@/lib/api";
import { redirect } from "next/navigation";

export async function submitWelcome(prevState: any, formData: FormData) {
  const name = formData.get("name");
  
  if (!name || typeof name !== "string") {
    return { error: "Name is required" };
  }

  try {
    const response = await api.createUser(name);
    
    (await cookies()).set("user_id", response.user_id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: "/",
    });
  } catch (error) {
    console.error("Failed to create user", error);
    return { error: "Failed to create user. Please try again." };
  }

  redirect("/");
}

export async function getUserId(): Promise<number | null> {
  const userIdStr = (await cookies()).get("user_id")?.value;
  if (!userIdStr) return null;
  
  const id = parseInt(userIdStr, 10);
  return isNaN(id) ? null : id;
}
