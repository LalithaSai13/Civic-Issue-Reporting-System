import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, Button, Animated } from 'react-native';
import { databases, account } from '../../lib/appwrite';
import { useRouter } from 'expo-router';
import { Query } from 'appwrite';

interface Complaint {
  $id: string;
  title: string;
  description: string;
  status: string;
  mediaUrl: string;
  userId: string;
}

const DATABASE_ID = '67f39692002509a5d8ee';
const COMPLAINTS_COLLECTION_ID = '67f4d5a4000c10888422';

export default function MyComplaintsScreen() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalScale] = useState(new Animated.Value(0)); // Start scale animation from 0
  const [modalOpacity] = useState(new Animated.Value(0)); // Start opacity animation from 0
  const router = useRouter();

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const userInfo = await account.get();
        const userComplaints = await databases.listDocuments(
          DATABASE_ID,
          COMPLAINTS_COLLECTION_ID,
          [Query.equal('userId', userInfo.$id)]
        );

        const mappedComplaints = userComplaints.documents.map((doc) => ({
          $id: doc.$id,
          title: doc.title,
          description: doc.description,
          status: doc.status,
          mediaUrl: doc.mediaUrl,
          userId: doc.userId,
        }));

        setComplaints(mappedComplaints);
      } catch (error) {
        console.error(error);
        Alert.alert('Error', 'Could not fetch complaints.');
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  const handleViewDetails = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setIsModalVisible(true);
    // Animate the modal appearing (scale up and fade in)
    Animated.timing(modalScale, {
      toValue: 1, // Scale to full size
      duration: 300,
      useNativeDriver: true,
    }).start();
    Animated.timing(modalOpacity, {
      toValue: 1, // Fade in
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleCloseModal = () => {
    // Animate the modal disappearing (scale down and fade out)
    Animated.timing(modalScale, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
    Animated.timing(modalOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
    // After animation finishes, hide the modal
    setTimeout(() => {
      setIsModalVisible(false);
    }, 300); // Match the duration of the animation
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>My Complaints</Text>
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <FlatList
          data={complaints}
          renderItem={({ item }) => (
            <View style={styles.complaintCard}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
              <Text style={styles.status}>Status: {item.status}</Text>
              <TouchableOpacity
                style={styles.viewButton}
                onPress={() => handleViewDetails(item)}
              >
                <Text style={styles.viewButtonText}>View Details</Text>
              </TouchableOpacity>
            </View>
          )}
          keyExtractor={(item) => item.$id}
        />
      )}

      {/* Modal for Complaint Details */}
      <Modal
        visible={isModalVisible}
        animationType="none" // Disable default modal animation
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalBackground}>
          <Animated.View
            style={[
              styles.modalContainer,
              {
                transform: [{ scale: modalScale }], // Animate scale
                opacity: modalOpacity, // Animate opacity
              },
            ]}
          >
            {selectedComplaint && (
              <>
                <Text style={styles.modalTitle}>{selectedComplaint.title}</Text>
                <Text style={styles.modalDescription}>{selectedComplaint.description}</Text>
                <Text>Status: {selectedComplaint.status}</Text>
                <Text>Media URL: {selectedComplaint.mediaUrl}</Text>
              </>
            )}
            <Button title="Close" onPress={handleCloseModal} />
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F4F7FC',
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 30,
  },
  complaintCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#555',
    marginVertical: 5,
  },
  status: {
    fontSize: 14,
    color: '#888',
    marginVertical: 5,
  },
  viewButton: {
    backgroundColor: '#3182CE',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
    marginTop: 10,
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)', // Semi-transparent background
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 16,
    marginBottom: 10,
  },
});
