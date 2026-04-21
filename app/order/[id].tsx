// app/order/[id].tsx
import React, {useEffect, useState, useMemo, useCallback} from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    FlatList,
    Alert,
    Modal,
    TextInput
} from 'react-native';
import {router, useFocusEffect, useLocalSearchParams} from 'expo-router';
import {getOrder, startLoad, finishLoad} from "@/services/order.service";
import {Card} from "@/components/ui/card";
import {QrCode, Camera} from "lucide-react-native/icons";
import {useCameraPermissions} from "expo-camera";

import {PackageCard, Package} from '@/components/PackageCard';

interface Order {
    id: string;
    external_id: string;
    vehicle?: string;
    customerName?: string;
    customer?: string;
    destination: string;
    carrier: string;
    status: 'scheduled' | 'pending' | 'completed' | 'cancelled' | 'in_progress';
    items: Array<{
        product: { description: string; sku: string; unit: string; };
        packages: Package[];
    }>;
}

export default function OrderDetails() {
    const {id} = useLocalSearchParams<{ id: string }>();

    const [order, setOrder] = useState<Order | null>(null);
    const [permission, requestPermission] = useCameraPermissions();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [justification, setJustification] = useState('');

    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
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

    const executeAction = async (action: 'start' | 'finish', justification?: string) => {
        if (!order) return;

        setActionLoading(true);
        setError(null);
        setIsModalVisible(false);

        try {
            if (action === 'start') {
                await startLoad(order.id);
            } else {
                await finishLoad(order.id, justification);
            }
            await fetchOrderDetails(true);
        } catch (err) {
            setError(`Não foi possível ${action === 'start' ? 'iniciar' : 'concluir'} o carregamento.`);
        } finally {
            setActionLoading(false);
            setJustification('');
        }
    }

    const scanPackage = async () => {
        if (!permission?.granted) {
            const {granted} = await requestPermission();
            if (!granted) {
                Alert.alert("Permissão negada", "É necessário dar permissão da câmera para escanear.");
                return;
            }
        }
        router.push(`/qrCodeScan/${order?.id}`);
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
                        <TouchableOpacity onPress={() => fetchOrderDetails()}>
                            <Text style={styles.retryText}>Tentar Novamente</Text>
                        </TouchableOpacity>
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
                        <View style={[styles.progressBarFill, {width: `${progressPercentage}%`}]}/>
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
                <ActivityIndicator size="large" color="#0284C7" style={{marginTop: 40}}/>
            ) : (
                <FlatList
                    data={packages}
                    keyExtractor={(item) => item.id}
                    renderItem={({item, index}) => <PackageCard pkg={item} index={index}/>}
                    ListHeaderComponent={renderHeader}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {!loading && order && order.status !== 'completed' && order.status !== 'cancelled' && order.status !== 'divergence' && (
                <View style={styles.fixedFooter}>
                    <View style={styles.actionRow}>
                        <TouchableOpacity style={styles.actionButtonLight} activeOpacity={0.8} onPress={scanPackage}>
                            <QrCode size={18} color="#1E40AF"/>
                            <Text style={styles.actionButtonLightText}>Escanear</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButtonLight} activeOpacity={0.8}>
                            <Camera size={18} color="#1E40AF"/>
                            <Text style={styles.actionButtonLightText}>Fotos</Text>
                        </TouchableOpacity>

                        {(order.status === 'scheduled' || order.status === 'pending') ? (
                            <TouchableOpacity
                                style={styles.actionButtonDark}
                                activeOpacity={0.8}
                                onPress={() => handleLoadAction('start')}
                                disabled={actionLoading}
                            >
                                {actionLoading ? (
                                    <ActivityIndicator size="small" color="#FFFFFF"/>
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
                                    <ActivityIndicator size="small" color="#FFFFFF"/>
                                ) : (
                                    <Text style={styles.actionButtonDarkText}>Concluir</Text>
                                )}
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            )}

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
        shadowOffset: {width: 0, height: 1},
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
        shadowOffset: {width: 0, height: -4},
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
        color: '#B91C1C', // Vermelho para chamar atenção
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
        textAlignVertical: 'top', // Necessário para Android no multiline
        marginBottom: 20,
    },
    modalActionRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
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
});