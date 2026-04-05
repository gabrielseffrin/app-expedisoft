import React from "react";
import { View, Text, ViewProps, TextProps, StyleSheet } from "react-native";

const Card = React.forwardRef<View, ViewProps>(({ style, ...props }, ref) => (
    <View
        ref={ref}
        style={[styles.card, style]}
        {...props}
    />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<View, ViewProps>(({ style, ...props }, ref) => (
    <View
        ref={ref}
        style={[styles.header, style]}
        {...props}
    />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<Text, TextProps>(({ style, ...props }, ref) => (
    <Text
        ref={ref}
        style={[styles.title, style]}
        {...props}
    />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<Text, TextProps>(({ style, ...props }, ref) => (
    <Text
        ref={ref}
        style={[styles.description, style]}
        {...props}
    />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<View, ViewProps>(({ style, ...props }, ref) => (
    <View
        ref={ref}
        style={[styles.content, style]}
        {...props}
    />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<View, ViewProps>(({ style, ...props }, ref) => (
    <View
        ref={ref}
        style={[styles.footer, style]}
        {...props}
    />
));
CardFooter.displayName = "CardFooter";

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E2E8F0", // Cor de borda sutil
        // Sombra para iOS
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        // Sombra para Android
        elevation: 2,
    },
    header: {
        flexDirection: "column",
        padding: 24,
        gap: 6, // Equivalente ao space-y-1.5
    },
    title: {
        fontSize: 14,
        fontWeight: "600",
        color: "#1B143F",
        letterSpacing: 0, // Equivalente ao tracking-tight
    },
    description: {
        fontSize: 12,
        color: "#64748B", // Equivalente ao text-muted-foreground
    },
    content: {
        paddingHorizontal: 24,
        paddingBottom: 24,
    },
    footer: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 24,
        paddingBottom: 24,
    },
});

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };