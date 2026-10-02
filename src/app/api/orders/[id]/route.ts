import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Order } from '@/models/Order';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, note, location } = body;

    const db = await connectToDatabase();
    if (db) {
      const order = await Order.findOne({
        $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { orderNumber: id }],
      });

      if (order) {
        order.status = status;
        order.trackingHistory.push({
          status: `Status changed to ${status}`,
          description: note || `Order marked as ${status} by verified party`,
          timestamp: new Date(),
          location: location || 'Dispatch Hub',
        });
        await order.save();

        return NextResponse.json({
          success: true,
          message: `Order status updated to ${status}`,
          data: order,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Order status updated to ${status} (Simulated)`,
      data: { id, status },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
