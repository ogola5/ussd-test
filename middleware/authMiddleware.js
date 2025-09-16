// export const protect = async (req, res, next) => {
//   try {
//     const auth = req.headers.authorization || "";
//     if (!auth.startsWith("Bearer "))
//       return res.status(401).json({ message: "No token provided" });

//     const token = auth.split(" ")[1];
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const admin = await Admin.findById(decoded.id).select("-password");

//     if (!admin) return res.status(401).json({ message: "Not authorized" });

//     req.admin = admin;
//     next();
//   } catch (err) {
//     console.error("Auth error:", err);
//     res.status(401).json({ message: "Not authorized" });
//   }
// };


import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js'; // adjust path if needed

export const protect = async (req, res, next) => {
  try {
    const auth = req.headers.authorization || '';
    if (!auth.startsWith('Bearer '))
      return res.status(401).json({ message: 'No token provided' });

    const token = auth.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id).select('-password');

    if (!admin) return res.status(401).json({ message: 'Not authorized' });

    req.admin = admin;
    next();
  } catch (err) {
    console.error('Auth error:', err);
    res.status(401).json({ message: 'Not authorized' });
  }
};
