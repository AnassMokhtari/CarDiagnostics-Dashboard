#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>

// Configuration - UPDATE THESE WITH YOUR WIFI CREDENTIALS
#define WIFI_SSID "anass"         // Replace with your WiFi SSID
#define WIFI_PASSWORD "00000000" // Replace with your WiFi password
#define SERVER_URL "http://192.168.137.96:5000//api/update" // Your Flask server URL

#define DHTPIN 13        // Digital pin connected to DHT11
#define DHTTYPE DHT11   // DHT 11 sensor type

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);  // Start Serial communication for debugging
  dht.begin();           // Initialize the DHT11 sensor

  // Connect to WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.println("Connecting to WiFi...");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    // Read temperature and humidity from DHT11
    float humidity = dht.readHumidity();
    float temperature = dht.readTemperature(); // Temperature in Celsius

    // Check if readings are valid
    if (isnan(humidity) || isnan(temperature)) {
      Serial.println("Failed to read from DHT sensor!");
      delay(2000);
      return;
    }

    // Print readings to Serial Monitor
    Serial.print("Temperature: ");
    Serial.print(temperature);
    Serial.print("°C, Humidity: ");
    Serial.print(humidity);
    Serial.println("%");

    // Prepare JSON payload to send to the server
    String payload = "{\"temperature\":" + String(temperature) + 
                     ",\"humidity\":" + String(humidity) + "}";

    // Send data to the Flask server
    HTTPClient http;
    http.begin(SERVER_URL);
    http.addHeader("Content-Type", "application/json");

    int httpResponseCode = http.POST(payload);

    // Check the response from the server
    if (httpResponseCode > 0) {
      Serial.print("HTTP Response code: ");
      Serial.println(httpResponseCode);
      String response = http.getString();
      Serial.println(response);
    } else {
      Serial.print("Error code: ");
      Serial.println(httpResponseCode);
    }

    http.end(); // End the HTTP connection
  } else {
    Serial.println("WiFi Disconnected");
  }

  // Wait 5 seconds before the next reading
  delay(5000);
}