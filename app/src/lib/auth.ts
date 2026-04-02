/**
 * Простая проверка авторизации администратора.
 * 
 * Поддерживает:
 * - Header: Authorization: Bearer <ADMIN_SECRET>
 * - Header: X-Admin-Secret: <ADMIN_SECRET>
 */

import { NextRequest, NextResponse } from 'next/server';

export function verifyAdmin(req: NextRequest): { authorized: boolean; error?: NextResponse } {
  const secret = process.env.ADMIN_SECRET;

  if (!secret) {
    return {
      authorized: false,
      error: NextResponse.json(
        { error: 'ADMIN_SECRET not configured on server' },
        { status: 500 }
      ),
    };
  }

  // Проверяем Bearer токен
  const authHeader = req.headers.get('authorization');
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '').trim();
    if (token === secret) {
      return { authorized: true };
    }
  }

  // Проверяем кастомный заголовок
  const customHeader = req.headers.get('x-admin-secret');
  if (customHeader === secret) {
    return { authorized: true };
  }

  return {
    authorized: false,
    error: NextResponse.json(
      { error: 'Unauthorized: invalid admin credentials' },
      { status: 401 }
    ),
  };
}
