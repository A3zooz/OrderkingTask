import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Platform,
    ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import { useRouter, Link } from 'expo-router';
import { useAuth } from '@/utils/authContext';
import { API_BASE_URL } from '@/utils/config';

export default function LoginScreen() {
    const router = useRouter();
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async () => {
        setError(null);
        if (!email || !password) {
            setError('Please enter email and password.');
            return;
        }
        setSubmitting(true);
        try {
            const res = await axios.post(`${API_BASE_URL}/api/auth/login`, {
                email,
                password,
            });
            const token: string = res.data?.token;
            if (!token) throw new Error('No token received');
            await login(token);
            router.push('/(protected)');
        } catch (e: any) {
            console.log('Login error:', e.response.data);
            const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message ||
                'Login failed';
            setError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>Log in</Text>
                {!!error && <Text style={styles.error}>{error}</Text>}
                <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Email"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    style={styles.input}
                />
                <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Password"
                    secureTextEntry
                    style={styles.input}
                />
                {/* Forgot password link */}
                <View style={[styles.footerRow, { justifyContent: 'flex-end' }]}>
                    <TouchableOpacity onPress={() => router.push('/forgot-password')}>
                        <Text style={styles.link}>Forgot password?</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity
                    style={[styles.button, submitting && styles.buttonDisabled]}
                    onPress={handleLogin}
                    disabled={submitting}
                >
                    {submitting ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Login</Text>
                    )}
                </TouchableOpacity>
                <View style={styles.footerRow}>
                    <Text>Don't have an account? </Text>
                    <Link href="/signup" style={styles.link}>
                        Sign up
                    </Link>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        padding: 20,
    },
    card: {
        width: '100%',
        maxWidth: 420,
        gap: 12,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
    },
    button: {
        backgroundColor: '#0062ff',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 6,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    error: {
        color: '#b00020',
        marginBottom: 4,
    },
    footerRow: {
        flexDirection: 'row',
        marginTop: 6,
    },
    link: {
        color: '#0062ff',
        fontWeight: '600',
    },
});
