import dbConnect from "@/lib/dbConnect";
import UserModel from "@/app/model/User";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  await dbConnect();

  const identifier = req.nextUrl.searchParams.get("identifier");

  if (!identifier) {
    return Response.json(
      { success: false, message: "Identifier is required" },
      { status: 400 }
    );
  }

  const user = await UserModel.findOne({
    $or: [{ email: identifier }, { username: identifier }],
  }).lean(); // lean() = plain JS object (faster & safe)

  if (!user) {
    return Response.json(
      { success: false, message: "User not found" },
      { status: 404 }
    );
  }

  return Response.json({
    success: true,
    user: {
      _id: String(user._id),
      username: user.username,
      email: user.email,
      isVerified: user.isVerified,
      
      // Normalize field name so dashboard always gets correct value ✅
      isAcceptingMessage: Boolean(
        user.isAcceptingMessage ?? user.isAcceptingMessage ?? false
      ),
      messages: user.messages ?? [],
    },
  });
}
