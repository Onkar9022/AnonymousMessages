import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/app/model/User";
import { User } from "next-auth";

export async function POST(request: Request) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  const user = session?.user as User | undefined;

  if (!session || !user) {
    return Response.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const { acceptMessages } = await request.json();

  const updatedUser = await UserModel.findByIdAndUpdate(
    user._id,
    { isAcceptingMessage: acceptMessages }, // ✅ ensures singular DB field is updated
    { new: true }
  );

  if (!updatedUser) {
    return Response.json(
      { success: false, message: "User not found" },
      { status: 404 }
    );
  }

  return Response.json(
    { success: true, message: "Message acceptance updated." },
    { status: 200 }
  );
}
