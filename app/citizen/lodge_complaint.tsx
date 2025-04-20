import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity, Image, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { ID } from 'appwrite';
import { databases, storage, account } from '../../lib/appwrite';
import { useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system';

const DATABASE_ID = '67f39692002509a5d8ee';
const COMPLAINTS_COLLECTION_ID = '67f4d5a4000c10888422';
const BUCKET_ID = '67f61b2800000babdc19';
const PROJECT_ID = '67f36b4800144098ad88'; // Replace if different

export default function LodgeComplaintScreen() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('road'); // default
  const [location, setLocation] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required.');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setLocation(`${loc.coords.latitude},${loc.coords.longitude}`);
    })();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],  // Specify the media type as an array
      allowsEditing: true,
      quality: 1,
    });
  
    if (!result.canceled && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };


  const uploadImageToAppwrite = async (): Promise<string> => {
    if (!imageUri) return '';
  
    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();
  
      const file = new File([blob], `complaint_${Date.now()}.jpg`, {
        type: 'image/jpeg',
      });
  
      const uploadedFile = await storage.createFile(BUCKET_ID, ID.unique(), file);
      const mediaUrl = `https://cloud.appwrite.io/v1/storage/buckets/${BUCKET_ID}/files/${uploadedFile.$id}/view?project=${PROJECT_ID}`;
      return mediaUrl;
    } catch (err) {
      console.error('Error uploading file:', err);
      throw err;
    }
  };

  const handleSubmit = async () => {
    try {
      if (!title || !description || !category || !location) {
        Alert.alert('Validation Error', 'Please fill all fields.');
        return;
      }

      setUploading(true);

      const mediaUrl = imageUri ? await uploadImageToAppwrite() : '';
      const userInfo = await account.get();

      await databases.createDocument(DATABASE_ID, COMPLAINTS_COLLECTION_ID, ID.unique(), {
        userId: userInfo.$id,
        title,
        description,
        category,
        location,
        mediaUrl : "http://blabla.com",
        status: 'pending', // enum value
        submittedAt : new Date().toISOString(),
        assignedOfficial: '', // optional string
      });

      Alert.alert('Success', 'Complaint submitted successfully!');
      setTitle('');
      setDescription('');
      setCategory('road');
      setLocation('');
      setImageUri(null);

      router.replace('/citizen/dashboard'); // ✅ Navigate after success
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', err.message || 'Something went wrong.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Lodge a Complaint</Text>

      <TextInput placeholder="Title" style={styles.input} value={title} onChangeText={setTitle} />
      <TextInput
        placeholder="Description"
        style={[styles.input, { height: 80 }]}
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <Text style={styles.label}>Category</Text>
      <View style={styles.dropdown}>
        {['road', 'pothole', 'noise', 'streetlight', 'garbage', 'water', 'crime', 'other'].map((cat) => (
          <TouchableOpacity key={cat} onPress={() => setCategory(cat)} style={styles.dropdownItem}>
            <Text style={category === cat ? styles.selected : styles.unselected}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        placeholder="Location"
        style={styles.input}
        value={location}
        onChangeText={setLocation}
      />

      <Button title="Pick an Image" onPress={pickImage} color="#007bff" />
      {imageUri ? <Image source={{ uri: imageUri }} style={styles.imagePreview} /> : null}

      <View style={{ marginTop: 20 }}>
        <Button
          title={uploading ? 'Submitting...' : 'Submit Complaint'}
          onPress={handleSubmit}
          color="#28a745"
          disabled={uploading}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F9FAFB', // Lighter background for a softer look
    flexGrow: 1, // Ensures the ScrollView takes full height
  },
  heading: {
    fontSize: 24,
    fontWeight: '700', // Slightly bolder for emphasis
    marginBottom: 30,
    color: '#333', // Darker text color for better contrast
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    height: 50,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  dropdown: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  dropdownItem: {
    backgroundColor: '#E2E8F0', // Soft background color for options
    borderRadius: 30,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginRight: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  selected: {
    color: '#007bff', // Blue color for the selected category
    fontWeight: '600',
  },
  unselected: {
    color: '#555',
    fontWeight: '500',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    marginTop: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f5f5f5',
    resizeMode: 'cover',
  },
});
