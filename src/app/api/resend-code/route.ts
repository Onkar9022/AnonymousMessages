import dbConnect from "@/lib/dbConnect";
import UserModel from "@/app/model/User";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(req: Request) {
  await dbConnect();
  try {
    const { username } = await req.json();

    if (!username) {
      return Response.json(
        { success: false, message: "Username is required" },
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

    // 🚀 Generate new OTP
    const newCode = Math.floor(10000 + Math.random() * 90000).toString();
    user.verifyCode = newCode;
    user.verifyCodeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await user.save();

    // 📩 Send email again
    await sendVerificationEmail(user.email, user.username, newCode);

    return Response.json(
      { success: true, message: "New verification code sent!" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Resend error:", err);
    return Response.json(
      { success: false, message: "Failed to resend verification code" },
      { status: 500 }
    );
  }
}
