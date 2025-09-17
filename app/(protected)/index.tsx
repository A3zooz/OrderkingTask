import React, { use, useEffect, useState } from 'react';
import {
    View,
    StyleSheet,
    ActivityIndicator,
    Alert,
    TouchableOpacity,
    SafeAreaView,
} from 'react-native';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/utils/authContext';
import { Redirect, useRouter } from 'expo-router';
import { API_BASE_URL } from '@/utils/config';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';

interface QRData {
    id: number;
    user_id: number;
    qr_code: string;
    created_at: string;
    last_updated: string;
}

export default function QRScreen() {
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { logout } = useAuth();
    const router = useRouter();
    const authContext = useAuth();
    // if (!authContext.isAuthenticated && !authContext.loading) {
    //     router.replace('/');
    // }

    useEffect(() => {
        //refresh qr code every minute
        const interval = setInterval(() => {
            fetchQRCode();
        }, 60002);

        return () => clearInterval(interval);
    }, []);

    // check if token is expired every minute
    useEffect(() => {
        const interval = setInterval(async () => {
            const token = await SecureStore.getItemAsync('authToken');
            if (token) {
                const decoded: any = jwtDecode(token);
                const currentTime = Date.now() / 1000; // in seconds
                if (decoded.exp < currentTime) {
                    await logout();
                    router.replace('/home');
                }
            }
        }, 60000);

        return () => clearInterval(interval);
    }, []);


    const fetchQRCode = async () => {
        if(authContext.isAuthenticated === false) {
            router.replace('/home');
            return;
        }
        try {
            const token = await SecureStore.getItemAsync('authToken');
            const response = await fetch(`${API_BASE_URL}/api/qr/current`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setQrCode(data.qr_code.qr_code);
            } else if (response.status === 404) {
                // No QR code found, this is normal for new users
                setQrCode(null);
            } else {
                throw new Error('Failed to fetch QR code');
            }
        } catch (error) {
            console.error('Error fetching QR code:', error);
            Alert.alert('Error', 'Failed to load QR code. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const refreshQRCode = async () => {
        setRefreshing(true);
        try {
            const token = await SecureStore.getItemAsync('authToken');
            const response = await fetch(`${API_BASE_URL}/api/qr/refresh`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setQrCode(data.qr_code);
            } else {
                console.error('Failed to refresh QR code:', response.json);
                throw new Error('Failed to refresh QR code');
            }
        } catch (error) {
            console.error('Error refreshing QR code:', error);
            Alert.alert(
                'Error',
                'Failed to refresh QR code. Please try again.'
            );
        } finally {
            setRefreshing(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            router.replace('/home');
        } catch (error) {
            console.error('Error logging out:', error);
            Alert.alert('Error', 'Failed to logout. Please try again.');
        }
    };

    useEffect(() => {
        fetchQRCode();
    }, []);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#007AFF" />
                <ThemedText style={styles.loadingText}>
                    Loading your QR code...
                </ThemedText>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ThemedView style={styles.header}>
                <ThemedText type="title" style={styles.title}>
                    Your QR Code
                </ThemedText>
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                >
                    <ThemedText style={styles.logoutText}>Logout</ThemedText>
                </TouchableOpacity>
            </ThemedView>

            <View style={styles.content}>
                {qrCode ? (
                    <View style={styles.qrContainer}>
                        <Image
                            source={{ uri: qrCode }}
                            style={styles.qrImage}
                            contentFit="contain"
                        />
                        <ThemedText style={styles.description}>
                            Show this QR code to others to connect with you
                        </ThemedText>
                    </View>
                ) : (
                    <View style={styles.noQrContainer}>
                        <ThemedText style={styles.noQrText}>
                            No QR code available yet
                        </ThemedText>
                        <ThemedText style={styles.noQrSubtext}>
                            Your QR code will be generated automatically
                        </ThemedText>
                    </View>
                )}

                <TouchableOpacity
                    style={[
                        styles.refreshButton,
                        refreshing && styles.refreshButtonDisabled,
                    ]}
                    onPress={refreshQRCode}
                    disabled={refreshing}
                >
                    {refreshing ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <ThemedText style={styles.refreshButtonText}>
                            Refresh QR Code
                        </ThemedText>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e1e1e1',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    logoutButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#ff4444',
        borderRadius: 8,
    },
    logoutText: {
        color: '#fff',
        fontWeight: '600',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
    },
    qrContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    qrImage: {
        width: 280,
        height: 280,
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        marginBottom: 20,
    },
    description: {
        fontSize: 16,
        textAlign: 'center',
        color: '#666',
        lineHeight: 22,
    },
    noQrContainer: {
        alignItems: 'center',
        marginBottom: 40,
        paddingHorizontal: 40,
    },
    noQrText: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
        textAlign: 'center',
    },
    noQrSubtext: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
    },
    refreshButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 12,
        minWidth: 160,
        alignItems: 'center',
    },
    refreshButtonDisabled: {
        backgroundColor: '#ccc',
    },
    refreshButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
