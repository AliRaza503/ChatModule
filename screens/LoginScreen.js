import React, { useState, useEffect } from 'react';
import { Text, TextInput, TouchableOpacity, StyleSheet, Pressable, KeyboardAvoidingView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import theme from '../theme/theme';
import { IP_ADDRESS } from '../extras/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigation = useNavigation();
    const [loggingIn, setLoggingIn] = useState(false);
    useEffect(() => {
        AsyncStorage.getItem('authToken')
            .then((token) => {
                if (token) {
                    navigation.replace('Home');
                }
            })
            .catch((error) => {
                console.error(error);
            });
    }, []);
    const isValidForm = () => {
        if (email === '') {
            alert('Email is required');
            return false;
        }
        else if (password === '') {
            alert('Password is required');
            return false;
        }
        const emailPattern = /\S+@\S+\.\S+/;
        if (!emailPattern.test(email)) {
            alert('Invalid email');
            return false;
        }
        return true;
    }
    const handleLogin = () => {
        if (!isValidForm()) {
            return;
        }
        setLoggingIn(true);

        const user = {
            email: email,
            password: password,
        };
        // make a post request to the server to login the user
        const port = process.env.PORT || 3000;
        const ip = IP_ADDRESS;
        const url = `http://${ip}:${port}/api/user/login`;

        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(user),
        })
            .then((res) => res.json())
            .then((data) => {
                // console.log("Response: ", data);
                if (data.success) {
                    // Save the token in the AsyncStorage
                    const token = data.token;
                    AsyncStorage.setItem('authToken', token);
                    navigation.replace('Home');
                } else {
                    alert(data.message);
                }
            })
            .catch((error) => {
                console.error('Error:', error);
            })
            .finally(() => {
                setLoggingIn(false);
            });
    };

    return (
        <>
            <KeyboardAvoidingView style={styles.container} behavior="padding">
                <Text style={[styles.title, theme.text]}>Sign in to your Account</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    placeholderTextColor={theme.textInput.placeholderTextColor}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                    placeholderTextColor={theme.textInput.placeholderTextColor}
                />
                <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loggingIn} >
                    <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity>
                <Pressable onPress={() => navigation.navigate('Register')}>
                    <Text style={[{ textAlign: 'center', marginTop: 16 }, theme.text]}>Don't Have an account? <Text style={{ color: 'blue', textDecorationLine: 'underline' }}>Register</Text></Text>
                </Pressable>
                <ActivityIndicator size="large" color="#0000ff" animating={loggingIn} />
            </KeyboardAvoidingView>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.backgroundColor,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    input: {
        width: '80%',
        height: 50,
        borderWidth: 1,
        color: '#000',
        borderColor: theme.colors.lightGray,
        borderRadius: 5,
        marginBottom: 15,
        paddingHorizontal: 10,
    },
    button: {
        width: '50%',
        height: 50,
        backgroundColor: '#007bff',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default LoginScreen;