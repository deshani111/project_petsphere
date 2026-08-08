import { NextResponse } from "next/server";
import {
  registerAccount,
  RegistrationConflictError,
} from "../../../modules/auth/auth.service";

const roleMap = {
  owner: "pet_owner",
  sitter: "pet_sitter",
};

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhoneNumber(phoneNumber) {
  return /^[+0-9()\-\s]{8,20}$/.test(phoneNumber);
}

function normalizeRole(role) {
  const normalizedRole = role.toLowerCase();
  return roleMap[normalizedRole] || "";
}

function getCity(bodyCity, address) {
  if (typeof bodyCity === "string" && bodyCity.trim()) {
    return bodyCity.trim();
  }

  const addressParts = address
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (addressParts.length >= 2) {
    return addressParts[addressParts.length - 2];
  }

  return null;
}

export async function POST(request) {
  let body;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Please submit valid registration details." },
      { status: 400 }
    );
  }

  const submittedRole =
    typeof body.role === "string" ? body.role.trim() : "";

  const role = normalizeRole(submittedRole);

  const fullName =
    typeof body.fullName === "string"
      ? body.fullName.trim()
      : "";

  const phoneNumber =
    typeof body.phoneNumber === "string"
      ? body.phoneNumber.trim()
      : "";

  const email =
    typeof body.email === "string"
      ? body.email.trim().toLowerCase()
      : "";

  const address =
    role === "pet_owner" && typeof body.address === "string"
      ? body.address.trim()
      : "";

  const city = role === "pet_owner" ? getCity(body.city, address) : null;

  const password =
    typeof body.password === "string"
      ? body.password
      : "";

  const confirmPassword =
    typeof body.confirmPassword === "string"
      ? body.confirmPassword
      : "";


  if (!role) {
    return NextResponse.json(
      { message: "Please select a valid account type." },
      { status: 400 }
    );
  }

  if (
    !fullName ||
    !phoneNumber ||
    !email ||
    !password ||
    !confirmPassword
  ) {
    return NextResponse.json(
      { message: "Please fill in all required fields." },
      { status: 400 }
    );
  }

  if (role === "pet_owner" && (!address || !city)) {
    return NextResponse.json(
      { message: "Please fill in all required fields." },
      { status: 400 }
    );
  }

  if (!isValidEmail(email)) {
    return NextResponse.json(
      { message: "Please provide a valid email address." },
      { status: 400 }
    );
  }

  if (!isValidPhoneNumber(phoneNumber)) {
    return NextResponse.json(
      { message: "Please provide a valid phone number." },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { message: "Password must be at least 8 characters long." },
      { status: 400 }
    );
  }

  if (password !== confirmPassword) {
    return NextResponse.json(
      { message: "Passwords do not match." },
      { status: 400 }
    );
  }


  try {
    const account = await registerAccount({
      role,
      fullName,
      phoneNumber,
      email,
      address,
      city,
      password,
    });


    return NextResponse.json(
      {
        message: "Account created successfully. You can now log in.",
        account,
      },
      {
        status: 201,
      }
    );


  } catch (error) {

    if (error instanceof RegistrationConflictError || error?.code === "P2002") {
      return NextResponse.json(
        {
          message: "An account with this email already exists.",
        },
        {
          status: 409,
        }
      );
    }

    console.error("Registration failed:", error);

    return NextResponse.json(
      {
        message: "Could not create account. Please try again.",
      },
      {
        status: 500,
      }
    );
  }
}
