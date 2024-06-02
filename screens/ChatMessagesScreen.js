import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView } from 'react-native';
import moment from 'moment';
import theme from '../theme/theme';
import { IP_ADDRESS } from '../extras/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import io from 'socket.io-client';
import {jwtDecode} from 'jwt-decode';

const ENDPOINT = `http://${IP_ADDRESS}:${process.env.PORT || 3000}`;

const ChatScreen = ({ route }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const flatListRef = useRef(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [userId, setUserId] = useState(null);
  const socket = useRef(null);

  useEffect(() => {
    const getAllMessages = async () => {
      const otherUserId = route.params.recepientId;
      const token = await AsyncStorage.getItem('authToken');
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.id;
      setUserId(userId);
      const url = `http://${IP_ADDRESS}:${process.env.PORT || 3000}/api/message/${otherUserId}`;
      fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }).then((res) => res.json())
        .then((data) => {
          if (data.success) {
            const msgs = data.messages.map((message) => ({
              id: message._id,
              text: message.content,
              sentByMe: message.sentByMe,
              timestamp: message.updatedAt,
            }));
            msgs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            setMessages(msgs);
            const concatedIds = userId + otherUserId.split('').sort().join('');
            socket.current.emit('join room', concatedIds);
          } else {
            alert(data.message);
          }
        })
        .catch((error) => {
          console.error("Error " + error);
        });
    }
    getAllMessages();
  }, []);

  const handleSend = async () => {
    if (newMessage.trim() === '') return;
    const recipientId = route.params?.recepientId;
    const token = await AsyncStorage.getItem('authToken');
    const port = process.env.PORT || 3000;
    const url = `http://${IP_ADDRESS}:${port}/api/message`;
    fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: newMessage,
        recipientId: recipientId,
      }),
    }).then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const newMsg = {
            id: data.message._id,
            text: data.message.content,
            sentByMe: true,
            timestamp: data.message.updatedAt,
          };
          setMessages([...messages, newMsg]);
          socket.current.emit('new message', data);
        } else {
          alert(data.message);
        }
      })
      .catch((error) => {
        console.error(error);
      });
    setNewMessage('');
  };

  const scrollToEnd = () => {
    flatListRef.current.scrollToEnd();
  }

  useEffect(() => {
    if (messages.length > 0) {
      scrollToEnd();
    }
  }, [messages]);

  useEffect(() => {
    socket.current = io(ENDPOINT);
    socket.current.on('connect', () => {
      setSocketConnected(true);
      if (userId) {
        socket.current.emit('setup', userId);
      }
    });

    socket.current.on('message received', (newMessageReceived) => {
      if (newMessageReceived.message.sender._id === route.params.recepientId) {
        const newMsg = {
          id: newMessageReceived.message._id,
          text: newMessageReceived.message.content,
          sentByMe: newMessageReceived.message.sender._id === userId,
          timestamp: newMessageReceived.message.updatedAt,
        };
        setMessages(prevMessages => [...prevMessages, newMsg]);
        scrollToEnd();  
      }
      
    });

    return () => {
      socket.current.disconnect();
    };
  }, [userId]);

  return (
    <KeyboardAvoidingView style={styles.container}>
      <FlatList
        data={messages}
        ref={flatListRef}
        keyExtractor={(item) => item.id.toString()}
        onContentSizeChange={scrollToEnd}
        renderItem={({ item }) => (
          <View style={item.sentByMe ? [styles.sentByMe, styles.messageContainerSentByMe] : [styles.sentByOthers, styles.messageContainerSentByOther]}>
            <Text style={styles.messageText}>{item.text}</Text>
            <Text style={styles.timestampText}>{moment(item.timestamp).format('HH:mm A')}</Text>
          </View>
        )}
        contentContainerStyle={styles.messagesList}
      />
      <View behavior="padding" style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type your message..."
          placeholderTextColor="#999"
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bac,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  messageContainerSentByMe: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 20,
    borderBottomEndRadius: 0,
    maxWidth: '60%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messageContainerSentByOther: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 20,
    borderBottomStartRadius: 0,
    maxWidth: '60%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sentByMe: {
    alignSelf: 'flex-end',
    backgroundColor: '#C8E6A0',
  },
  sentByOthers: {
    alignSelf: 'flex-start',
    backgroundColor: '#CCC',
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
  timestampText: {
    color: '#999',
    fontSize: 11,
    marginEnd: 10,
    marginStart: 10,
    marginTop: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    fontSize: 16,
    color: '#333',
  },
  sendButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  messagesList: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
});

export default ChatScreen;
