import { Inngest } from "inngest";
import connectDB from "./db";
import User from "@/models/user";
import Order from "@/models/Order";

export const inngest = new Inngest({ id: "E-commerce" });

// Save user data
// export const syncUserCreation = inngest.createFunction(
//   { id: "sync-user-from-clerk" },
//   { event: "clerk/user.created" },
//   async ({ event }) => {
//     try {
//       const {
//         id, // ✅ user ka id (MongoDB _id banega)
//         first_name,
//         last_name,
//         email_addresses,
//         image_url,
//       } = event.data;

//       const userData = {
//         _id: id, // yeh hamesha "user_xxx" hoga
//         email: email_addresses[0]?.email_address,
//         name: [first_name, last_name].filter(Boolean).join(" "),
//         imageUrl: image_url,
//       };

//       await connectDB();
//       console.log("DB Connected. Saving user:", userData);

//       const savedUser = await User.create(userData);
//       console.log("✅ User saved:", savedUser);
//     } catch (err) {
//       console.error("❌ Error syncing user creation:", err.message, err);
//     }
//   }
// );

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
      await User.findByIdAndUpdate({ clerkId: id }, userData, {
        new: true,
        upsert: true,
      });
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
      await User.findByIdAndDelete({ clerkId: id });
    } catch (err) {
      console.error("Error syncing user deletion:", err);
    }
  }
);
// Helper to safely get email from Clerk payload
function getEmail(emailAddresses) {
  const emailObj = emailAddresses?.[0] || {};
  return emailObj?.email_address || emailObj?.email || "";
}

// Helper to build full name
function getFullName(first, last) {
  return [first, last].filter(Boolean).join(" ").trim() || "Unnamed User";
}

// --- create user ---
export const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    try {
      console.log(
        "clerk/user.created event:",
        JSON.stringify(event.data, null, 2)
      );

      const { id, first_name, last_name, email_addresses, image_url } =
        event.data;

      const email = getEmail(email_addresses);
      if (!email) {
        console.error("Email missing, skipping creation.");
        return;
      }

      await connectDB();

      //  Pehle check karo user exist karta hai ya nahi
      const existingUser = await User.findOne({ clerkId: id });
      if (existingUser) {
        console.log("User already exists:", existingUser.email);
        return { success: true, message: "User already exists" };
      }

      //  Agar user exist nahi karta tabhi create karo
      const userData = {
        clerkId: id,
        email,
        name: getFullName(first_name, last_name),
        imageUrl: image_url || "",
      };

      console.log("Creating new user:", userData);
      const newUser = await User.create(userData);

      console.log(" User created:", newUser);
      return { success: true };
    } catch (err) {
      console.error(" Error in syncUserCreation:", err);
      throw err;
    }
  }
);

// inngest func to create user order in database

export const createUserOrder = inngest.createFunction(
  {
    id: "create-user-order",
    batchEvents: {
      maxSize: 25,
      timeout: "5s",
    },
  },
  { event: "order/created" },
  async ({ events }) => {
    const orders = events.map((event) => {
      return {
        userId: event.data.userId,
        items: event.data.items,
        amount: event.data.amount,
        address: event.data.address,
        date: event.data.date,
      };
    });
    await connectDB();
    await Order.insertMany(orders);
    return { success: true, processed: orders.length };
  }
);
