import dbConnect from "@/lib/dbConnect";
import UserModel from "@/app/model/User";
import { z } from "zod";
import { usernameValidation } from "@/schemas/signUpSchema";

const UsernameQuerySchema = z.object({
  username: usernameValidation,
});

export async function GET(request: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);

    const queryParam = {
      username: searchParams.get("username") || "",
    };

    // ✅ Validate with Zod
    const result = UsernameQuerySchema.safeParse(queryParam);

    if (!result.success) {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid username format" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { username } = result.data;

    // ✅ Correct check → find ANY user (verified or not)
    const existingUser = await UserModel.findOne({ username });

    if (existingUser) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Username is already taken",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Username is unique",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error checking username uniqueness:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
