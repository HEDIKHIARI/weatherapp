declare module 'mqtt-browser'; 
// src/typings.d.ts
declare module '@angular/router' {
    export * from '@angular/router/index';
  }
  declare module 'ngx-mqtt' {
    import { MqttClient, IClientSubscribeOptions, IClientPublishOptions } from 'mqtt';
    export { MqttClient, IClientSubscribeOptions, IClientPublishOptions };
  }
