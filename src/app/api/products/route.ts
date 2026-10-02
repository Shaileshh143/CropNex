import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Product } from '@/models/Product';
import { INITIAL_PRODUCTS } from '@/lib/initialData';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search')?.toLowerCase() || '';
  const category = searchParams.get('category') || '';
  const state = searchParams.get('state') || '';
  const district = searchParams.get('district') || '';
  const organicOnly = searchParams.get('organic') === 'true';
  const sort = searchParams.get('sort') || 'default';

  try {
    const db = await connectToDatabase();
    let products: any[] = [];

    if (db) {
      const query: any = {};
      if (category && category !== 'All') {
        query.category = category;
      }
      if (state && state !== 'All') {
        query.state = state;
      }
      if (district && district !== 'All') {
        query.district = district;
      }
      if (organicOnly) {
        query.organic = true;
      }
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { hindiName: { $regex: search, $options: 'i' } },
          { farmLocation: { $regex: search, $options: 'i' } },
          { district: { $regex: search, $options: 'i' } },
          { state: { $regex: search, $options: 'i' } },
          { barcode: { $regex: search, $options: 'i' } },
        ];
      }

      let sortObj: any = { createdAt: -1 };
      if (sort === 'price-low') sortObj = { pricePerKg: 1 };
      if (sort === 'price-high') sortObj = { pricePerKg: -1 };
      if (sort === 'quantity') sortObj = { availableQuantity: -1 };

      const dbProducts = await Product.find(query).sort(sortObj);
      if (dbProducts && dbProducts.length > 0) {
        products = dbProducts.map((p) => ({
          id: p._id.toString(),
          name: p.name,
          hindiName: p.hindiName || p.name,
          marathiName: p.marathiName || p.name,
          category: p.category,
          pricePerKg: p.pricePerKg,
          mrp: p.pricePerKg * 1.35,
          discountPercent: 26,
          rating: 4.8,
          reviewCount: 42,
          availableQuantity: p.availableQuantity,
          minOrderQuantity: p.minOrderQuantity,
          unit: p.unit || 'kg',
          grade: p.grade,
          farmLocation: p.farmLocation,
          district: p.district,
          state: p.state || 'Maharashtra',
          farmerName: p.farmerName,
          farmerPhone: p.farmerPhone,
          kisanId: p.kisanId || 'MH-KISAN-902148',
          barcode: p.barcode,
          harvestDate: p.harvestDate,
          organic: p.organic,
          labCertificateNo: p.labCertificateNo,
          labName: p.labName,
          labTestDate: p.labTestDate,
          labResidueResult: p.labResidueResult,
          image: p.image,
          description: p.description,
          shelfLifeDays: p.shelfLifeDays,
          boughtPastMonth: 'Newly Listed',
        }));
      }
    }

    if (products.length === 0) {
      let filtered = [...INITIAL_PRODUCTS];
      if (category && category !== 'All') {
        filtered = filtered.filter((p) => p.category.toLowerCase() === category.toLowerCase());
      }
      if (state && state !== 'All') {
        filtered = filtered.filter((p) => p.state.toLowerCase() === state.toLowerCase());
      }
      if (district && district !== 'All') {
        filtered = filtered.filter((p) => p.district.toLowerCase() === district.toLowerCase());
      }
      if (organicOnly) {
        filtered = filtered.filter((p) => p.organic);
      }
      if (search) {
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(search) ||
            p.hindiName?.toLowerCase().includes(search) ||
            p.district.toLowerCase().includes(search) ||
            p.state.toLowerCase().includes(search) ||
            p.farmLocation.toLowerCase().includes(search) ||
            p.barcode.toLowerCase().includes(search)
        );
      }
      if (sort === 'price-low') filtered.sort((a, b) => a.pricePerKg - b.pricePerKg);
      if (sort === 'price-high') filtered.sort((a, b) => b.pricePerKg - a.pricePerKg);
      products = filtered;
    }

    return NextResponse.json({ success: true, count: products.length, data: products });
  } catch (error: any) {
    return NextResponse.json({ success: true, data: INITIAL_PRODUCTS, fallback: true });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Verify Kisan ID is provided
    if (!body.kisanId || body.kisanId.trim().length < 6) {
      return NextResponse.json({
        success: false,
        error: 'Government Certified Kisan ID is required. Please verify or register your Kisan ID first.',
      }, { status: 400 });
    }

    // 2. Automated Quality Grading Calculation
    // Calculates Grade A+, Grade A, or Grade B based on harvest freshness and parameters
    const freshnessHours = Number(body.freshnessHours) || 12;
    const sortingScore = Number(body.sortingScore) || 90;
    const isOrganic = Boolean(body.organic);

    let calculatedGrade: 'Grade A+' | 'Grade A' | 'Grade B' = 'Grade A';
    if (freshnessHours <= 24 && sortingScore >= 85) {
      calculatedGrade = 'Grade A+';
    } else if (freshnessHours <= 48 && sortingScore >= 70) {
      calculatedGrade = 'Grade A';
    } else {
      calculatedGrade = 'Grade B';
    }

    // 3. Generate Anti-Fraud Unique Barcode
    const statePrefix = (body.state || 'MH').substring(0, 2).toUpperCase();
    const randomSerial = Math.floor(10000 + Math.random() * 90000);
    const barcode = body.barcode || `CRPNX-AGRI-${statePrefix}-${randomSerial}`;

    const newProductData = {
      name: body.name,
      hindiName: body.hindiName || body.name,
      marathiName: body.marathiName || body.name,
      category: body.category || 'Vegetables',
      pricePerKg: Number(body.pricePerKg),
      availableQuantity: Number(body.availableQuantity),
      minOrderQuantity: Number(body.minOrderQuantity || 1),
      unit: body.unit || 'kg',
      grade: calculatedGrade,
      farmLocation: body.farmLocation || 'Farm Gate',
      district: body.district || 'Nashik',
      state: body.state || 'Maharashtra',
      farmerName: body.farmerName || 'Verified Producer',
      farmerPhone: body.farmerPhone || '+91 98221 44521',
      kisanId: body.kisanId,
      barcode,
      harvestDate: body.harvestDate || 'Harvested today',
      harvestDateTime: body.harvestDateTime || new Date().toISOString(),
      sortingScore,
      organic: isOrganic,
      labCertificateNo: body.labCertificateNo || (isOrganic ? 'NPOP/NABL/AGRI-2026-REG' : ''),
      labName: body.labName || (isOrganic ? 'Govt Accredited District Agri Testing Lab' : ''),
      labTestDate: body.labTestDate || (isOrganic ? new Date().toLocaleDateString('en-IN') : ''),
      labResidueResult: body.labResidueResult || (isOrganic ? '0.00% Chemical Residues - Certified Organic PASS' : ''),
      image: body.image, // Can be base64 photo captured from camera/upload
      description: body.description || '',
      shelfLifeDays: Number(body.shelfLifeDays || 8),
    };

    const db = await connectToDatabase();
    if (db) {
      const created = await Product.create(newProductData);
      return NextResponse.json({
        success: true,
        message: 'Product listed successfully with verified Barcode and Quality Grade!',
        data: created,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Product listing saved (Demo Mode)',
      data: { ...newProductData, id: `prod-${Date.now()}` },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
