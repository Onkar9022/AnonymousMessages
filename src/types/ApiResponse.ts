// 
import { IMessage } from "@/app/model/User";

export interface ApiResponse {
  success: boolean;
  message?: string;

  // Used in APIs that return user profile
  user?: {
    username: string;
    email: string;
    isVerified: boolean;
    isAcceptingMessage: boolean;
  };

  // Used in APIs that return messages
  messages?: IMessage[];
}
