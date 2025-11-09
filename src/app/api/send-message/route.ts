import dbConnect from "@/lib/dbConnect";
import UserModel, { IMessage } from "@/app/model/User";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, content } = await request.json();

    if (!username || !content || content.trim().length === 0) {
      return Response.json(
        { success: false, message: "Message content is required" },
        { status: 400 }
      );
    }

    const user = await UserModel.findOne({ username });

    if (!user) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    if (!user.isAcceptingMessage) {
      return Response.json(
        { success: false, message: "This user is not accepting messages" },
        { status: 403 }
      );
    }

    const newMessage: IMessage = {
      content,
      createdAt: new Date(),
    } as IMessage;

    user.messages.push(newMessage);
    await user.save();

    return Response.json(
      { success: true, message: "Message sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending message:", error);
    return Response.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
