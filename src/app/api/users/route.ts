import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Path to users.json file
const usersFilePath = path.join(process.cwd(), "data", "users.json");

// Helper function to read users from JSON file
function readUsers() {
  try {
    const fileContents = fs.readFileSync(usersFilePath, "utf8");
    return JSON.parse(fileContents);
  } catch (error) {
    console.error("Error reading users file:", error);
    return [];
  }
}

// Helper function to write users to JSON file
function writeUsers(users: any[]) {
  try {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), "utf8");
    return true;
  } catch (error) {
    console.error("Error writing users file:", error);
    return false;
  }
}

// GET: Read all users (without passwords for security)
export async function GET() {
  try {
    const users = readUsers();
    // Remove passwords before sending to client
    const usersWithoutPasswords = users.map(({ password, ...user }: any) => user);
    return NextResponse.json({ success: true, users: usersWithoutPasswords });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to read users" },
      { status: 500 }
    );
  }
}

// POST: Create new user (Register)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, username, action } = body;

    // If action is "login", verify credentials
    if (action === "login") {
      const users = readUsers();
      const user = users.find(
        (u: any) => u.email === email && u.password === password
      );

      if (!user) {
        return NextResponse.json(
          { success: false, message: "Invalid email or password" },
          { status: 401 }
        );
      }

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      return NextResponse.json({
        success: true,
        message: "Login successful",
        user: userWithoutPassword,
      });
    }

    // If action is "register", create new user
    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const users = readUsers();

    // Check if email already exists
    const existingUser = users.find((u: any) => u.email === email || (username && u.username === username));
    if (existingUser) {
      return NextResponse.json(
        { 
          success: false, 
          message: existingUser.email === email 
            ? "Email already exists" 
            : "Username already exists" 
        },
        { status: 409 }
      );
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      email,
      password, // ⚠️ In production, use bcrypt to hash password
      name,
      username: username || email.split('@')[0], // Use username if provided, otherwise use email prefix
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);

    // Write to file
    const writeSuccess = writeUsers(users);
    if (!writeSuccess) {
      return NextResponse.json(
        { success: false, message: "Failed to save user" },
        { status: 500 }
      );
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;
    return NextResponse.json({
      success: true,
      message: "Registration successful",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Error in POST /api/users:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT: Update user (Change password, update profile)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, email, password, name } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }

    const users = readUsers();
    const userIndex = users.findIndex((u: any) => u.id === id);

    if (userIndex === -1) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Update user fields
    if (email) users[userIndex].email = email;
    if (password) users[userIndex].password = password; // ⚠️ Should hash in production
    if (name) users[userIndex].name = name;

    // Write to file
    const writeSuccess = writeUsers(users);
    if (!writeSuccess) {
      return NextResponse.json(
        { success: false, message: "Failed to update user" },
        { status: 500 }
      );
    }

    // Return updated user without password
    const { password: _, ...userWithoutPassword } = users[userIndex];
    return NextResponse.json({
      success: true,
      message: "User updated successfully",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Error in PUT /api/users:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

