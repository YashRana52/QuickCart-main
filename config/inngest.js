import { Inngest } from "inngest";
import connectDB from "./db";
import User from "@/models/user";

export const inngest = new Inngest({ id: "E-commerce" });

// Save user data
export const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    try {
      const { id, first_name, last_name, email_addresses, image_url } =
        event.data;

      const userData = {
        _id: id,
        email: email_addresses[0].email_address,
        name: [first_name, last_name].filter(Boolean).join(" "),
        imageUrl: image_url,
      };

      await connectDB();
      await User.create(userData);
    } catch (err) {
      console.error("Error syncing user creation:", err);
    }
  }
);

// Update user
export const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    try {
      const { id, first_name, last_name, email_addresses, image_url } =
        event.data;

      const userData = {
        _id: id,
        email: email_addresses[0].email_address,
        name: [first_name, last_name].filter(Boolean).join(" "),
        imageUrl: image_url,
      };

      await connectDB();
      await User.findByIdAndUpdate(id, userData, { new: true, upsert: true });
    } catch (err) {
      console.error("Error syncing user update:", err);
    }
  }
);

// Delete user
export const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-from-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    try {
      const { id } = event.data;
      await connectDB();
      await User.findByIdAndDelete(id);
    } catch (err) {
      console.error("Error syncing user deletion:", err);
    }
  }
);
