import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, StyleSheet, Pressable, KeyboardAvoidingView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import theme from '../theme/theme';
import { IP_ADDRESS } from '../extras/constants';


const RegisterScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigation = useNavigation();
    const [registering, setRegistering] = useState(false);
    const isValidForm = () => {
        if (name === '' || email === '' || password === '' || confirmPassword === '') {
            alert('All fields are required');
            return false;
        }
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return false;
        }
        // Check if the email is valid
        const emailPattern = /\S+@\S+\.\S+/;
        if (!emailPattern.test(email)) {
            alert('Invalid email');
            return false;
        }
        return true;
    };

    const handleRegister = () => {
        // Validate the form
        if (!isValidForm()) {
            return;
        }
        setRegistering(true);
        const user = {
            name: name,
            email: email,
            password: password,
        };
        // make a post request to the server to register the user
        const port = process.env.PORT || 3000;
        const ip = IP_ADDRESS;
        const url = `http://${ip}:${port}/api/user/register`;
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(user),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    // Redirect to the login screen
                    // if there is a screen in the stack to go back to it
                    // otherwise go to the login screen
                    if (navigation.canGoBack()) {
                        navigation.goBack();
                    }
                    else {
                        navigation.navigate('Login');
                    }
                } else {
                    alert(data.message);
                }
            })
            .catch((error) => {
                console.error(error);
            }).finally(() => {
                setRegistering(false);
            });
    };

    return (
        <>
            <KeyboardAvoidingView style={styles.container} behavior="padding">
                <Text style={[styles.title, theme.text]}>Make a new Account</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Name"
                    onChangeText={setName}
                    text=""
                    placeholderTextColor={theme.textInput.placeholderTextColor}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    onChangeText={setEmail}
                    text=""
                    textContentType="emailAddress"
                    placeholderTextColor={theme.textInput.placeholderTextColor}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    secureTextEntry
                    text=""
                    onChangeText={setPassword}
                    placeholderTextColor={theme.textInput.placeholderTextColor}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Confirm Password"
                    secureTextEntry
                    text=""
                    onChangeText={setConfirmPassword}
                    placeholderTextColor={theme.textInput.placeholderTextColor}
                />
                <TouchableOpacity style={styles.button} onPress={handleRegister}>
                    <Text style={styles.buttonText}>Register</Text>
                </TouchableOpacity>
                <Pressable onPress={() => navigation.goBack()} disabled={registering}>
                    <Text style={[{ textAlign: 'center', marginTop: 16 }, theme.text]}>Already have an account? <Text style={{ color: 'blue', textDecorationLine: 'underline' }}>Login</Text></Text>
                </Pressable>
                <ActivityIndicator animating={registering} size="large" color="#007bff" />
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
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: 15,
        paddingHorizontal: 10,
        color: '#000',
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

export default RegisterScreen;