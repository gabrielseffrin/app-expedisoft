import React, { useEffect, useState } from "react";
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
    RefreshControl
} from "react-native";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import {
    Hourglass,
    Calendar,
    PackageOpen,
    AlertTriangle,
    XCircle,
    Package,
    Inbox,
    ChevronRight
} from "lucide-react-native";
import { getOrders } from "@/services/order.service";
import { Card } from "@/components/ui/card";
import {router} from "expo-router";

interface Order {
    id: number | string;
    external_id: string;
    status: string;
    scheduled_at: string;
}

export default function LoadingOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const fetchOrders = async (pageNumber: number, isRefresh = false) => {
        if (loading) return;

        setLoading(!isRefresh);
        try {
            const response = await getOrders(pageNumber);

            if (pageNumber === 1) {
                setOrders(response.data);
            } else {
                setOrders(prevOrders => [...prevOrders, ...response.data]);
            }

            setTotalPages(response.meta.last_page);
            setError(null);
        } catch (error) {
            setError("Não foi possível carregar as cargas.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchOrders(page);
    }, [page]);

    const handleRefresh = () => {
        setRefreshing(true);
        setPage(1);
        fetchOrders(1, true);
    };

    const handleLoadMore = () => {
        if (!loading && page < totalPages) {
            setPage(prevPage => prevPage + 1);
        }
    };

    const handleSelectOrder = (orderId: number | string) => {
        router.push(`/order/${orderId}`);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        try {
            const [datePart, timePart] = dateString.split(' ');
            const [year, month, day] = datePart.split('-');
            const [hour, minute] = timePart.split(':');

            return `${day}/${month}/${year} às ${hour}:${minute}`;
        } catch (e) {
            return dateString;
        }
    };

    const getStatusInfo = (status: string) => {
        const statusLower = status.toLowerCase();
        switch (statusLower) {
            case 'pending':
                return { label: 'Pendente', bg: '#D97706', color: '#FFFFFF', Icon: Hourglass };
            case 'scheduled':
                return { label: 'Agendada', bg: '#D97706', color: '#FFFFFF', Icon: Calendar };
            case 'in_progress':
                return { label: 'Em Andamento', bg: '#0284C7', color: '#FFFFFF', Icon: PackageOpen };
            case 'completed':
                return { label: 'Concluído', bg: '#059669', color: '#FFFFFF', Icon: Package };
            case 'divergence':
                return { label: 'Divergência', bg: '#DC2626', color: '#FFFFFF', Icon: AlertTriangle };
            case 'canceled':
                return { label: 'Cancelado', bg: '#DC2626', color: '#FFFFFF', Icon: XCircle };
            default:
                const fallbackLabel = status.charAt(0).toUpperCase() + status.slice(1);
                return { label: fallbackLabel, bg: '#F3F4F6', color: '#4B5563', Icon: Package };
        }
    };

    const renderItem = ({ item }: { item: Order }) => {
        const statusInfo = getStatusInfo(item.status);
        const StatusIcon = statusInfo.Icon;

        return (
            <TouchableOpacity activeOpacity={0.9} onPress={() => { handleSelectOrder(item.id) }}>
                <Card style={styles.card}>

                    <View style={[styles.absoluteBadge, { backgroundColor: statusInfo.bg }]}>
                        <Text style={[styles.statusText, { color: statusInfo.color }]}>
                            {statusInfo.label}
                        </Text>
                    </View>

                    <View style={styles.cardContent}>

                        <View style={[styles.iconContainer, { backgroundColor: statusInfo.bg }]}>
                            <StatusIcon size={20} color={statusInfo.color} />
                        </View>

                        <View style={styles.textContainer}>
                            <Text style={styles.idText} numberOfLines={1}>
                                Carga #{item.external_id}
                            </Text>
                            <View style={styles.dateRow}>
                                <Calendar size={12} color="#6B7280" />
                                <Text style={styles.dateText}>{formatDate(item.scheduled_at)}</Text>
                            </View>
                        </View>

                        <ChevronRight size={20} color="#D1D5DB" />

                    </View>
                </Card>
            </TouchableOpacity>
        );
    };

    return (
        <ActionSheetProvider>
            <View style={styles.container}>

                {error && (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{error}</Text>
                        <TouchableOpacity onPress={handleRefresh}>
                            <Text style={styles.retryText}>Tentar novamente</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <FlatList
                    data={orders}
                    keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
                    renderItem={renderItem}
                    onEndReachedThreshold={0.2}
                    onEndReached={handleLoadMore}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#0284C7" />
                    }
                    ListEmptyComponent={
                        !loading && !error ? (
                            <View style={styles.emptyContainer}>
                                <Inbox size={48} color="#D1D5DB" />
                                <Text style={styles.emptyText}>Nenhuma carga encontrada.</Text>
                            </View>
                        ) : null
                    }
                    ListFooterComponent={
                        loading && !refreshing ? (
                            <ActivityIndicator size="small" color="#0284C7" style={styles.footerLoader} />
                        ) : null
                    }
                />
            </View>
        </ActionSheetProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F4F7FB',
    },
    listContent: {
        padding: 20,
        paddingBottom: 100,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        paddingTop: 32,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    absoluteBadge: {
        position: 'absolute',
        top: 10,
        right: 12,
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 12,
        zIndex: 10,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingRight: 40,
    },
    idText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1B143F',
        marginBottom: 4,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    dateText: {
        fontSize: 13,
        color: '#6B7280',
    },
    errorContainer: {
        backgroundColor: '#FEF2F2',
        padding: 16,
        margin: 20,
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
    footerLoader: {
        marginVertical: 20,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 60,
    },
    emptyText: {
        marginTop: 12,
        color: '#9CA3AF',
        fontSize: 16,
    }
});