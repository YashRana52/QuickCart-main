import connectDB from "@/config/db";
import User from "@/models/user";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    await connectDB();

    // Find user by clerkId
    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      return NextResponse.json({
        success: false,
        message: "User not found",
      });
    }

    return NextResponse.json({
      success: true,
      cartItems: user.cartItems || {},
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error.message,
    });
  }
}
