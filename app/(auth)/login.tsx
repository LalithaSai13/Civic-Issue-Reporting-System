import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { account, databases } from '../../lib/appwrite';
import { Query } from 'appwrite';

const DATABASE_ID = '67f39692002509a5d8ee';
const USERS_COLLECTION_ID = '67f49bf80030cd63c1b4';

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      setError('');
      await account.deleteSession('current').catch(() => {});

      const session = await account.createEmailPasswordSession(email.trim(), password.trim());
      console.log('✅ Login successful:', session);

      const user = await account.get();

      const res = await databases.listDocuments(DATABASE_ID, USERS_COLLECTION_ID, [
        Query.equal("userId", user.$id)
      ]);

      const userDoc = res.documents[0];

      if (!userDoc) {
        throw new Error("User data not found in database.");
      }

      if (userDoc.role !== 'citizen') {
        setError(`You're registered as "${userDoc.role}". This app is for Citizens only.`);
        await account.deleteSession('current');
        return;
      }

      Alert.alert('Success', 'Logged in successfully!');
      router.replace('/citizen/dashboard');
    } catch (err: any) {
      console.error('❌ Login error:', err);
      setError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  const goToSignup = () => {
    router.replace('/(auth)/signup');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        autoCapitalize="none"
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {error !== '' && <Text style={styles.errorText}>{error}</Text>}

      <Button title="Login" onPress={handleLogin} color="#007bff" />

      <TouchableOpacity onPress={goToSignup} style={styles.signupLink}>
        <Text style={styles.signupText}>Don't have an account? Sign up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 8,
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    marginBottom: 15,
    textAlign: 'center',
  },
  signupLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  signupText: {
    color: '#007bff',
    fontSize: 16,
  },
});
