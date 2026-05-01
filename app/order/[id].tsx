// app/order/[id].tsx
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    FlatList,
    Alert,
    Modal,
    TextInput,
    Image
} from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { getOrder, startLoad, finishLoad, uploadOrderPhotos } from "@/services/order.service";
import { Card } from "@/components/ui/card";
import { QrCode, Camera, X } from "lucide-react-native/icons";
import { useCameraPermissions } from "expo-camera";
import * as ImagePicker from 'expo-image-picker';

import { PackageCard, Package } from '@/components/PackageCard';

interface Order {
    id: string;
    external_id: string;
    vehicle?: string;
    customerName?: string;
    customer?: string;
    destination: string;
    carrier: string;
    status: 'scheduled' | 'pending' | 'completed' | 'cancelled' | 'in_progress';
    items: {
        product: { description: string; sku: string; unit: string; };
        packages: Package[];
    }[];
}

export default function OrderDetails() {
    const { id } = useLocalSearchParams<{ id: string }>();

    const [order, setOrder] = useState<Order | null>(null);
    const [permission, requestPermission] = useCameraPermissions();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isModalVisiblePhoto, setIsModalVisiblePhoto] = useState(false);
    const [justification, setJustification] = useState('');

    const [images, setImages] = useState<string[]>([]);

    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchOrderDetails = async (isSilent = false) => {
        if (!id) return;

        if (!isSilent) setLoading(true);
        try {
            const orderId = Array.isArray(id) ? id[0] : id;
            const response = await getOrder(orderId);
            setOrder(response.data);
            setError(null);
        } catch (err) {
            setError("Não foi possível carregar os detalhes da carga.");
        } finally {
            if (!isSilent) setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchOrderDetails(true);
        }, [id])
    );

    const handleLoadAction = (action: 'start' | 'finish') => {
        if (action === 'finish') {
            setIsModalVisible(true);
        } else {
            executeAction(action);
        }
    };

    const executeAction = async (action: 'start' | 'finish', justificationText?: string) => {
        if (!order) return;

        setActionLoading(true);
        setError(null);
        setIsModalVisible(false);

        if (action === 'start') {
            try {
                await startLoad(order.id);
                await fetchOrderDetails(true);
            } catch (err: any) {
                setError("Não foi possível iniciar o carregamento.");
                console.error("Erro ao iniciar o carregamento:", err.response?.data || err.message);
            } finally {
                setActionLoading(false);
            }
            return;
        }


        let uploadSucesso = true;

        if (images.length > 0) {
            try {
                const formData = new FormData();

                images.forEach((uri, index) => {
                    const filename = uri.split('/').pop() || `foto_${index}.jpg`;
                    const match = /\.(\w+)$/.exec(filename);
                    const type = match ? `image/${match[1]}` : `image/jpeg`;

                    formData.append('photos[]', {
                        uri: uri,
                        name: filename,
                        type: type,
                    } as any);
                });

                await uploadOrderPhotos(order.id, formData);
            } catch (err: any) {
                uploadSucesso = false;

                console.log("=== ERRO DE UPLOAD DE FOTO ===");
                console.log("Status:", err.response?.status);
                console.log("Resposta do servidor:", JSON.stringify(err.response?.data, null, 2));

                setError("Falha ao enviar as fotos. Verifique sua conexão e tente novamente.");
            }
        }

        if (uploadSucesso) {
            try {
                await finishLoad(order.id, justificationText);
                setImages([]);
                await fetchOrderDetails(true);
            } catch (err: any) {
                console.log("=== ERRO NA FINALIZAÇÃO ===");
                console.log("Resposta do servidor:", JSON.stringify(err.response?.data, null, 2));

                setError("As fotos foram enviadas, mas ocorreu um erro ao finalizar a carga.");
            }
        }

        setActionLoading(false);
        setJustification('');
    }

    const scanPackage = async () => {
        if (!permission?.granted) {
            const { granted } = await requestPermission();
            if (!granted) {
                Alert.alert("Permissão negada", "É necessário dar permissão da câmera para escanear.");
                return;
            }
        }
        router.push(`/qrCodeScan/${order?.id}`);
    }

    const removePhoto = (uriToRemove: string) => {
        setImages(prev => prev.filter(uri => uri !== uriToRemove));
    };

    const handleAddPhotosLocally = (uris: string[]) => {
        setImages(prev => [...new Set([...prev, ...uris])]);
    };

    const takePhoto = async () => {
        if (!permission?.granted) {
            const { granted } = await requestPermission();
            if (!granted) {
                Alert.alert("Permissão negada", "É necessário dar permissão da câmera para tirar fotos.");
                return;
            }
        }

        let result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: false,
            quality: 0.5,
        });

        if (!result.canceled && result.assets.length > 0) {
            setIsUploadingPhoto(true);
            try {
                handleAddPhotosLocally([result.assets[0].uri]);
            } catch (error) {
                Alert.alert("Erro", "Não foi possível carregar a foto.");
            } finally {
                setIsUploadingPhoto(false);
            }
        }
    }

    const pickImageFromGallery = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissionResult.granted) {
            Alert.alert("Permissão negada", "É necessário dar permissão para acessar a galeria.");
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: false,
            quality: 0.5,
            allowsMultipleSelection: true,
            selectionLimit: 5,
        });

        if (!result.canceled && result.assets.length > 0) {
            setIsUploadingPhoto(true);
            try {
                const uris = result.assets.map(asset => asset.uri);

                await new Promise(resolve => setTimeout(resolve, 1000));

                handleAddPhotosLocally(uris);
            } catch (error) {
                Alert.alert("Erro", "Não foi possível carregar as fotos.");
            } finally {
                setIsUploadingPhoto(false);
            }
        }
    }

    const packages = useMemo(() => {
        if (!order || !order.items) return [];

        return order.items.flatMap((item) =>
            item.packages.map((pkg) => ({
                ...pkg,
                productDescription: item.product.description,
                productSKU: item.product.sku,
                unit: item.product.unit,
            }))
        );
    }, [order]);

    const totalPackages = packages.length;
    const packagesConferred = packages.filter((pkg) => pkg.status === 'checked').length;
    const progressPercentage = totalPackages > 0 ? (packagesConferred / totalPackages) * 100 : 0;
    const isComplete = packagesConferred === totalPackages;

    const renderHeader = () => {
        if (!order) return null;

        return (
            <>
                {error && (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                )}

                <Card style={styles.card}>
                    <View style={styles.cardHeaderRow}>
                        <Text style={styles.cardTitle}>Carregamento: #{order.external_id}</Text>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{order.vehicle || 'S/ VEÍCULO'}</Text>
                        </View>
                    </View>

                    <View style={styles.gridContainer}>
                        <View style={styles.gridItem}>
                            <Text style={styles.gridLabel}>Cliente</Text>
                            <Text style={styles.gridValue}>{order.customerName || order.customer}</Text>
                        </View>
                        <View style={styles.gridItem}>
                            <Text style={styles.gridLabel}>Destino</Text>
                            <Text style={styles.gridValue}>{order.destination}</Text>
                        </View>
                        <View style={styles.gridItem}>
                            <Text style={styles.gridLabel}>Total de Caixas</Text>
                            <Text style={styles.gridValue}>{totalPackages}</Text>
                        </View>
                        <View style={styles.gridItem}>
                            <Text style={styles.gridLabel}>Transportadora</Text>
                            <Text style={styles.gridValue}>{order.carrier}</Text>
                        </View>
                    </View>
                </Card>

                <Card style={styles.card}>
                    <View style={styles.progressHeader}>
                        <Text style={styles.progressTitle}>Status da Conferência</Text>
                        <Text style={styles.progressText}>{progressPercentage.toFixed(0)}%</Text>
                    </View>
                    <View style={styles.progressBarBackground}>
                        <View style={[styles.progressBarFill, { width: `${progressPercentage}%` }]} />
                    </View>
                    <View>
                        <Text style={styles.progressTextInfo}>
                            {packagesConferred} de {totalPackages} conferidos.
                        </Text>
                    </View>
                </Card>
            </>
        );
    };

    return (
        <View style={styles.container}>
            {loading && !order ? (
                <ActivityIndicator size="large" color="#0284C7" style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={packages}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item, index }) => <PackageCard pkg={item} index={index} />}
                    ListHeaderComponent={renderHeader}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {!loading && order && order.status !== 'completed' && order.status !== 'cancelled' && order.status !== 'divergence' && (
                <View style={styles.fixedFooter}>
                    <View style={styles.actionRow}>
                        <TouchableOpacity style={styles.actionButtonLight} activeOpacity={0.8} onPress={scanPackage}>
                            <QrCode size={18} color="#1E40AF" />
                            <Text style={styles.actionButtonLightText}>Escanear</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionButtonLight}
                            activeOpacity={0.8}
                            onPress={() => setIsModalVisiblePhoto(true)}
                        >
                            <Camera size={18} color="#1E40AF" />
                            <Text style={styles.actionButtonLightText}>
                                Fotos {images.length > 0 ? `(${images.length})` : ''}
                            </Text>
                        </TouchableOpacity>

                        {(order.status === 'scheduled' || order.status === 'pending') ? (
                            <TouchableOpacity
                                style={styles.actionButtonDark}
                                activeOpacity={0.8}
                                onPress={() => handleLoadAction('start')}
                                disabled={actionLoading}
                            >
                                {actionLoading ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <Text style={styles.actionButtonDarkText}>Iniciar</Text>
                                )}
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                style={styles.actionButtonDark}
                                activeOpacity={0.8}
                                onPress={() => handleLoadAction('finish')}
                                disabled={actionLoading}
                            >
                                {actionLoading ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <Text style={styles.actionButtonDarkText}>Concluir</Text>
                                )}
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            )}

            {/* Modal de Conclusão */}
            <Modal
                visible={isModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={[styles.modalTitle, isComplete && { color: '#059669' }]}>
                            {isComplete ? 'Concluir Carga' : 'Carga Incompleta!'}
                        </Text>

                        <Text style={styles.modalText}>
                            {isComplete
                                ? 'Todas as caixas foram conferidas com sucesso! Deseja adicionar alguma observação antes de finalizar? (Opcional)'
                                : `Faltam ${totalPackages - packagesConferred} caixas para serem conferidas. Por favor, justifique o motivo de finalizar agora (Obrigatório):`
                            }
                        </Text>

                        <TextInput
                            style={styles.textInput}
                            placeholder="Digite a observação..."
                            placeholderTextColor="#9CA3AF"
                            multiline
                            numberOfLines={3}
                            value={justification}
                            onChangeText={setJustification}
                        />

                        <View style={styles.modalActionRow}>
                            <TouchableOpacity
                                style={styles.modalButtonCancel}
                                onPress={() => setIsModalVisible(false)}
                            >
                                <Text style={styles.modalButtonCancelText}>Cancelar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.modalButtonConfirm,
                                    (!isComplete && !justification.trim()) && { backgroundColor: '#93C5FD' }
                                ]}
                                onPress={() => executeAction('finish', justification)}
                                disabled={actionLoading || (!isComplete && !justification.trim())}
                            >
                                {actionLoading ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <Text style={styles.modalButtonConfirmText}>Confirmar</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Modal de Fotos */}
            <Modal
                visible={isModalVisiblePhoto}
                transparent={true}
                animationType="fade"
                onRequestClose={() => !isUploadingPhoto && setIsModalVisiblePhoto(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={[styles.modalTitle, {color: '#1F2937'}]}>Adicionar Foto</Text>
                        <Text style={styles.modalText}>
                            Como você deseja anexar a foto desta carga?
                        </Text>

                        {images.length > 0 && !isUploadingPhoto && (
                            <View style={styles.previewContainer}>
                                <Text style={styles.previewTitle}>Fotos anexadas ({images.length})</Text>
                                <FlatList
                                    data={images}
                                    horizontal
                                    keyExtractor={(item) => item}
                                    showsHorizontalScrollIndicator={false}
                                    renderItem={({ item }) => (
                                        <View style={styles.imageWrapper}>
                                            <Image source={{ uri: item }} style={styles.previewImage} />
                                            <TouchableOpacity
                                                style={styles.removeBadge}
                                                onPress={() => removePhoto(item)}
                                                activeOpacity={0.7}
                                                disabled={isUploadingPhoto}
                                            >
                                                <X size={14} color="#FFFFFF" strokeWidth={3} />
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                    contentContainerStyle={{ paddingVertical: 10, paddingRight: 10 }}
                                />
                            </View>
                        )}

                        {/* --- EXIBIÇÃO DO LOADING --- */}
                        {isUploadingPhoto ? (
                            <View style={{ paddingVertical: 30, alignItems: 'center' }}>
                                <ActivityIndicator size="large" color="#2563EB" />
                                <Text style={{ marginTop: 12, color: '#4B5563', fontWeight: '500' }}>
                                    Processando foto(s)...
                                </Text>
                            </View>
                        ) : (
                            <View style={{ gap: 12, marginBottom: 20 }}>
                                <TouchableOpacity
                                    style={styles.modalOptionDark}
                                    onPress={takePhoto}
                                >
                                    <Text style={styles.modalOptionDarkText}>Tirar Foto (Câmera)</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.modalOptionLight}
                                    onPress={pickImageFromGallery}
                                >
                                    <Text style={styles.modalOptionLightText}>Escolher da Galeria</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        <View style={styles.modalActionRow}>
                            <TouchableOpacity
                                style={styles.modalButtonCancel}
                                onPress={() => setIsModalVisiblePhoto(false)}
                                disabled={isUploadingPhoto}
                            >
                                <Text style={[styles.modalButtonCancelText, isUploadingPhoto && { opacity: 0.5 }]}>
                                    Fechar
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F4F7FB',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    cardHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        flex: 1,
        marginRight: 10,
    },
    badge: {
        backgroundColor: '#E0E7FF',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: {
        color: '#4338CA',
        fontWeight: 'bold',
        fontSize: 12,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    gridItem: {
        width: '46%',
        marginBottom: 8,
    },
    gridLabel: {
        fontSize: 14,
        color: '#4B5563',
        marginBottom: 4,
    },
    gridValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    progressTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#374151',
    },
    progressText: {
        fontSize: 16,
        color: '#4B5563',
        fontWeight: '600',
    },
    progressBarBackground: {
        height: 10,
        backgroundColor: '#DBEAFE',
        borderRadius: 10,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#3B82F6',
        borderRadius: 10,
    },
    progressTextInfo: {
        fontSize: 12,
        color: '#4B5563',
        fontStyle: 'italic',
        fontWeight: '600',
    },
    errorContainer: {
        backgroundColor: '#FEF2F2',
        padding: 16,
        marginBottom: 20,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    errorText: {
        color: '#DC2626',
        fontSize: 14,
    },
    retryText: {
        color: '#DC2626',
        fontWeight: 'bold',
        fontSize: 14,
    },
    fixedFooter: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 34,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    actionButtonLight: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#EBF0FA',
        borderRadius: 10,
        paddingVertical: 14,
        gap: 6,
    },
    actionButtonLightText: {
        color: '#1E40AF',
        fontWeight: 'bold',
        fontSize: 14,
    },
    actionButtonDark: {
        flex: 1.2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2563EB',
        borderRadius: 10,
        paddingVertical: 14,
    },
    actionButtonDarkText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 14,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#B91C1C',
        marginBottom: 8,
    },
    modalText: {
        fontSize: 15,
        color: '#4B5563',
        marginBottom: 16,
        lineHeight: 22,
    },
    textInput: {
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        padding: 12,
        fontSize: 16,
        color: '#1F2937',
        minHeight: 80,
        textAlignVertical: 'top',
        marginBottom: 20,
    },
    modalActionRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
    },
    modalOptionDark: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2563EB',
        borderRadius: 10,
        paddingVertical: 14,
        width: '100%',
    },
    modalOptionDarkText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 15,
    },
    modalOptionLight: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#EBF0FA',
        borderRadius: 10,
        paddingVertical: 14,
        width: '100%',
    },
    modalOptionLightText: {
        color: '#1E40AF',
        fontWeight: 'bold',
        fontSize: 15,
    },
    modalButtonCancel: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
    },
    modalButtonCancelText: {
        color: '#4B5563',
        fontWeight: 'bold',
        fontSize: 15,
    },
    modalButtonConfirm: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        backgroundColor: '#2563EB',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalButtonConfirmText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 15,
    },
    previewContainer: {
        marginBottom: 20,
    },
    previewTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#4B5563',
        marginBottom: 8,
    },
    imageWrapper: {
        marginRight: 14,
        position: 'relative',
    },
    previewImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#E5E7EB',
        borderWidth: 1,
        borderColor: '#D1D5DB',
    },
    removeBadge: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: '#EF4444',
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
    },
});