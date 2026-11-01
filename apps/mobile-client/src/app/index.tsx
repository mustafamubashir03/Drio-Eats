import { api } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query"
import { HealthCheckResponse } from "@drio-eats/types"
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  const { data: health, isLoading, error } = useQuery<HealthCheckResponse>({
    queryKey: ['health'],
    queryFn: () => api.get('/health').then((res) => res.data)
  })
  if (isLoading) return <View style={styles.container}><ActivityIndicator size="large" color="#0000ff" /></View>
  return (
    <View>
      <Text>Food Delivery</Text>
      <Text>Connection Text</Text>
      {isLoading && <ActivityIndicator size={"large"} color={"#0000ff"} />}
      {health && (
        <View>
          <Text>Status: {health.status}</Text>
          <Text>Timestamp: {health.timestamp}</Text>
        </View>
      )}
      {error && (
        <View>
          <Text>Error: {error.message}</Text>
        </View>
      )}

    </View>
  )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  }
});



