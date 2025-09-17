import { useAuth } from '@/utils/authContext';
import { Redirect, useRouter } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';

export default function LandingPage() {
    const router = useRouter();
    const {isAuthenticated, loading} = useAuth();

    if(loading){
        return (
            <View style={styles.container}>
                <Text>Loading...</Text>
            </View>
        );
    }
    if(isAuthenticated){
        return <Redirect href='/(protected)' />;
    }

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}> Welcome to the Landing Page </Text>
                <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/signup')}>
                    <Text style={styles.primaryButtonText}>Signup</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/login')}>
                    <Text style={styles.secondaryButtonText}>Login</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    content: {
        alignItems: 'center',
        maxWidth: 400,
    },
    title:{
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    primaryButton: {
        backgroundColor: '#0062ffff',
        paddingVertical: 15,
        paddingHorizontal: 50,
        borderRadius: 5,
        marginVertical: 5,
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    secondaryButton: {
        backgroundColor: '#d2dff2ff',
        borderWidth: 1,
        borderColor: '#0062ffff',
        paddingVertical: 10,
        paddingHorizontal: 40,
        borderRadius: 5,
        marginVertical: 10,
    },
    secondaryButtonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
