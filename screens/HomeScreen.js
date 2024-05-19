import { useNavigation } from '@react-navigation/native';
import React, { useContext, useEffect, useLayoutEffect, useState, useCallback } from 'react';
import { ScrollView, RefreshControl } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { UserType } from '../UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { IP_ADDRESS } from '../extras/constants';
import User from '../components/User';

const HomeScreen = () => {
    const navigation = useNavigation();
    const { userId, setUserId } = useContext(UserType);
    const [users, setUsers] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: 'Home',
            headerRight: () => (
                <Ionicons name="people-outline" size={24} color="black" />
            )
        });
    }, [navigation]);

    const fetchUsers = useCallback(async () => {
        setRefreshing(true);
        try {
            const token = await AsyncStorage.getItem('authToken');
            const decodedToken = jwtDecode(token);
            const userId = decodedToken.id;
            setUserId(userId);
            const port = process.env.PORT || 3000;
            const ip = IP_ADDRESS;
            const url = `http://${ip}:${port}/api/user`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            if (data.success) {
                setUsers(data.users);
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setRefreshing(false);
        }
    }, [setUserId]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    return (
        <ScrollView
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={fetchUsers}
                />
            }
        >
            {users.map((item, index) => (
                <User key={index} item={item} />
            ))}
        </ScrollView>
    );
};

export default HomeScreen;
