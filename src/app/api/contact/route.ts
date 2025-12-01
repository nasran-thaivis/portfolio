import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import nodemailer from 'nodemailer';

// Path to RequestContact.json file
const requestContactFilePath = path.join(process.cwd(), "data", "RequestContact.json");

// Helper function to read contact requests from JSON file
function readContactRequests() {
  try {
    const fileContents = fs.readFileSync(requestContactFilePath, "utf8");
    return JSON.parse(fileContents);
  } catch (error) {
    console.error("Error reading contact requests file:", error);
    return [];
  }
}

// Helper function to write contact requests to JSON file
function writeContactRequests(requests: any[]) {
  try {
    fs.writeFileSync(requestContactFilePath, JSON.stringify(requests, null, 2), "utf8");
    return true;
  } catch (error) {
    console.error("Error writing contact requests file:", error);
    return false;
  }
}

// Validation functions (matching frontend validation)
function validateName(name: string): string | null {
  if (!name || name.trim().length === 0) {
    return "Name is required";
  }
  
  const trimmedValue = name.trim();
  
  if (trimmedValue.length < 2) {
    return "Name must be at least 2 characters";
  }
  if (trimmedValue.length > 100) {
    return "Name must be less than 100 characters";
  }
  
  // Check if name is only numbers
  if (/^\d+$/.test(trimmedValue)) {
    return "Name cannot be only numbers";
  }
  
  // Check for repeated characters (more than 5 consecutive same characters)
  if (/(.)\1{5,}/.test(trimmedValue)) {
    return "Name contains too many repeated characters";
  }
  
  // Check for too many special characters (more than 30% of length)
  const specialCharCount = (trimmedValue.match(/[^a-zA-Z0-9\s]/g) || []).length;
  if (specialCharCount > trimmedValue.length * 0.3) {
    return "Name contains too many special characters";
  }
  
  // Check for spam-like names (case insensitive)
  const spamPatterns = /^(test|admin|user|spam|fake|dummy|temp|guest|anonymous|null|undefined)$/i;
  if (spamPatterns.test(trimmedValue)) {
    return "Please enter a valid name";
  }
  
  // Check for names that look like spam (test123, admin123, etc.)
  const spamLikePattern = /^(test|admin|user|spam|fake|dummy)\d+$/i;
  if (spamLikePattern.test(trimmedValue)) {
    return "Please enter a valid name";
  }
  
  return null;
}

function validateEmail(email: string): string | null {
  if (!email || email.trim().length === 0) {
    return "Email is required";
  }
  
  const trimmedValue = email.trim();
  
  // Check for incomplete emails
  if (trimmedValue === "@" || trimmedValue.startsWith("@") || trimmedValue.endsWith("@")) {
    return "Please enter a complete email address";
  }
  
  // Check if email doesn't contain @
  if (!trimmedValue.includes("@")) {
    return "Email must contain @ symbol";
  }
  
  // Split email into local and domain parts
  const parts = trimmedValue.split("@");
  if (parts.length !== 2) {
    return "Please enter a valid email address";
  }
  
  const [localPart, domainPart] = parts;
  
  // Validate local part
  if (!localPart || localPart.length === 0) {
    return "Email must have a username before @";
  }
  if (localPart.length > 64) {
    return "Email username is too long (max 64 characters)";
  }
  
  // Validate domain part
  if (!domainPart || domainPart.length === 0) {
    return "Email must have a domain after @";
  }
  
  // Check if domain has a dot (for TLD)
  if (!domainPart.includes(".")) {
    return "Email domain must include a top-level domain (e.g., .com, .org)";
  }
  
  // Split domain into domain name and TLD
  const domainParts = domainPart.split(".");
  if (domainParts.length < 2) {
    return "Email domain must include a top-level domain";
  }
  
  const tld = domainParts[domainParts.length - 1];
  if (tld.length < 2) {
    return "Email top-level domain must be at least 2 characters";
  }
  
  // More strict email regex: allows letters, numbers, dots, hyphens, underscores, plus signs
  // Local part: 1-64 chars, can contain letters, numbers, dots, hyphens, underscores, plus signs
  // Domain: must have valid domain name and TLD
  const emailRegex = /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmedValue)) {
    return "Please enter a valid email address";
  }
  
  // Check for fake-looking emails
  const fakeEmailPatterns = [
    /^test@test\./i,
    /^fake@fake\./i,
    /^dummy@dummy\./i,
    /^spam@spam\./i,
    /^temp@temp\./i,
    /^example@example\./i,
    /^admin@admin\./i,
    /^user@user\./i,
  ];
  
  for (const pattern of fakeEmailPatterns) {
    if (pattern.test(trimmedValue)) {
      return "Please enter a real email address";
    }
  }
  
  // Check for common disposable email patterns
  const disposablePatterns = [
    /@(10minutemail|tempmail|guerrillamail|mailinator|throwaway)\./i,
  ];
  
  for (const pattern of disposablePatterns) {
    if (pattern.test(trimmedValue)) {
      return "Disposable email addresses are not allowed";
    }
  }
  
  return null;
}

function validateMessage(message: string): string | null {
  if (!message || message.trim().length === 0) {
    return "Message is required";
  }
  if (message.trim().length < 10) {
    return "Message must be at least 10 characters";
  }
  if (message.trim().length > 1000) {
    return "Message must be less than 1000 characters";
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, message } = body;
    
    // Basic field presence check
    if (!name || !email || !message) {
      return NextResponse.json({ 
        error: 'Missing fields',
        message: 'Please fill in all required fields'
      }, { status: 400 });
    }
    
    // Comprehensive validation
    const nameError = validateName(name);
    const emailError = validateEmail(email);
    const messageError = validateMessage(message);
    
    if (nameError || emailError || messageError) {
      const errors: string[] = [];
      if (nameError) errors.push(nameError);
      if (emailError) errors.push(emailError);
      if (messageError) errors.push(messageError);
      
      return NextResponse.json({ 
        error: 'Validation failed',
        message: errors.join('; '),
        errors: {
          name: nameError || undefined,
          email: emailError || undefined,
          message: messageError || undefined,
        }
      }, { status: 400 });
    }

    // === 1. บันทึกข้อมูลลง JSON file ก่อนเสมอ ===
    const newRequest = {
      id: Date.now().toString(),
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
      createdAt: new Date().toISOString(),
      status: "new", // สถานะ: new, read, replied
    };

    const requests = readContactRequests();
    requests.unshift(newRequest); // เพิ่มใหม่ไว้ด้านบนสุด

    const saveSuccess = writeContactRequests(requests);
    if (!saveSuccess) {
      return NextResponse.json(
        { error: 'Failed to save contact request' },
        { status: 500 }
      );
    }

    // === 2. ส่งข้อมูลไปที่ NestJS Backend (ถ้ามีการตั้งค่า) ===
    let backendSaved = false;
    let backendError = null;
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    try {
      const backendRes = await fetch(`${backendUrl}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), message: message.trim() }),
      });
      
      if (backendRes.ok) {
        backendSaved = true;
      } else {
        const errorData = await backendRes.json().catch(() => ({}));
        backendError = errorData.message || `Backend returned ${backendRes.status}`;
        console.warn("NestJS backend save failed:", backendError);
      }
    } catch (err: any) {
      backendError = err.message || String(err);
      console.warn("NestJS backend not available or error:", backendError);
      // ไม่ throw error เพราะข้อมูลถูกบันทึกลง JSON file แล้ว
    }

    // === 3. พยายามส่งอีเมล (ถ้า SMTP มีการตั้งค่า) ===
    let emailSent = false;
    let emailSendError = null;

    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const to = process.env.CONTACT_TO_EMAIL;

    if (host && user && pass && to) {
      try {
        const transporter = nodemailer.createTransport({
          host,
          port,
          secure: port === 465,
          auth: { user, pass },
        });

        await transporter.sendMail({
          from: `${name} <${email}>`,
          to,
          subject: `New contact from ${name}`,
          text: message,
          html: `<p><strong>From:</strong> ${name} &lt;${email}&gt;</p><p>${message.replace(/\n/g, '<br/>')}</p>`,
        });

        emailSent = true;
      } catch (err: any) {
        emailSendError = err.message || String(err);
        console.error("Email sending failed:", emailSendError);
      }
    }

    // === 4. Return success (เพราะข้อมูลถูกบันทึกแล้ว) ===
    return NextResponse.json({
      success: true,
      message: 'Contact request saved successfully',
      saved: true,
      backendSaved,
      backendError: backendSaved ? null : (backendError || 'Backend not configured or unavailable'),
      emailSent,
      emailError: emailSent ? null : (emailSendError || 'SMTP not configured'),
      request: {
        id: newRequest.id,
        name: newRequest.name,
        email: newRequest.email,
      }
    });

  } catch (err: any) {
    console.error("Contact API error:", err);
    return NextResponse.json(
      { error: err.message || String(err) },
      { status: 500 }
    );
  }
}

// GET: อ่านข้อมูล contact requests ทั้งหมด (สำหรับ admin)
export async function GET(request: Request) {
  try {
    // ดึง username จาก query parameter
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    
    // === 1. พยายามอ่านจาก NestJS Backend ก่อน ===
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    let backendRequests = null;
    let backendError = null;
    
    try {
      // สร้าง URL สำหรับ backend API
      const backendApiUrl = username 
        ? `${backendUrl}/api/contact?username=${encodeURIComponent(username)}`
        : `${backendUrl}/api/contact`;
      
      const backendRes = await fetch(backendApiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (backendRes.ok) {
        backendRequests = await backendRes.json();
        // NestJS backend อาจส่ง array โดยตรง หรือ wrap ใน object
        const requests = Array.isArray(backendRequests) 
          ? backendRequests 
          : (backendRequests.requests || backendRequests.data || []);
        
        // แปลงข้อมูลจาก database format ให้ตรงกับ format ที่ frontend ต้องการ
        const formattedRequests = requests.map((req: any) => ({
          id: req.id,
          name: req.name,
          email: req.email,
          message: req.message,
          createdAt: req.createdAt,
          status: req.status || 'new',
        }));
        
        return NextResponse.json({ 
          success: true, 
          requests: formattedRequests,
          source: 'database'
        });
      } else {
        backendError = `Backend returned ${backendRes.status}`;
        console.warn("NestJS backend GET failed:", backendError);
      }
    } catch (err: any) {
      backendError = err.message || String(err);
      console.warn("NestJS backend not available or error:", backendError);
      // ไม่ throw error เพราะจะ fallback ไปอ่านจาก JSON file
    }
    
    // === 2. Fallback: อ่านจาก JSON file ถ้า backend ไม่ available ===
    try {
      const jsonRequests = readContactRequests();
      return NextResponse.json({ 
        success: true, 
        requests: jsonRequests,
        source: 'json',
        backendError: backendError || null
      });
    } catch (jsonError) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Failed to read contact requests from both database and JSON file",
          backendError: backendError || null,
          jsonError: jsonError instanceof Error ? jsonError.message : String(jsonError)
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Contact API GET error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to read contact requests",
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
