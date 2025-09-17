import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useRouter, Link } from 'expo-router';
import { useAuth } from '@/utils/authContext';
import { API_BASE_URL } from '@/utils/config';

export default function SignupScreen() {
	const router = useRouter();
	const { login } = useAuth();

	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirm, setConfirm] = useState('');
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSignup = async () => {
		setError(null);
		if (!email || !password) {
			setError('Please enter email and password.');
			return;
		}
		if (password !== confirm) {
			setError('Passwords do not match.');
			return;
		}
		setSubmitting(true);
		try {
			const res = await axios.post(`${API_BASE_URL}/api/auth/register`, { email, password });
			const token: string = res.data?.token;
			if (!token) throw new Error('No token received');
			await login(token);
			router.push('/(protected)');
		} catch (e: any) {
			const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Signup failed';
			setError(msg);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<View style={styles.container}>
			<View style={styles.card}>
				<Text style={styles.title}>Create account</Text>
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
				<TextInput
					value={confirm}
					onChangeText={setConfirm}
					placeholder="Confirm Password"
					secureTextEntry
					style={styles.input}
				/>
				<TouchableOpacity style={[styles.button, submitting && styles.buttonDisabled]} onPress={handleSignup} disabled={submitting}>
					{submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign up</Text>}
				</TouchableOpacity>
				<View style={styles.footerRow}>
					<Text>Already have an account? </Text>
					<Link href="/login" style={styles.link}>Log in</Link>
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

