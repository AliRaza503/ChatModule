import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { View, Image, Text, StyleSheet, Pressable } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const User = ({ item }) => {
    const navigation = useNavigation();
    
    return (
        <Pressable
            onPress={() => navigation.navigate('Chat', { recepientId: item._id })}
            style={styles.container}>
            <View style={styles.imageContainer}>
                {item.picUri ? (
                    <Image source={{ uri: item.picUri }} style={styles.image} />
                ) : (
                    <Ionicons name="person-circle-outline" size={50} color="black" />
                )}
            </View>
            <View style={styles.detailsContainer}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.lastMessage}>Last Message will be seen here.</Text>
            </View>
            <View style={styles.timeContainer}>
                <Text style={styles.timeText}>12:30 PM</Text>
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
        backgroundColor: '#FFFFFF',
    },
    imageContainer: {
        marginRight: 16,
    },
    image: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    detailsContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    name: {
        fontSize: 16,
        color: '#333333',
        marginBottom: 4,
        fontWeight: 'bold',
    },
    lastMessage: {
        fontSize: 14,
        color: '#666666',
    },
    timeContainer: {
        alignItems: 'flex-end',
    },
    timeText: {
        fontSize: 12,
        color: '#999999',
    },
});

export default User;
