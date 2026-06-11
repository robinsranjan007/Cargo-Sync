import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, name: user.name, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "15m" },
  );
};

export const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
};

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(500).json({
        success: false,
        message: "All fields are required",
      });
    }

    //check if the user already exist
    const exisitinguser = await User.findOne({ email });

    if (exisitinguser) {
      return res.status(400).json({ message: "USER ALREADY EXIST" });
    }

    //hashpassword

    const salt = await bcrypt.genSalt(10);

    const hashpassword = await bcrypt.hash(password, salt);

    //create user
    const user = await User.create({
      name,
      email,
      password: hashpassword,
      role: role || "dispatcher",
    });

    //set tokens

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshTokens.push({ token: refreshToken });

    await user.save();

    //Set refresh token in httpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      accessToken,
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(401).json({
        success: false,
        message: "please fill the complete details",
      });
    }

    //find user
    const verifiedUser = await User.findOne({ email });

    if (!verifiedUser) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Credentails" });
    }

    const verifiedPassword = await bcrypt.compare(
      password,
      verifiedUser.password,
    );
    if (!verifiedPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Credentails" });
    }

    const accessToken = generateAccessToken(verifiedUser);
    const refreshToken = generateRefreshToken(verifiedUser._id);

    //Set refresh token in httpOnly cookie

    verifiedUser.refreshTokens.push({ token: refreshToken });
    await verifiedUser.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      accessToken,
      success: true,
      user: {
        id: verifiedUser._id,
        name: verifiedUser.name,
        email: verifiedUser.email,
        role: verifiedUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "server error",
    });
  }
};



export const logoutUser=async(req,res)=>{
try {
  const token = req.cookies.refreshToken;
    if (token) {
      // Remove this refresh token from user
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      const user = await User.findById(decoded.userId);
      if (user) {
        user.refreshTokens = user.refreshTokens.filter(rt => rt.token !== token);
        await user.save();
      }

    }
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully' });


} catch (error) {
  
res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully' });
}

}

export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(401).json({ message: "No refresh token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const tokenExists = user.refreshTokens.find(rt => rt.token === token);
    if (!tokenExists) {
      user.refreshTokens = [];
      await user.save();
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    user.refreshTokens = user.refreshTokens.filter(rt => rt.token !== token);

    const newAccessToken = generateAccessToken(user._id, user.role, user.tenantId);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshTokens.push({ token: newRefreshToken });
    await user.save();

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken: newAccessToken });

  } catch (error) {
    res.status(401).json({ message: "Invalid refresh token" });
  }
};