import dbConnect from "@/lib/dbConnect";
import UserModel from "@/app/model/User";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  await dbConnect();

  const username = req.nextUrl.searchParams.get("username");

  if (!username) {
    return Response.json(
      { success: false, message: "Username is required" },
      { status: 400 }
    );
  }

  const user = await UserModel.findOne({ username }).select(
    "username isAcceptingMessage"
  );

  if (!user) {
    return Response.json(
      { success: false, message: "User not found" },
      { status: 404 }
    );
  }

  return Response.json({
    success: true,
    user: {
      username: user.username,
      isAcceptingMessage: user.isAcceptingMessage,
    },
  });
}
