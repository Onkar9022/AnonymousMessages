// import { resend } from "@/lib/resend";
// import VerificationEmail from "../../emails/VerificationEmail";

// import { ApiResponse } from "@/types/ApiResponse";

// export async function sendVerificationEmail(
//     email : string,
//     username: string,
//     verifyCode: string
// ) : Promise<ApiResponse>{
//     try{
//         await resend.emails.send({
//             from : 'anonymous',
//             to: email,
//             subject : 'Mystry message | Verification code',
//             react : VerificationEmail({username , otp: verifyCode}),

//         })
//         return {success: true , message: "Verification email send successfully"}
//     }catch(err){
//         console.error("Error sending verification email", err);
//         return {success: false , message : "Failed to send verification email"}

//     }
// }


import { resend } from "@/lib/resend";
import VerificationEmail from "../../emails/VerificationEmail";
import { ApiResponse } from "@/types/ApiResponse";
import { render } from "@react-email/render";

export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string
): Promise<ApiResponse> {
  try {
    // ✅ render() must be awaited because it returns Promise<string>
    const html = await render(
      VerificationEmail({
        username,
        otp: verifyCode,
      })
    );

    await resend.emails.send({
       from: "Mystry Message <onboarding@resend.dev>",
      to: email,
      subject: "Mystry message | Verification code",
      html,  // ✅ now string, not Promise
    });

    return {
      success: true,
      message: "Verification email sent successfully",
    };
  } catch (err) {
    console.error("Error sending verification email:", err);
    return {
      success: false,
      message: "Failed to send verification email",
    };
  }
}
