import { SetMetadata } from '@nestjs/common';
import { KAFKA_MODULE_SUBSCRIBE } from '../kafka.constants';
import { ConsumerSubscribeTopic, ConsumerSubscribeTopics } from 'kafkajs';

export function KafkaSubscribe(topic: string): MethodDecorator;
export function KafkaSubscribe(option: ConsumerSubscribeTopic): MethodDecorator;
export function KafkaSubscribe(option: ConsumerSubscribeTopics): MethodDecorator;
export function KafkaSubscribe(
  topicOrOptions: string | ConsumerSubscribeTopics | ConsumerSubscribeTopic,
): MethodDecorator {
  const options = typeof topicOrOptions === 'string' ? { topic: topicOrOptions } : topicOrOptions;
  return SetMetadata(KAFKA_MODULE_SUBSCRIBE, options);
}
