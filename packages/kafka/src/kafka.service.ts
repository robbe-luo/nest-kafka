import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
  Provider,
  Scope,
} from '@nestjs/common';
import {
  Consumer,
  ConsumerConfig,
  Kafka,
  KafkaConfig,
  Producer,
  ProducerRecord,
} from 'kafkajs';
import { KAFKA_MODULE_PROVIDER } from './kafka.constants';
import { getMQToken } from './utils';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private logger = new Logger(KafkaService.name);
  public kafka: Kafka;
  private consumerMapping = new Set<Consumer>();
  private producer: Producer;

  constructor(private options: KafkaConfig) {
    this.kafka = new Kafka(options);
    this.producer = this.kafka.producer();
  }

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  async sendMessage(payload: ProducerRecord) {
    await this.producer.connect();
    const metadata = await this.producer
      .send(payload)
      .catch(e => this.logger.error(e.message, e));
    await this.producer.disconnect();
    return metadata;
  }

  async createConsumer(config: ConsumerConfig) {
    const consumer = this.kafka.consumer(config);
    await consumer.connect();
    this.consumerMapping.add(consumer);
    return consumer;
  }

  private async connect() {
    await this.producer.connect();
  }

  private async disconnect() {
    await Promise.all([
      Array.from(this.consumerMapping).map(consumer => consumer.disconnect()),
    ]);
    await this.producer.disconnect();
  }
}

export function createQueueProviders(
  options: RegistryConsumerOptions[]
): Provider[] {
  return options.map(option => {
    return {
      provide: getMQToken(option.groupId),
      useFactory(kafkaService: KafkaService) {
        return kafkaService.createConsumer(option);
      },
      inject: [getMQToken(KAFKA_MODULE_PROVIDER)],
    };
  });
}
