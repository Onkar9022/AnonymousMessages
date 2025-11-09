import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/app/model/User";
import { User } from "next-auth";

export async function DELETE(request: Request) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  const user = session?.user as User | undefined;

  if (!user || !user._id) {
    return Response.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const { messageId } = await request.json();

  try {
    const updatedUser = await UserModel.findByIdAndUpdate(
      user._id,
      { $pull: { messages: { _id: messageId } } },
      { new: true }
    );

    if (!updatedUser) {
      return Response.json(
        { success: false, message: "Message not found" },
        { status: 404 }
      );
    }

    return Response.json(
      { success: true, message: "Message deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete Message Error:", error);
    return Response.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
