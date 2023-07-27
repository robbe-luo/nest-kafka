import { Injectable, OnModuleInit, Logger, OnModuleDestroy } from '@nestjs/common';
import { DiscoveryService, MetadataScanner, ModuleRef } from '@nestjs/core';
import { KafkaMetadataAccessor } from './kafka-metadata.accessor';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { NO_QUEUE_FOUND, getMQToken } from './utils';
import { Consumer, EachMessagePayload } from 'kafkajs';

@Injectable()
export class KafkaExplorer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger('KafkaExplorer');

  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly discoveryService: DiscoveryService,
    private readonly metadataAccessor: KafkaMetadataAccessor,
    private readonly metadataScanner: MetadataScanner,
  ) {}

  async onModuleDestroy() {
    console.log('KafkaExplorer onModuleDestroy');
  }

  async onModuleInit() {
    this.explore();
  }

  private async explore() {
    const providers = this.discoveryService.getProviders().filter((wrapper: InstanceWrapper) => {
      return this.metadataAccessor.isQueueComponent(
        !wrapper.metatype || wrapper.inject ? wrapper.instance?.constructor : wrapper.metatype,
      );
    });

    const promises = [];

    providers.forEach((wrapper: InstanceWrapper) => {
      const { instance, metatype } = wrapper;
      const { groupId } = this.metadataAccessor.getQueueComponentMetadata(instance.constructor || metatype);

      const queueToken = getMQToken(groupId);
      const consumer = this.getQueue(queueToken, groupId);

      const allMethodNames = this.metadataScanner.getAllMethodNames(Object.getPrototypeOf(instance));
      const allSubMethod = allMethodNames.filter((methodName) =>
        this.metadataAccessor.isSubscribe(instance[methodName]),
      );

      allSubMethod.forEach((methodName) => {
        const metadata = this.metadataAccessor.getSubscribeMetadata(instance[methodName]);
        promises.push(this.handleSubscribe(instance, methodName, consumer, metadata));
      });
    });

    await Promise.all(promises);
  }

  getQueue(queueToken: string, queueName: string) {
    try {
      return this.moduleRef.get(queueToken, { strict: false });
    } catch (err) {
      this.logger.error(NO_QUEUE_FOUND(queueName));
      throw err;
    }
  }

  async handleSubscribe(instance: object, key: string, consumer: Consumer, options?: any) {
    await consumer.subscribe({ fromBeginning: true, ...options });
    await consumer.run({
      eachMessage: async (payload: EachMessagePayload) => {
        await instance[key].call(instance, payload);
      },
    });
  }
}
