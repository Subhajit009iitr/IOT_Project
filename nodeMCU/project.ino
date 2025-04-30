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
char mpu_data[0x80];
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
// const char* webAppUrl = "http://3.108.63.6:8000/wifi-data";
const char* webAppUrl = " http://metal-lions-build.loca.lt/wifi-data";
const char* testUrl = " http://metal-lions-build.loca.lt/getdata";

WiFiClient client;
HTTPClient http;

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
  Serial.printf("%s\n", bmp_data);
  Serial.printf("%s\n", gps_data);
  Serial.printf("%s\n", mpu_data);

  sendDataToScript();
  delay(1000);
}

void sendDataToScript() {

  http.begin(client, webAppUrl);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("bypass-tunnel-reminder", "true");
  sprintf(iot_payload, "{\"bmp\": %s, \"mpu\": %s, \"gps\": %s}", bmp_data, mpu_data, gps_data);
  int httpCode = http.POST(iot_payload);
  Serial.printf("code : %d\n", httpCode);
  if (httpCode > 0) {
    Serial.print("Server response: ");
    Serial.println(httpCode);
  } else {
    Serial.print("HTTP Post failed: ");
    Serial.println(httpCode);
    http.begin(client, testUrl);
    httpCode = http.GET();
    Serial.println(httpCode);
    // Serial.print("GET response code: ");
    // Serial.println(httpCode);

    // if (httpCode > 0) {
    //   String payload = http.getString();  // Fetch GET response content
    //   Serial.println("GET response body:");
    //   Serial.println(payload);
    // } else {
    //   Serial.println("GET request failed too.");
    // }
  }

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