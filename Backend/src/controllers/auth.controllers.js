import { generateJWTToken_email, generateJWTToken_username } from "../utils/generateJWTToken.js";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/user.model.js";
import { UnRegisteredUser } from "../models/unRegisteredUser.model.js";
import dotenv from "dotenv";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { TokenBlacklist } from "../models/tokenBlacklist.model.js";

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      done(null, profile);
    }
  )
);

export const googleAuthHandler = passport.authenticate("google", {
  scope: ["profile", "email"],
});

export const googleAuthCallback = passport.authenticate("google", {
  failureRedirect: "http://localhost:5173/login",
  session: false,
});

export const handleGoogleLoginCallback = asyncHandler(async (req, res) => {
  console.log("\n******** Inside handleGoogleLoginCallback function ********");
  // console.log("User Google Info", req.user);

  const existingUser = await User.findOne({ email: req.user._json.email });

  if (existingUser) {
    const jwtToken = generateJWTToken_username(existingUser);
    const expiryDate = new Date(Date.now() + 1 * 60 * 60 * 1000);
    
    // Set the cookie with proper SameSite and Path attributes
    res.cookie("accessToken", jwtToken, { 
      httpOnly: true, 
      expires: expiryDate, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });
    
    // Also send user data in the response for the client to store
    const userData = {
      _id: existingUser._id,
      name: existingUser.name,
      email: existingUser.email,
      username: existingUser.username,
      picture: existingUser.picture
    };
    
    return res.redirect(`http://localhost:5173/login?authSuccess=true&userData=${encodeURIComponent(JSON.stringify(userData))}`);
  }

  let unregisteredUser = await UnRegisteredUser.findOne({ email: req.user._json.email });
  if (!unregisteredUser) {
    console.log("Creating new Unregistered User");
    unregisteredUser = await UnRegisteredUser.create({
      name: req.user._json.name,
      email: req.user._json.email,
      picture: req.user._json.picture,
    });
  }
  
  const jwtToken = generateJWTToken_email(unregisteredUser);
  const expiryDate = new Date(Date.now() + 0.5 * 60 * 60 * 1000);
  
  // Set the registration cookie with proper attributes
  res.cookie("accessTokenRegistration", jwtToken, { 
    httpOnly: true, 
    expires: expiryDate, 
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  });
  
  return res.redirect("http://localhost:5173/register");
});

export const handleLogout = async (req, res) => {
  console.log("\n******** Inside handleLogout function ********");
  // Clear both potential auth cookies with matching secure flag
  res.clearCookie("accessToken", { 
    httpOnly: true, 
    path: '/', 
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  });
  res.clearCookie("accessTokenRegistration", { 
    httpOnly: true, 
    path: '/', 
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  });
  // Add token to blacklist
  const token = req.cookies.accessToken || req.cookies.accessTokenRegistration;
  if (token) {
    await TokenBlacklist.create({ token, invalidatedAt: new Date() });
  }
  // Redirect to login with success state
  return res.redirect('http://localhost:5173/login?logoutSuccess=true');
};
