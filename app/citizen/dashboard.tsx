import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { databases, account } from '../../lib/appwrite';
import { Query } from 'appwrite';

const DATABASE_ID = '67f39692002509a5d8ee';
const COMPLAINTS_COLLECTION_ID = '67f4d5a4000c10888422';

type Complaint = {
  $id: string;
  title: string;
  description: string;
  status: string;
  mediaUrl?: string;
  userId: string;
  upvotes: number;
};

export default function CitizenDashboard() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComplaints = async () => {
    try {
      const userInfo = await account.get();
      const response = await databases.listDocuments(
        DATABASE_ID,
        COMPLAINTS_COLLECTION_ID,
        [
          Query.equal('status', 'pending'),
        ]
      );

      const mappedComplaints: Complaint[] = response.documents.map((doc) => ({
        $id: doc.$id,
        title: doc.title,
        description: doc.description,
        status: doc.status,
        mediaUrl: doc.mediaUrl,
        userId: doc.userId,
        upvotes: doc.upvotes || 0,
      }));

      // Sort by upvotes in descending order
      const sortedComplaints = mappedComplaints.sort(
        (a, b) => b.upvotes - a.upvotes
      );

      setComplaints(sortedComplaints);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Could not fetch complaints.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async (complaintId: string, currentVotes: number) => {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        COMPLAINTS_COLLECTION_ID,
        complaintId,
        { upvotes: currentVotes + 1 }
      );
      fetchComplaints(); // Refresh the list
    } catch (error) {
      console.error('Upvote failed:', error);
      Alert.alert('Error', 'Could not upvote complaint.');
    }
  };

  useEffect(() => {
    fetchComplaints();
    const interval = setInterval(fetchComplaints, 10000);
    return () => clearInterval(interval);
  }, []);

  const renderComplaint = ({ item }: { item: Complaint }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
      <Text style={styles.status}>Status: {item.status}</Text>
      <View style={styles.upvoteContainer}>
        <Text style={styles.upvoteCount}>Upvotes: {item.upvotes}</Text>
        <Text
          style={styles.upvoteButton}
          onPress={() => handleUpvote(item.$id, item.upvotes)}
        >
          👍 Upvote
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Pending Complaints</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#3182CE" style={{ marginTop: 30 }} />
      ) : complaints.length === 0 ? (
        <Text style={{ marginTop: 20, color: '#4A5568' }}>
          No pending complaints found.
        </Text>
      ) : (
        <FlatList
          data={complaints}
          keyExtractor={(item) => item.$id}
          renderItem={renderComplaint}
          contentContainerStyle={{ paddingTop: 20 }}
        />
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
  heading: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 30,
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 5,
  },
  description: {
    fontSize: 16,
    color: '#4A5568',
    marginBottom: 10,
  },
  status: {
    fontSize: 14,
    color: '#3182CE',
    fontWeight: '600',
  },
  upvoteContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  upvoteCount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2D3748',
  },
  upvoteButton: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3182CE',
  },
});
