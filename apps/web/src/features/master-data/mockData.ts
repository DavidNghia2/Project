import { INITIAL_PRODUCTS } from '../products/mockData';
import type { Product } from '../products/types';
import type { Language } from '../../i18n';
import { translateKey } from '../../i18n/translate';
import { translateDomainLabel } from '../../i18n/domainTranslate';
import type {
  Warehouse,
  Category,
  UnitOfMeasure,
  Supplier,
  ProductReferenceSummary,
} from './types';

/* ==========================================================================
   1. WAREHOUSES MOCK DATA
   ========================================================================== */
export const WAREHOUSE_REGIONS = ['Miền Bắc', 'Miền Trung', 'Miền Nam'];

export const INITIAL_WAREHOUSES: Warehouse[] = [
  {
    id: 'wh-01',
    code: 'WH-01',
    name: 'Kho Tổng Hà Nội',
    region: 'Miền Bắc',
    type: 'main',
    address: 'Khu Công Nghiệp Nam Từ Liêm, Hà Nội',
    manager: 'Nguyễn Văn Nam',
    staffCount: 14,
    capacityPercent: 82,
    description: 'Kho trung tâm khu vực phía Bắc, phụ trách tiếp nhận hàng nhập khẩu và điều phối liên vùng.',
    status: 'active',
    createdAt: '2026-01-10T08:00:00Z',
    updatedAt: '2026-11-05T09:30:00Z',
  },
  {
    id: 'wh-02',
    code: 'WH-02',
    name: 'Kho Đà Nẵng',
    region: 'Miền Trung',
    type: 'regional',
    address: 'Đường số 3, KCN Hòa Khánh, Liên Chiểu, Đà Nẵng',
    manager: 'Trần Thị Thu',
    staffCount: 8,
    capacityPercent: 58,
    description: 'Kho trung chuyển miền Trung, phục vụ giao nhận nội vùng và lưu trữ thiết bị văn phòng.',
    status: 'active',
    createdAt: '2026-02-14T08:30:00Z',
    updatedAt: '2026-11-02T14:15:00Z',
  },
  {
    id: 'wh-03',
    code: 'WH-03',
    name: 'Kho Trung Chuyển HCM',
    region: 'Miền Nam',
    type: 'transit',
    address: 'Khu Chế Xuất Tân Thuận, Quận 7, TP. Hồ Chí Minh',
    manager: 'Lê Hoàng Long',
    staffCount: 22,
    capacityPercent: 91,
    description: 'Trung tâm phân phối trọng điểm khu vực phía Nam với tốc độ xuất hàng cao.',
    status: 'active',
    createdAt: '2026-01-20T09:00:00Z',
    updatedAt: '2026-11-08T16:40:00Z',
  },
  {
    id: 'wh-04',
    code: 'WH-04',
    name: 'Kho Dự Phòng Hải Phòng',
    region: 'Miền Bắc',
    type: 'reserve',
    address: 'KCN VSIP Thủy Nguyên, Hải Phòng',
    manager: 'Phạm Minh Đức',
    staffCount: 4,
    capacityPercent: 0,
    description: 'Kho dự phòng phục vụ mùa cao điểm hoặc lưu trữ tạm thời khi bảo trì kho chính.',
    status: 'inactive',
    createdAt: '2026-06-01T10:00:00Z',
    updatedAt: '2026-10-15T11:20:00Z',
  },
];

/* ==========================================================================
   2. CATEGORIES MOCK DATA
   ========================================================================== */
export const CATEGORY_PARENT_GROUPS = [
  'Phần cứng & Thiết bị CNTT',
  'Mạng & Hạ tầng',
  'Vật tư & Phụ kiện',
  'Thiết bị Văn phòng',
];

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-01',
    code: 'CAT-IT-ACC',
    name: 'Phụ kiện máy tính',
    parentGroup: 'Vật tư & Phụ kiện',
    description: 'Bàn phím, chuột quang, tai nghe, đế tản nhiệt và thiết bị ngoại vi văn phòng.',
    status: 'active',
    createdAt: '2026-01-05T08:00:00Z',
    updatedAt: '2026-10-20T10:00:00Z',
  },
  {
    id: 'cat-02',
    code: 'CAT-MONITOR',
    name: 'Màn hình hiển thị',
    parentGroup: 'Phần cứng & Thiết bị CNTT',
    description: 'Màn hình IPS văn phòng, màn hình đồ họa chuyên dụng và màn hình ghép.',
    status: 'active',
    createdAt: '2026-01-05T08:15:00Z',
    updatedAt: '2026-10-22T09:00:00Z',
  },
  {
    id: 'cat-03',
    code: 'CAT-LAPTOP',
    name: 'Laptop & Máy tính',
    parentGroup: 'Phần cứng & Thiết bị CNTT',
    description: 'Máy tính xách tay doanh nghiệp, máy trạm di động và phụ kiện nguồn đồng bộ.',
    status: 'active',
    createdAt: '2026-01-06T09:00:00Z',
    updatedAt: '2026-11-01T11:30:00Z',
  },
  {
    id: 'cat-04',
    code: 'CAT-CAB-WIRE',
    name: 'Dây cáp & Cáp nguồn',
    parentGroup: 'Vật tư & Phụ kiện',
    description: 'Cáp sạc USB-C, HDMI, DisplayPort, cáp mạng và dây tín hiệu các loại.',
    status: 'active',
    createdAt: '2026-01-08T10:00:00Z',
    updatedAt: '2026-10-28T15:00:00Z',
  },
  {
    id: 'cat-05',
    code: 'CAT-SUPPLIES',
    name: 'Vật tư tiêu hao',
    parentGroup: 'Thiết bị Văn phòng',
    description: 'Mực in laser, giấy in A4/A3, tem nhãn mã vạch nhiệt và ruy băng in.',
    status: 'active',
    createdAt: '2026-01-10T08:30:00Z',
    updatedAt: '2026-11-04T14:20:00Z',
  },
  {
    id: 'cat-06',
    code: 'CAT-NETWORK',
    name: 'Thiết bị mạng',
    parentGroup: 'Mạng & Hạ tầng',
    description: 'Switch chuyển mạch Layer 2/3, Router cân bằng tải và Access Point WiFi doanh nghiệp.',
    status: 'active',
    createdAt: '2026-01-12T09:45:00Z',
    updatedAt: '2026-11-06T16:10:00Z',
  },
  {
    id: 'cat-07',
    code: 'CAT-STORAGE',
    name: 'Lưu trữ & Thẻ nhớ',
    parentGroup: 'Phần cứng & Thiết bị CNTT',
    description: 'Ổ cứng SSD gắn trong/di động, ổ NAS doanh nghiệp và thẻ nhớ tốc độ cao.',
    status: 'active',
    createdAt: '2026-01-15T11:00:00Z',
    updatedAt: '2026-11-02T10:15:00Z',
  },
  {
    id: 'cat-08',
    code: 'CAT-COMPONENTS',
    name: 'Linh kiện máy tính',
    parentGroup: 'Phần cứng & Thiết bị CNTT',
    description: 'Bộ nhớ RAM DDR4/DDR5, bo mạch chủ, bộ nguồn và tản nhiệt nâng cấp.',
    status: 'active',
    createdAt: '2026-01-18T13:20:00Z',
    updatedAt: '2026-11-03T11:00:00Z',
  },
  {
    id: 'cat-09',
    code: 'CAT-CONF-AV',
    name: 'Thiết bị hội nghị',
    parentGroup: 'Thiết bị Văn phòng',
    description: 'Webcam phòng họp, loa hội nghị đa hướng và thiết bị trình chiếu không dây (Chờ mở bán).',
    status: 'inactive',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-10-01T09:00:00Z',
  },
];

/* ==========================================================================
   3. UNITS OF MEASUREMENT MOCK DATA
   ========================================================================== */
export const INITIAL_UNITS: UnitOfMeasure[] = [
  {
    id: 'uom-01',
    code: 'UOM-PCS',
    name: 'Cái (Piece)',
    symbol: 'Cái',
    measureType: 'discrete',
    conversionNote: '1 Cái = 1 đơn vị bán lẻ cơ sở',
    description: 'Đơn vị đếm tiêu chuẩn cho chuột, bàn phím và thiết bị cầm tay.',
    status: 'active',
    createdAt: '2026-01-02T08:00:00Z',
    updatedAt: '2026-10-10T08:00:00Z',
  },
  {
    id: 'uom-02',
    code: 'UOM-UNIT',
    name: 'Chiếc (Unit)',
    symbol: 'Chiếc',
    measureType: 'discrete',
    conversionNote: '1 Chiếc = 1 thiết bị nguyên kiện',
    description: 'Dùng cho màn hình, ổ cứng và linh kiện đóng hộp riêng lẻ.',
    status: 'active',
    createdAt: '2026-01-02T08:05:00Z',
    updatedAt: '2026-10-10T08:00:00Z',
  },
  {
    id: 'uom-03',
    code: 'UOM-MCH',
    name: 'Máy (Unit)',
    symbol: 'Máy',
    measureType: 'discrete',
    conversionNote: '1 Máy = 1 máy tính nguyên bộ kèm số Serial',
    description: 'Quản lý theo Serial cho laptop, máy trạm và thiết bị đầu cuối.',
    status: 'active',
    createdAt: '2026-01-02T08:10:00Z',
    updatedAt: '2026-10-10T08:00:00Z',
  },
  {
    id: 'uom-04',
    code: 'UOM-STR',
    name: 'Sợi (Piece)',
    symbol: 'Sợi',
    measureType: 'discrete',
    conversionNote: '1 Sợi = 1 dây cáp hoàn chỉnh đã bấm đầu',
    description: 'Áp dụng cho dây cáp tín hiệu, dây nguồn và cáp mạng đúc sẵn.',
    status: 'active',
    createdAt: '2026-01-02T08:15:00Z',
    updatedAt: '2026-10-10T08:00:00Z',
  },
  {
    id: 'uom-05',
    code: 'UOM-BOX',
    name: 'Hộp (Box)',
    symbol: 'Hộp',
    measureType: 'packaging',
    conversionNote: '1 Hộp = 1 đơn vị quy cách hộp nhà sản xuất',
    description: 'Dùng cho hộp mực in, bộ kit và vật tư văn phòng đóng hộp.',
    status: 'active',
    createdAt: '2026-01-02T08:20:00Z',
    updatedAt: '2026-10-10T08:00:00Z',
  },
  {
    id: 'uom-06',
    code: 'UOM-CTN',
    name: 'Thùng (Box)',
    symbol: 'Thùng',
    measureType: 'packaging',
    conversionNote: '1 Thùng = 5 Ram giấy (tương đương 2,500 tờ)',
    description: 'Quy cách đóng thùng carton tiêu chuẩn cho giấy in và vật tư số lượng lớn.',
    status: 'active',
    createdAt: '2026-01-02T08:25:00Z',
    updatedAt: '2026-10-10T08:00:00Z',
  },
  {
    id: 'uom-07',
    code: 'UOM-SET',
    name: 'Bộ (Set)',
    symbol: 'Bộ',
    measureType: 'packaging',
    conversionNote: '1 Bộ = 1 thiết bị chính + phụ kiện lắp đặt đi kèm',
    description: 'Dùng cho thiết bị mạng Switch, Access Point kèm bộ nguồn/giá treo.',
    status: 'active',
    createdAt: '2026-01-02T08:30:00Z',
    updatedAt: '2026-10-10T08:00:00Z',
  },
  {
    id: 'uom-08',
    code: 'UOM-BAR',
    name: 'Thanh (Piece)',
    symbol: 'Thanh',
    measureType: 'discrete',
    conversionNote: '1 Thanh = 1 mô-đun RAM đơn lẻ',
    description: 'Đơn vị chuyên biệt cho thanh nhớ RAM máy tính.',
    status: 'active',
    createdAt: '2026-01-02T08:35:00Z',
    updatedAt: '2026-10-10T08:00:00Z',
  },
  {
    id: 'uom-09',
    code: 'UOM-ROLL',
    name: 'Cuộn (Roll)',
    symbol: 'Cuộn',
    measureType: 'length',
    conversionNote: '1 Cuộn = 305 mét (1,000 ft) cáp mạng hoặc 1,000 tem nhãn',
    description: 'Áp dụng cho cuộn dây cáp mạng chưa cắt hoặc cuộn giấy in nhiệt.',
    status: 'inactive',
    createdAt: '2026-01-02T08:40:00Z',
    updatedAt: '2026-10-10T08:00:00Z',
  },
];

/* ==========================================================================
   4. SUPPLIERS MOCK DATA
   ========================================================================== */
export const SUPPLIER_PAYMENT_TERMS = [
  'Thanh toán ngay (COD / Prepay)',
  'Công nợ 15 ngày (Net 15)',
  'Công nợ 30 ngày (Net 30)',
  'Công nợ 45 ngày (Net 45)',
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-01',
    code: 'SUP-LOGI-VN',
    name: 'Công ty TNHH Logitech Việt Nam',
    categoryFocus: 'Phụ kiện máy tính',
    contactPerson: 'Trịnh Minh Tâm',
    phone: 'ext. 101-8899',
    email: 'tam.trinh@logitech-dist.example',
    address: 'Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    paymentTerms: 'Công nợ 30 ngày (Net 30)',
    notes: 'Nhà phân phối chính hãng thiết bị ngoại vi Logitech khu vực Đông Dương.',
    status: 'active',
    createdAt: '2026-01-08T08:00:00Z',
    updatedAt: '2026-11-01T10:00:00Z',
  },
  {
    id: 'sup-02',
    code: 'SUP-DELL-DIST',
    name: 'Nhà Phân Phối Dell Global Trading',
    categoryFocus: 'Màn hình hiển thị',
    contactPerson: 'Hoàng Quốc Việt',
    phone: 'ext. 204-5566',
    email: 'viet.hq@dellglobal.example',
    address: 'Phường Kim Mã, Quận Ba Đình, Hà Nội',
    paymentTerms: 'Công nợ 30 ngày (Net 30)',
    notes: 'Chuyên cung cấp màn hình dòng P-Series và UltraSharp theo hợp đồng khung.',
    status: 'active',
    createdAt: '2026-01-10T09:00:00Z',
    updatedAt: '2026-11-03T11:20:00Z',
  },
  {
    id: 'sup-03',
    code: 'SUP-SYN-APL',
    name: 'Synnex FPT Distribution Partner',
    categoryFocus: 'Laptop & Thiết bị mạng',
    contactPerson: 'Đặng Mai Phương',
    phone: 'ext. 308-6600',
    email: 'phuongdm@synnex-partner.example',
    address: 'Phường Dịch Vọng Hậu, Quận Cầu Giấy, Hà Nội',
    paymentTerms: 'Công nợ 45 ngày (Net 45)',
    notes: 'Đối tác phân phối ủy quyền Apple MacBook, thiết bị mạng Cisco và Ubiquiti.',
    status: 'active',
    createdAt: '2026-01-12T10:30:00Z',
    updatedAt: '2026-11-07T09:15:00Z',
  },
  {
    id: 'sup-04',
    code: 'SUP-FAST-CAB',
    name: 'Công ty Cổ phần Thiết Bị FastLink',
    categoryFocus: 'Dây cáp & Cáp nguồn',
    contactPerson: 'Lưu Gia Huy',
    phone: 'ext. 412-7799',
    email: 'contact@fastlink-cab.example',
    address: 'Phường Thạch Thang, Quận Hải Châu, Đà Nẵng',
    paymentTerms: 'Công nợ 15 ngày (Net 15)',
    notes: 'Cung ứng cáp kết nối tốc độ cao, dây tín hiệu và phụ kiện lắp đặt.',
    status: 'active',
    createdAt: '2026-02-01T08:00:00Z',
    updatedAt: '2026-10-25T14:45:00Z',
  },
  {
    id: 'sup-05',
    code: 'SUP-VPP-HN',
    name: 'Công ty VPP Văn Phòng Hà Nội',
    categoryFocus: 'Vật tư tiêu hao',
    contactPerson: 'Nguyễn Thu Hà',
    phone: 'ext. 515-2211',
    email: 'ha.nguyen@vpphanoi.example',
    address: 'Phường Thanh Xuân Trung, Quận Thanh Xuân, Hà Nội',
    paymentTerms: 'Công nợ 15 ngày (Net 15)',
    notes: 'Cung cấp giấy in văn phòng và hộp mực in chính hãng giao hàng theo tuần.',
    status: 'active',
    createdAt: '2026-02-15T09:30:00Z',
    updatedAt: '2026-11-04T15:00:00Z',
  },
  {
    id: 'sup-06',
    code: 'SUP-TECH-MEM',
    name: 'An Phát Tech Distribution',
    categoryFocus: 'Lưu trữ & Linh kiện',
    contactPerson: 'Bùi Tuấn Anh',
    phone: 'ext. 618-4433',
    email: 'anh.bui@anphattech.example',
    address: 'Phường Phương Mai, Quận Đống Đa, Hà Nội',
    paymentTerms: 'Công nợ 30 ngày (Net 30)',
    notes: 'Đối tác chuyên linh kiện RAM Kingston và ổ cứng thể rắn SSD Samsung.',
    status: 'active',
    createdAt: '2026-03-01T08:45:00Z',
    updatedAt: '2026-11-08T10:30:00Z',
  },
  {
    id: 'sup-07',
    code: 'SUP-BACKUP-BN',
    name: 'Công ty Vật Tư Công Nghiệp Bắc Ninh',
    categoryFocus: 'Vật tư & Đóng gói',
    contactPerson: 'Vũ Quốc Khánh',
    phone: 'ext. 790-1122',
    email: 'khanh.vu@vattubn.example',
    address: 'KCN Yên Phong, Huyện Yên Phong, Bắc Ninh',
    paymentTerms: 'Thanh toán ngay (COD / Prepay)',
    notes: 'Nhà cung cấp dự phòng bao bì và vật tư phụ trợ (Hiện chưa phát sinh mã hàng gán).',
    status: 'inactive',
    createdAt: '2026-08-10T10:00:00Z',
    updatedAt: '2026-10-05T16:00:00Z',
  },
];

/* ==========================================================================
   REFERENTIAL INTEGRITY LOOKUP HELPERS
   ========================================================================== */
export function getWarehouseReferences(
  warehouseCode: string,
  products: Product[] = INITIAL_PRODUCTS,
  language: Language = 'vi'
): ProductReferenceSummary[] {
  return products
    .filter((p) => {
      const whEntry = p.warehouses.find((w) => w.warehouseCode === warehouseCode);
      return Boolean(whEntry && whEntry.quantity > 0);
    })
    .map((p) => {
      const qty = p.warehouses.find((w) => w.warehouseCode === warehouseCode)?.quantity ?? 0;
      const unitLabel = translateDomainLabel(language, 'units', p.unit);
      return {
        id: p.id,
        sku: p.sku,
        name: p.name,
        detailText: translateKey(language, 'masterData.common.refStockAtWh', { qty, unit: unitLabel }),
        status: p.status,
      };
    });
}

export function getCategoryReferences(
  categoryName: string,
  products: Product[] = INITIAL_PRODUCTS,
  language: Language = 'vi'
): ProductReferenceSummary[] {
  return products
    .filter((p) => p.category.toLowerCase() === categoryName.trim().toLowerCase())
    .map((p) => ({
      id: p.id,
      sku: p.sku,
      name: p.name,
      detailText: translateKey(language, 'masterData.common.refTotalOnHand', {
        qty: p.onHand,
        unit: translateDomainLabel(language, 'units', p.unit),
      }),
      status: p.status,
    }));
}

export function getUnitReferences(
  unitName: string,
  products: Product[] = INITIAL_PRODUCTS,
  language: Language = 'vi'
): ProductReferenceSummary[] {
  return products
    .filter((p) => p.unit.toLowerCase() === unitName.trim().toLowerCase())
    .map((p) => ({
      id: p.id,
      sku: p.sku,
      name: p.name,
      detailText: translateKey(language, 'masterData.common.refCategory', {
        category: translateDomainLabel(language, 'categories', p.category),
      }),
      status: p.status,
    }));
}

export function getSupplierReferences(
  supplierCode: string,
  products: Product[] = INITIAL_PRODUCTS,
  language: Language = 'vi'
): ProductReferenceSummary[] {
  return products
    .filter((p) => p.supplierCode?.toUpperCase() === supplierCode.trim().toUpperCase())
    .map((p) => ({
      id: p.id,
      sku: p.sku,
      name: p.name,
      detailText: translateKey(language, 'masterData.common.refAvailableStock', {
        qty: p.onHand,
        unit: translateDomainLabel(language, 'units', p.unit),
      }),
      status: p.status,
    }));
}
