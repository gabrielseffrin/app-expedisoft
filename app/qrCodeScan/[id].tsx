// app/qrCodeScan
import { CameraView } from "expo-camera";
import {StyleSheet, View, TouchableOpacity, Text, Alert} from "react-native";
import { useState } from "react";
import {router, useLocalSearchParams} from "expo-router";
import { Feather } from "@expo/vector-icons";
import {loadPackage} from "@/services/package.service";

export default function QrCodeScan() {

    const {id} = useLocalSearchParams();
    const orderId = Array.isArray(id) ? id[0] : id;

    const [scanned, setScanned] = useState(false);

    const handleBarCodeScanned = async ({ data }: { data: string }) => {
        if (scanned) return;

        if (!orderId) {
            Alert.alert("Erro", "ID da ordem inválido. Volte e tente novamente.");
            return;
        }

        setScanned(true);

        try {
            await loadPackage(orderId, { qr_code: data });

            Alert.alert("Sucesso!", "A caixa foi adicionada à ordem.");
        } catch (error) {
            Alert.alert("Erro!", "Não foi possível adicionar a caixa. Tente novamente.");
        } finally {
            setTimeout(() => {
                router.back();
            }, 1500);
        }
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