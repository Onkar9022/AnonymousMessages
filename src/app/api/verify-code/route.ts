import dbConnect from "@/lib/dbConnect";
import UserModel from "@/app/model/User";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, code } = await request.json();

    if (!username || !code) {
      return Response.json(
        { success: false, message: "Username and code are required" },
        { status: 400 }
      );
    }

    const decodedUsername = decodeURIComponent(username.trim());
    const user = await UserModel.findOne({ username: decodedUsername });

    if (!user) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    if (user.verifyCode !== code) {
      return Response.json(
        { success: false, message: "Invalid verification code" },
        { status: 400 }
      );
    }

    if (!user.verifyCodeExpiry || user.verifyCodeExpiry < new Date()) {
      return Response.json(
        { success: false, message: "Verification code has expired" },
        { status: 400 }
      );
    }

    // ✅ Mark verified & clear OTP
    user.isVerified = true;
    user.verifyCode = "";
    user.verifyCodeExpiry =  null;

    await user.save({ validateBeforeSave: false });

    return Response.json(
      { success: true, message: "User verified successfully" },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error verifying user:", error);
    return Response.json(
      { success: false, message: "Server Error while verifying user" },
      { status: 500 }
    );
  }
}
