import { Injectable, Type } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { KAFKA_MODULE_MESSAGE_QUEUE, KAFKA_MODULE_SUBSCRIBE } from './kafka.constants';

@Injectable()
export class KafkaMetadataAccessor {
  constructor(private readonly reflector: Reflector) {}

  isQueueComponent(target: Type<any> | Function): boolean {
    if (!target) {
      return false;
    }
    return !!this.reflector.get(KAFKA_MODULE_MESSAGE_QUEUE, target);
  }

  getQueueComponentMetadata(target: Type<any> | Function): any {
    return this.reflector.get(KAFKA_MODULE_MESSAGE_QUEUE, target);
  }

  isSubscribe(target: Type<any> | Function): boolean {
    if (!target) {
      return false;
    }
    return !!this.reflector.get(KAFKA_MODULE_SUBSCRIBE, target);
  }

  getSubscribeMetadata(target: Type<any> | Function) {
    return this.reflector.get(KAFKA_MODULE_SUBSCRIBE, target);
  }
}
