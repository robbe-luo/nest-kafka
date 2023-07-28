import { FactoryProvider, ModuleMetadata, Type } from '@nestjs/common';
import { KafkaConfig } from 'kafkajs';

export interface SharedKafkaConfigurationFactory {
  createSharedConfiguration(): Promise<KafkaConfig> | KafkaConfig;
}

export interface KafkaModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useClass?: Type<KafkaConfig>;

  useExisting?: Type<KafkaConfig>;

  useFactory: (...args: any[]) => Promise<KafkaConfig> | KafkaConfig;

  inject?: FactoryProvider['inject'];
}

export interface SharedKafkaAsyncConfiguration extends Pick<ModuleMetadata, 'imports'> {
  /**
   * Existing Provider to be used.
   */
  useExisting?: Type<SharedKafkaConfigurationFactory>;

  /**
   * Type (class name) of provider (instance to be registered and injected).
   */
  useClass?: Type<SharedKafkaConfigurationFactory>;

  /**
   * Factory function that returns an instance of the provider to be injected.
   */
  useFactory?: (...args: any[]) => Promise<KafkaConfig> | KafkaConfig;

  /**
   * Optional list of providers to be injected into the context of the Factory function.
   */
  inject?: FactoryProvider['inject'];
}

export interface KafkaRootModuleOptions extends KafkaConfig {}
