import React, { useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { Slot, useRouter } from 'expo-router';
import { useAuth } from '@/utils/authContext';

export default function ProtectedLayout() {
    const { isAuthenticated, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        console.log('Auth status:', { loading, isAuthenticated });
        if (!loading && !isAuthenticated) {
            router.replace('/home');
        }
    }, [loading, isAuthenticated]);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return <Slot />;
}

const styles = StyleSheet.create({
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
});
