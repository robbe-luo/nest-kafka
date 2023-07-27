import { SetMetadata } from '@nestjs/common';
import { SCOPE_OPTIONS_METADATA } from '@nestjs/common/constants';
import { KAFKA_MODULE_MESSAGE_QUEUE } from '../kafka.constants';
import { ConsumerConfig } from 'kafkajs';

export function KafkaConsumer(groupId: string): ClassDecorator;
export function KafkaConsumer(config: ConsumerConfig): ClassDecorator;
export function KafkaConsumer(groupIdOrConfig: string | ConsumerConfig): ClassDecorator {
  const options =
    groupIdOrConfig && typeof groupIdOrConfig === 'object' ? groupIdOrConfig : { groupId: groupIdOrConfig };

  return (target: Function) => {
    SetMetadata(SCOPE_OPTIONS_METADATA, options)(target);
    SetMetadata(KAFKA_MODULE_MESSAGE_QUEUE, options)(target);
  };
}
