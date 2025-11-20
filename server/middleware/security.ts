import { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

export const rateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  message: "Too many requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

export const strictRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 5, // 5 requests per minute for expensive operations
  message: "Rate limit exceeded for this operation.",
});

export function adminAuth(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers["x-api-key"];
  const adminKey = process.env.ADMIN_API_KEY;

  if (!adminKey) {
    return res.status(500).json({ error: "Admin authentication not configured" });
  }

  if (apiKey !== adminKey) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  next();
}

export function setupSecurity(app: any) {
  // Helmet for security headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          imgSrc: ["'self'", "data:", "https:", "blob:"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          connectSrc: ["'self'"],
        },
      },
    })
  );

  // Body size limits
  app.use((req: Request, res: Response, next: NextFunction) => {
    // 50MB limit for image uploads
    next();
  });
}
