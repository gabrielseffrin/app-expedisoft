import {api} from "./api";

interface qrCodeData {
    qr_code: string;
}

export async function loadPackage(orderId: string, qrCode: qrCodeData): Promise<qrCodeData> {
    const response = await api.post<qrCodeData>(`order/${orderId}/checklist`, qrCode);
    return response.data;
}