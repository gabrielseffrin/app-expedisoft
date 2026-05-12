// components/PackageCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from "@/components/ui/card";

export interface Package {
    id: string;
    unique_package_code: string;
    quantity_in_package: number;
    status: 'checked' | 'pending';
    productDescription?: string;
    productSKU?: string;
    unit?: string;
}

interface PackageCardProps {
    pkg: Package;
    index: number;
}

export function PackageCard({ pkg, index }: PackageCardProps) {
    return (
        <Card style={styles.packageCard}>
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

            {pkg.status === 'checked' ? (
                <View style={[styles.badge, styles.conferirButton, { backgroundColor: '#D1FAE5', alignSelf: 'flex-start' }]}>
                    <Text style={[styles.badgeText, { color: '#065F46' }]}>OK</Text>
                </View>
            ) : (
                <View style={[styles.badge, styles.conferirButton, { backgroundColor: '#FEE2E2', alignSelf: 'flex-start' }]}>
                    <Text style={[styles.badgeText, styles.conferirButtonText, { color: '#B91C1C' }]}>Pendente</Text>
                </View>
            )}
        </Card>
    );
}

const styles = StyleSheet.create({
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
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: {
        fontWeight: 'bold',
        fontSize: 12,
    },
    conferirButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    conferirButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 14,
    },
});