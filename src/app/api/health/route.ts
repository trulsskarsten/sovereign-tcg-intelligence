/**
 * System Health Heartbeat
 * 
 * Used by external monitoring tools to verify app availability.
 */

import { NextResponse } from 'next/server';

export async function GET() {
  const start = Date.now();

  try {
    // 1. Basic Health Check
    return NextResponse.json({
      status: 'healthy',
      version: '1.0.0-beta',
      uptime: process.uptime(),
      latency: `${Date.now() - start}ms`,
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (err) {
    return NextResponse.json({
      status: 'unhealthy',
      error: 'System core check failed'
    }, { status: 500 });
  }
}
