// app/order/[id].tsx
import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView} from 'react-native';
import {useLocalSearchParams} from 'expo-router';
import {getOrder, startLoad, finishLoad} from "@/services/order.service";
import {Card} from "@/components/ui/card";
import {QrCode, Camera} from "lucide-react-native/icons";

export default function OrderDetails() {
    const {id} = useLocalSearchParams();

    const [order, setOrder] = useState<any>(null);

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

    const handleLoadAction = async (action: 'start' | 'finish') => {
        if (!order) return;

        setActionLoading(true);
        setError(null);

        try {
            if (action === 'start') {
                await startLoad(order.id);
            } else {
                await finishLoad(order.id);
            }

            await fetchOrderDetails(true);
        } catch (err) {
            setError(`Não foi possível ${action === 'start' ? 'iniciar' : 'concluir'} o carregamento.`);
        } finally {
            setActionLoading(false);
        }
    };

    const getAllPackages = () => {
        if (!order || !order.items) return [];

        return order.items.flatMap((item: any) =>
            item.packages.map((pkg: any) => ({
                ...pkg,
                productDescription: item.product.description,
                productSKU: item.product.sku,
                quantity_in_package: pkg.quantity_in_package,
                unit: item.product.unit,
            }))
        );
    };

    useEffect(() => {
        fetchOrderDetails();
    }, [id]);

    const packages = getAllPackages();
    const totalPackages = packages.length;
    const packagesConferred = 0;
    const progressPercentage = totalPackages > 0 ? (packagesConferred / totalPackages) * 100 : 0;

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {error && (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                )}

                {loading && !order ? (
                    <ActivityIndicator size="large" color="#0284C7" style={{marginTop: 40}}/>
                ) : null}

                {order && !loading && (
                    <>
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
                                <Text style={styles.progressTitle}>Status da Conferencia</Text>
                                <Text style={styles.progressText}>{progressPercentage.toFixed(0)}%</Text>
                            </View>
                            <View style={styles.progressBarBackground}>
                                <View style={[styles.progressBarFill, {width: `${progressPercentage}%`}]}/>
                            </View>
                            <View>
                                <Text
                                    style={styles.progressTextInfo}>{packagesConferred} de {totalPackages} conferidos.</Text>
                            </View>
                        </Card>

                        {packages.map((pkg: any, index: number) => (
                            <Card key={pkg.id} style={styles.packageCard}>
                                <View style={styles.packageHeader}>
                                    <Text style={styles.packageTitle}>Caixa {index + 1}</Text>
                                    <View style={styles.packageCodeBadge}>
                                        <Text style={styles.packageCodeText}>{pkg.unique_package_code}</Text>
                                    </View>
                                </View>

                                <View style={styles.packageProductRow}>
                                    <Text style={styles.packageLabel}>Produto (SKU: {pkg.productSKU})</Text>
                                    <Text style={styles.packageProductName}>{pkg.productDescription}</Text>
                                </View>

                                <View style={styles.packageGrid}>
                                    <View style={styles.packageGridItem}>
                                        <Text style={styles.packageLabel}>Quantidade</Text>
                                        <Text style={styles.packageValue}>{pkg.quantity_in_package}</Text>
                                    </View>
                                    <View style={styles.packageGridItem}>
                                        <Text style={styles.packageLabel}>Un. de Medida</Text>
                                        <Text style={styles.packageValue}>{pkg.unit}</Text>
                                    </View>
                                </View>

                                <TouchableOpacity style={styles.conferirButton} activeOpacity={0.8}>
                                    <Text style={styles.conferirButtonText}>Conferir</Text>
                                </TouchableOpacity>
                            </Card>
                        ))}
                    </>
                )}
            </ScrollView>

            {!loading && order && order.status !== 'completed' && order.status !== 'cancelled' && (
                <View style={styles.fixedFooter}>
                    <View style={styles.actionRow}>
                        <TouchableOpacity style={styles.actionButtonLight} activeOpacity={0.8}>
                            <QrCode size={18} color="#1E40AF"/>
                            <Text style={styles.actionButtonLightText}>Escanear</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButtonLight} activeOpacity={0.8}>
                            <Camera size={18} color="#1E40AF"/>
                            <Text style={styles.actionButtonLightText}>Fotos</Text>
                        </TouchableOpacity>

                        {order.status === 'scheduled' || order.status === 'pending' ? (
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
                        ) : order.status !== 'completed' && order.status !== 'cancelled' ? (
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
                        ) : null}

                    </View>
                </View>
            )}
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

    // --- Card Genérico ---
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

    // --- Cabeçalho do Card (ID e Badge) ---
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

    // --- Grid de Informações (Cliente, Destino, etc) ---
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

    // --- Barra de Progresso ---
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

    // --- Lista de Caixas (Pacotes) ---
    packageCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    packageHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    packageTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    packageCodeBadge: {
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    packageCodeText: {
        fontSize: 12,
        color: '#4B5563',
        fontWeight: '600',
    },
    packageProductRow: {
        marginBottom: 12,
    },
    packageLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 2,
        textTransform: 'uppercase',
    },
    packageProductName: {
        fontSize: 16,
        color: '#111827',
        fontWeight: '500',
    },
    packageGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    packageGridItem: {
        flex: 1,
    },
    packageValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    conferirButton: {
        backgroundColor: '#3B82F6',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    conferirButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 15,
    },

    // --- Status de Erro ---
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

    // --- Rodapé Fixo (Ações em Linha) ---
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
});