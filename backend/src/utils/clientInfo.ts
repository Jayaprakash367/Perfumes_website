import { Request } from 'express';

export interface ClientDeviceInfo {
  ipAddress: string;
  userAgent: string;
  device: string;
  browser: string;
  os: string;
}

export function parseClientInfo(req: Request): ClientDeviceInfo {
  // Extract client IP (handle proxies & local dev)
  const forwarded = req.headers['x-forwarded-for'];
  let ipAddress = '127.0.0.1';
  if (typeof forwarded === 'string') {
    ipAddress = forwarded.split(',')[0].trim();
  } else if (Array.isArray(forwarded) && forwarded.length > 0) {
    ipAddress = forwarded[0].trim();
  } else if (req.socket?.remoteAddress) {
    ipAddress = req.socket.remoteAddress;
  } else if (req.ip) {
    ipAddress = req.ip;
  }

  // Normalize localhost ipv6 to ipv4
  if (ipAddress === '::1' || ipAddress === '::ffff:127.0.0.1') {
    ipAddress = '127.0.0.1 (Localhost)';
  }

  const userAgent = (req.headers['user-agent'] as string) || 'Unknown Browser';

  // Parse OS
  let os = 'Unknown OS';
  if (/windows nt 10/i.test(userAgent)) os = 'Windows 10/11';
  else if (/windows nt 6\.3/i.test(userAgent)) os = 'Windows 8.1';
  else if (/windows nt 6\.1/i.test(userAgent)) os = 'Windows 7';
  else if (/macintosh|mac os x/i.test(userAgent)) os = 'macOS';
  else if (/android/i.test(userAgent)) os = 'Android';
  else if (/iphone|ipad|ipod/i.test(userAgent)) os = 'iOS';
  else if (/linux/i.test(userAgent)) os = 'Linux';

  // Parse Browser
  let browser = 'Unknown Browser';
  if (/edg/i.test(userAgent)) browser = 'Microsoft Edge';
  else if (/opr|opera/i.test(userAgent)) browser = 'Opera';
  else if (/chrome|crios/i.test(userAgent)) browser = 'Google Chrome';
  else if (/firefox|fxios/i.test(userAgent)) browser = 'Mozilla Firefox';
  else if (/safari/i.test(userAgent)) browser = 'Apple Safari';
  else if (/postman/i.test(userAgent)) browser = 'Postman Runtime';

  // Parse Device Type
  let device = 'Desktop';
  if (/ipad|tablet/i.test(userAgent)) {
    device = 'Tablet';
  } else if (/mobile|iphone|android/i.test(userAgent)) {
    device = 'Mobile Device';
  }

  return {
    ipAddress,
    userAgent,
    device: `${device} (${browser})`,
    browser,
    os,
  };
}
