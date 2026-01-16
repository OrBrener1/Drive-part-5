import { View, Text, TextInput, Pressable } from 'react-native';
import { useState, useContext } from 'react';
import { router } from 'expo-router';
import styles from './LoginScreen.styles';
import { AuthContext } from '../../context/AuthContext';

export default function LoginScreen() {
  const { login, loading } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  async function handleLogin() {
    setError(null);

    const result = await login(email, password);

    if (!result.ok) {
      setError(result.message || 'Invalid email or password');
      return;
    }

    router.replace('/files');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <Pressable style={styles.button} onPress={handleLogin} disabled={loading}>
        <Text style={styles.buttonText}>
          {loading ? 'Logging in...' : 'Login'}
        </Text>
      </Pressable>
    </View>
  );
}
