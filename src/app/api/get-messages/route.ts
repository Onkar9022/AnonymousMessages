import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/app/model/User";
import { User } from "next-auth";
import mongoose from "mongoose";

export async function GET() {
  await dbConnect();

  const session = await getServerSession(authOptions);
  const user = session?.user as User | undefined;

  if (!user || !user._id) {
    return Response.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const userId = new mongoose.Types.ObjectId(user._id);

  try {
    const result = await UserModel.aggregate([
      { $match: { _id: userId } },
      { $unwind: { path: "$messages", preserveNullAndEmptyArrays: true } },
      { $sort: { "messages.createdAt": -1 } },
      {
        $group: {
          _id: "$_id",
          messages: { $push: "$messages" }
        }
      },
      { $project: { messages: 1, _id: 0 } }
    ]);

    const messages = result?.[0]?.messages?.filter(Boolean) ?? [];

    return Response.json(
      { success: true, messages },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error fetching messages:", error);
    return Response.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
