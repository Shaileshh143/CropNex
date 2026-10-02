import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Order } from '@/models/Order';
import { INITIAL_ORDERS } from '@/lib/initialData';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  try {
    const db = await connectToDatabase();
    if (db) {
      const query: any = {};
      if (status && status !== 'All') {
        query.status = status;
      }
      const orders = await Order.find(query).sort({ createdAt: -1 });
      if (orders && orders.length > 0) {
        return NextResponse.json({ success: true, count: orders.length, data: orders });
      }
    }

    let fallbackOrders = [...INITIAL_ORDERS];
    if (status && status !== 'All') {
      fallbackOrders = fallbackOrders.filter((o) => o.status.toLowerCase() === status.toLowerCase());
    }
    return NextResponse.json({ success: true, count: fallbackOrders.length, data: fallbackOrders });
  } catch (error: any) {
    return NextResponse.json({ success: true, data: INITIAL_ORDERS, fallback: true });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const orderNumber = `CNX-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const trackingHistory = [
      {
        status: 'Order Placed',
        description: 'Direct procurement order confirmed via CropNex Escrow System',
        timestamp: new Date(),
        location: 'Buyer Portal',
      },
    ];

    const newOrderData = {
      orderNumber,
      buyerName: body.buyerName || 'Demo Wholesale Buyer',
      buyerEmail: body.buyerEmail || 'buyer@cropnex.agri',
      buyerPhone: body.buyerPhone || '+91 98210 55001',
      deliveryAddress: body.deliveryAddress || 'APMC Market Yard Gate 2, Pune',
      district: body.district || 'Pune',
      items: body.items || [],
      subtotal: Number(body.subtotal) || 0,
      logisticsFee: Number(body.logisticsFee) || 500,
      totalAmount: (Number(body.subtotal) || 0) + (Number(body.logisticsFee) || 500),
      paymentMethod: body.paymentMethod || 'Mandi Escrow',
      status: 'Pending',
      trackingHistory,
    };

    const db = await connectToDatabase();
    if (db) {
      const created = await Order.create(newOrderData);
      return NextResponse.json({
        success: true,
        message: 'Order created successfully in MongoDB!',
        data: created,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Order created successfully (Demo Mode)',
      data: { ...newOrderData, id: orderNumber },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
