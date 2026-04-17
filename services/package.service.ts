import {api} from "./api";

interface qrCodeData {
    unique_package_code: string;
    order_id: string;
}

export async function loadPackage(orderId: string): Promise<qrCodeData> {
    const response = await api.post<qrCodeData>(`order/${orderId}/checklist`);
    return response.data;
}