import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import axios from 'axios';

type Message = {
  type: 'user' | 'bot';
  text: string;
};

type BotResponse = {
  reply: string;
};

export default function ChatbotScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // 🔍 TEST IF BACKEND IS REACHABLE
  useEffect(() => {
    axios
      .post<BotResponse>('http://192.168.0.126:5000/chat', {
        message: 'Hello, this is a test from the app',
      })
      .then((res) => {
        console.log('✅ Test API working:', res.data);
      })
      .catch((err) => {
        console.error('❌ Test API error:', err.message);
      });
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { type: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post<BotResponse>('http://192.168.0.126:5000/chat', {
        message: userMessage.text,
      });

      const botMessage: Message = { type: 'bot', text: res.data.reply };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        { type: 'bot', text: 'Sorry, I couldn’t understand that.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderMarkdownText = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g); // Match **bold**

    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const clean = part.slice(2, -2); // Remove ** from both sides
        return (
          <Text key={index} style={{ fontWeight: 'bold', color: '#000' }}>
            {clean}
          </Text>
        );
      } else {
        return <Text key={index} style={{ color: '#000' }}>{part}</Text>;
      }
    });
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageBubble,
        item.type === 'user' ? styles.userBubble : styles.botBubble,
      ]}
    >
      {item.type === 'bot' ? (
        <Text style={styles.messageText}>{renderMarkdownText(item.text)}</Text>
      ) : (
        <Text style={[styles.messageText, { color: '#fff' }]}>{item.text}</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}
      >
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(_, index) => index.toString()}
          contentContainerStyle={{ padding: 10 }}
        />

        {loading && (
          <ActivityIndicator
            size="small"
            color="#007bff"
            style={{ marginBottom: 10 }}
          />
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type your civic rights question..."
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderTopColor: '#ccc',
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#e2e8f0',
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderRadius: 8,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  userBubble: {
    backgroundColor: '#3182ce',
    alignSelf: 'flex-end',
  },
  botBubble: {
    backgroundColor: '#e2e8f0',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
});
