import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import { account, databases } from '../../lib/appwrite';
import { ID } from 'appwrite';
import { useRouter } from 'expo-router';

const DATABASE_ID = '67f39692002509a5d8ee';
const USERS_COLLECTION_ID = '67f49bf80030cd63c1b4';

export default function SignUpScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSignup = async () => {
    try {
      setError('');
      await account.deleteSession('current').catch(() => {});

      // Step 1: Create user in Appwrite auth
      const user = await account.create(ID.unique(), email, password, name);
      console.log('✅ User created:', user);

      // Step 2: Create session
      const session = await account.createEmailPasswordSession(email, password);
      console.log('✅ Session created:', session);

      // Step 3: Store user info in DB with hardcoded citizen role
      await databases.createDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        ID.unique(),
        {
          userId: user.$id,
          email,
          name,
          role: 'citizen',
        }
      );

      Alert.alert('Success', 'Account created!');
      router.replace('/citizen/dashboard');
    } catch (err: any) {
      console.error('❌ Signup error:', err.message);
      setError(err.message || 'Signup failed. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      {error !== '' && <Text style={styles.error}>{error}</Text>}

      <Button title="Sign Up" onPress={handleSignup} color="#007bff" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
    flex: 1,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  error: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
});
