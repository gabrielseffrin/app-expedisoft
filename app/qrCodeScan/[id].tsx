// app/qrCodeScan (Certifique-se de que está dentro da pasta app)
import { CameraView } from "expo-camera";
import { StyleSheet, View, TouchableOpacity, Text } from "react-native";
import { useState } from "react";
import {router, useLocalSearchParams, useRouter} from "expo-router";
import { Feather } from "@expo/vector-icons";

export default function QrCodeScan() {

    const {id} = useLocalSearchParams();
    const orderId = Array.isArray(id) ? id[0] : id;

    const [scanned, setScanned] = useState(false);

    const handleBarCodeScanned = ({ data }: { data: string }) => {
        if (scanned) return;

        setScanned(true);
        console.log("QR Code Lido:", data);

        alert(`Código lido: ${data} e associado à ordem ${orderId}`);

        // Volta para a tela da ordem após ler
        setTimeout(() => {
            router.back();
        }, 1500);
    };

    return (
        <View style={styles.container}>
            <CameraView
                style={StyleSheet.absoluteFillObject}
                facing="back"
                barcodeScannerSettings={{
                    barcodeTypes: ["qr"],
                }}
                onBarcodeScanned={handleBarCodeScanned}
            />

            <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
                <Feather name="x" size={28} color="#FFF" />
            </TouchableOpacity>

            <View style={styles.overlay}>
                <View style={styles.scanArea} />
                <Text style={styles.instructionText}>Aponte para o QR Code da caixa</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 10,
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 50,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scanArea: {
        width: 250,
        height: 250,
        borderWidth: 2,
        borderColor: '#3B82F6',
        backgroundColor: 'transparent',
        borderRadius: 12,
    },
    instructionText: {
        color: '#FFF',
        marginTop: 20,
        fontSize: 16,
        fontWeight: 'bold',
    }
});