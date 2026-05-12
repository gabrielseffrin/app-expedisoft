import {api} from "./api";

interface QrCodeData {
    qr_code: string;
}

export async function loadPackage(orderId: string, qrCode: QrCodeData): Promise<QrCodeData> {
    const response = await api.post<QrCodeData>(`/order/${orderId}/checklist`, qrCode);
    return response.data;
}