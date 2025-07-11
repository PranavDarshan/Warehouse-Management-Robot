/*
 * you need to select the board as NodeMCU 1.0(ESP12E Module). for this syou can watch our other tutorials in our channel. 
 * you can also take the help from this link. and also select the COM port to uplaod the program. 
 */
// Fill-in information from your Blynk Template here
#define BLYNK_TEMPLATE_ID ""
#define BLYNK_DEVICE_NAME "IoTCar"
#define BLYNK_TEMPLATE_NAME "IoTCar"
#define BLYNK_FIRMWARE_VERSION        "0.1.0"
#define BLYNK_PRINT Serial
#define USE_NODE_MCU_BOARD

#include "BlynkEdgent.h"
#include <EEPROM.h>       // Add this include
#include<Servo.h>
#define servo1 D2//
#define servo2 D5//
#define servo3 D1//
#define servo4 D5

#define ENA D6//
#define IN1 D7
#define IN2 D8
#define IN3 D3
#define IN4 D0
#define ENB D4


Servo mservo1, mservo2, mservo3, mservo4;
int x = 50;
int y = 50;
int Speed=255;
int speed_Coeff = 1;
BLYNK_WRITE(V0)
{
  int s0 = param.asInt(); 
  mservo1.write(s0);
 
}
BLYNK_WRITE(V1)
{
  int s0 = param.asInt(); 
  mservo2.write(s0);
 
}
BLYNK_WRITE(V2)
{
  int s0 = param.asInt(); 
  mservo3.write(s0);
 
}
BLYNK_WRITE(V3)
{
  int s0 = param.asInt(); 
  mservo4.write(s0);
 
}
// Get the joystick values
BLYNK_WRITE(V4) {
  x = param[0].asInt();
}
// Get the joystick values
BLYNK_WRITE(V5) {
  y = param[0].asInt();
}
//Get the slider values


void smartcar() {
  if (y > 70) {
    carForward();
    Serial.println("carForward");
  } else if (y < 30) {
    carBackward();
    Serial.println("carBackward");
  } else if (x < 30) {
    carLeft();
    Serial.println("carLeft");
  } else if (x > 70) {
    carRight();
    Serial.println("carRight");
  } else if (x < 70 && x > 30 && y < 70 && y > 30) {
    carStop();
    Serial.println("carstop");
  }
}


void carForward() {
 analogWrite(ENA, Speed);
  analogWrite(ENB, Speed);
  digitalWrite(IN1, HIGH);
  digitalWrite(IN2, LOW);
  digitalWrite(IN3, LOW);
  digitalWrite(IN4, HIGH);
 

}
void carBackward() {
 analogWrite(ENA, Speed);
  analogWrite(ENB, Speed);
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, HIGH);
  digitalWrite(IN3, HIGH);
  digitalWrite(IN4, LOW);
 

}

void carLeft() {
  analogWrite(ENA, 0);
  analogWrite(ENB, Speed);
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, HIGH);
  digitalWrite(IN3, LOW);
  digitalWrite(IN4, HIGH);
  
}
void carRight() {
  analogWrite(ENA, Speed);
  analogWrite(ENB, 0);
  digitalWrite(IN1, HIGH);
  digitalWrite(IN2, LOW);
  digitalWrite(IN3, HIGH);
  digitalWrite(IN4, LOW);
}
void carStop() {
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, LOW);
  digitalWrite(IN3, LOW);
  digitalWrite(IN4, LOW);
}

void resetWiFiCredentials() {
  Serial.println("Resetting WiFi credentials...");
  
  // Clear WiFi credentials
  WiFi.disconnect(true);
  WiFi.mode(WIFI_OFF);
  
  // Clear EEPROM configuration
  EEPROM.begin(512);
  for (int i = 0; i < 512; i++) {
    EEPROM.write(i, 0);
  }
  EEPROM.commit();
  EEPROM.end();
  
  // Erase WiFi config from flash
  ESP.eraseConfig();
  
  // Clear any saved networks
  WiFi.mode(WIFI_STA);
  WiFi.persistent(false);
  WiFi.disconnect(true);
  
  Serial.println("WiFi credentials reset complete");
  delay(1000);
}

void setup()
{
  Serial.begin(9600);
  
  // Reset WiFi credentials on every power-on
  resetWiFiCredentials();
  
  mservo1.attach(servo1);  // Fixed: was mservo4
  mservo2.attach(servo2); 
  mservo3.attach(servo3); 
  mservo4.attach(servo4);

  pinMode(ENA, OUTPUT);
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT);
  pinMode(IN4, OUTPUT);
  pinMode(ENB, OUTPUT);
  
  BlynkEdgent.begin();
  delay(1000); 
}

void loop() 
{
  BlynkEdgent.run();
  smartcar();
  
}
