import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, Alert, TouchableOpacity } from 'react-native';
import { account } from '../../lib/appwrite'; // Appwrite SDK for user authentication
import { useRouter } from 'expo-router';
import { format } from 'date-fns'; // Import date-fns for date formatting

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await account.get(); // Fetch logged-in user data
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user data:', error);
        Alert.alert('Error', 'Could not fetch user data.');
      }
    };

    fetchUserData();
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      await account.deleteSession('current'); // Log out the current session
      router.push('/login'); // Redirect to login screen after logout
    } catch (error) {
      console.error('Error logging out:', error);
      Alert.alert('Error', 'Could not log out.');
    }
  };

  // Format creation date (assuming user.$createdAt is the date)
  const formattedCreatedAt = user ? format(new Date(user.$createdAt), 'MMMM dd, yyyy') : '';

  return (
    <View style={styles.container}>
      {user ? (
        <>
          {/* Profile Header */}
          <View style={styles.header}>
            <Text style={styles.heading}>Profile</Text>
            <Text style={styles.subHeading}>Manage your account and settings</Text>
          </View>

          {/* Profile Card */}
          <View style={styles.card}>
            {/* User Info */}
            <View style={styles.profileInfo}>
              <Text style={styles.infoTitle}>Name</Text>
              <Text style={styles.infoText}>{user.name}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.infoTitle}>Email</Text>
              <Text style={styles.infoText}>{user.email}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.infoTitle}>Account Created</Text>
              <Text style={styles.infoText}>{formattedCreatedAt}</Text>
            </View>
          </View>

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text style={styles.loadingText}>Loading...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FC',
    padding: 20,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    fontSize: 34,
    fontWeight: '700',
    color: '#2D3748',
  },
  subHeading: {
    fontSize: 16,
    color: '#4A5568',
    marginTop: 8,
    fontWeight: '400',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 25,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 30,
  },
  profileInfo: {
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A5568',
  },
  infoText: {
    fontSize: 18,
    color: '#2D3748',
    marginTop: 8,
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: '#3182CE',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    elevation: 2, // Adding a shadow effect for the button
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '400',
    color: '#2D3748',
    marginTop: 20,
  },
});
