#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecure.h>
#include <Adafruit_BMP280.h>
#include <SoftwareSerial.h>
#include <TinyGPS++.h>
#include <Wire.h>
#include <MPU6050.h>

// BMP280 setup
Adafruit_BMP280 bmp;
char iot_payload[0x100];
char mpu_data[0x40];
char gps_data[0x40];
char bmp_data[0x40];
MPU6050 mpu(0x69);

// GPS setup
static const int RXPin = 12; // D6 - GPS TX connected here
static const int TXPin = 14; // Not used
TinyGPSPlus gps;
SoftwareSerial gpsSerial(RXPin, TXPin);

// WiFi details
const char* ssid = "SmartJeet";
const char* password = "ProjectP";
const char* webAppUrl = "http://3.108.63.6:8000/wifi-data/";

WiFiClientSecure client;

// Function to send data to Server
void sendDataToScript();

// Function to get bmp data
void getBmpData();

// Function to get mpu data
void getMpuData();

// Function to get GPS data
void getGpsData();

void setup() {
  Serial.begin(115200);
  gpsSerial.begin(9600);
  delay(500);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  client.setInsecure();

  Serial.println("🌡️ BMP280 Sensor Init...");
  if (!bmp.begin(0x76)) {
    Serial.println("Could not find a valid BMP280 sensor, check wiring!");
    while (1);
  }
  Serial.println("BMP280 initialized.");
  Serial.println("GPS Ready...");
  Serial.println("MPU6050 Starting...");
  // Start I2C on custom pins: SDA = GPIO4 (D2), SCL = GPIO5 (D1)
  Wire.begin(4, 5);
  
  mpu.initialize();  // No parameters here

  if (!mpu.testConnection()) {
    Serial.println("MPU6050 connection failed! Check wiring and address.");
    while (1); // halt
  }

  Serial.println("MPU6050 connected successfully.");
}

void loop() {
  getBmpData();
  getMpuData();
  getGpsData();
  Serial.println("Data collected.");
  Serial.println(bmp_data);
  Serial.println(mpu_data);
  Serial.println(gps_data);

  sendDataToScript();
  delay(500);
}

void sendDataToScript() {
  HTTPClient http;
  http.begin(client, webAppUrl);
  http.addHeader("Content-Type", "application/json");

  sprintf(iot_payload, "{\"bmp\": %s, \"mpu\": %s, \"gps\": %s}", bmp_data, mpu_data, gps_data);

  Serial.printf("📤 Payload: %s\n", iot_payload);

  // Convert char array to String before POST
  int httpCode = http.POST(String(iot_payload));

  Serial.print("Response code: ");
  Serial.println(httpCode);

  http.end();
}

void getBmpData() {
  float alt = bmp.readAltitude(1013.25);
  float temp = bmp.readTemperature();
  float pres = bmp.readPressure() / 100.0F;

  snprintf(bmp_data, sizeof(bmp_data), "{\"alt\": %f, \"temp\": %f, \"pres\": %f}", alt, temp, pres);
}

void getMpuData() {
  int16_t ax, ay, az;
  int16_t gx, gy, gz;

  mpu.getAcceleration(&ax, &ay, &az);
  mpu.getRotation(&gx, &gy, &gz);

  snprintf(mpu_data, sizeof(mpu_data), "{\"ax\": %hd, \"ay\": %hd, \"az\": %hd, \"gx\": %hd, \"gy\": %hd, \"gz\": %hd}", ax, ay, az, gx, gy, gz);
}

void getGpsData() {
  if (gps.location.isValid()) {
    snprintf(gps_data, sizeof(gps_data), "{\"lat\": %f, \"lng\": %f, \"alt\": %f}", gps.location.lat(), gps.location.lng(), gps.altitude.meters());
  } else {
    snprintf(gps_data, sizeof(gps_data), "{\"lat\": null, \"lng\": null, \"alt\": null}");
  }
}
