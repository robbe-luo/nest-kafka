import type { DynamicModule, FactoryProvider, Provider, Type } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { KafkaService, createQueueProviders } from './kafka.service';
import { KAFKA_MODULE_PROVIDER } from './kafka.constants';
import { DiscoveryModule } from '@nestjs/core';
import { KafkaExplorer } from './kafka.explorer';
import { KafkaMetadataAccessor } from './kafka-metadata.accessor';
import { getMQToken, getSharedConfigToken } from './utils';
import { KafkaConfig } from 'kafkajs';
import {
  KafkaModuleAsyncOptions,
  KafkaRootModuleOptions,
  SharedKafkaAsyncConfiguration,
  SharedKafkaConfigurationFactory,
} from './interfaces';

@Module({})
export class KafkaModule {
  static forRoot(kafkaConfig: KafkaRootModuleOptions): DynamicModule;
  static forRoot(configKey: string, kafkaConfig: KafkaRootModuleOptions): DynamicModule;
  static forRoot(keyOrConfig: string | KafkaRootModuleOptions, kafkaConfig?: KafkaRootModuleOptions): DynamicModule {
    const [configKey, sharedKafkaConfig] =
      typeof keyOrConfig === 'string' ? [keyOrConfig, kafkaConfig] : [undefined, keyOrConfig];

    const sharedKafkaConfigProvider: Provider = {
      provide: getSharedConfigToken(configKey),
      useValue: sharedKafkaConfig,
    };

    const serviceProvider: Provider = {
      provide: getMQToken(KAFKA_MODULE_PROVIDER),
      useFactory: () => new KafkaService(sharedKafkaConfig),
    };

    return {
      global: true,
      module: KafkaModule,
      providers: [sharedKafkaConfigProvider, serviceProvider],
      exports: [sharedKafkaConfigProvider, serviceProvider],
    };
  }

  static forRootAsync(asyncKafkaConfig: SharedKafkaAsyncConfiguration): DynamicModule;
  static forRootAsync(keyOrAsyncConfig: string, asyncKafkaConfig: SharedKafkaAsyncConfiguration): DynamicModule;
  static forRootAsync(
    keyOrAsyncConfig: string | SharedKafkaAsyncConfiguration,
    asyncKafkaConfig?: SharedKafkaAsyncConfiguration,
  ): DynamicModule {
    const [configKey, asyncSharedKafkaConfig] =
      typeof keyOrAsyncConfig === 'string' ? [keyOrAsyncConfig, asyncKafkaConfig] : [undefined, keyOrAsyncConfig];

    const imports = this.getUniqImports([asyncSharedKafkaConfig]);
    const providers = this.createAsyncSharedConfigurationProviders(configKey, asyncSharedKafkaConfig);

    const serviceProvider: Provider = {
      provide: getMQToken(KAFKA_MODULE_PROVIDER),
      useFactory: (config) => new KafkaService(config),
      inject: providers.map((p: FactoryProvider) => p.provide).filter(Boolean),
    };

    return {
      global: true,
      imports,
      module: KafkaModule,
      providers: [...providers, serviceProvider],
      exports: [serviceProvider, ...providers],
    };
  }

  static registryConsumer(...options: RegistryConsumerOptions[]): DynamicModule {
    const providers = createQueueProviders([].concat(options));
    return {
      module: KafkaModule,
      imports: [KafkaModule.registerCore()],
      providers: [...providers],
      exports: providers,
    };
  }

  private static registerCore() {
    return {
      global: true,
      module: KafkaModule,
      imports: [DiscoveryModule],
      providers: [KafkaExplorer, KafkaMetadataAccessor],
    };
  }

  private static createAsyncSharedConfigurationProviders(
    configKey: string | undefined,
    options: SharedKafkaAsyncConfiguration,
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncSharedConfigurationProvider(configKey, options)];
    }
    const useClass = options.useClass as Type<SharedKafkaConfigurationFactory>;
    return [
      this.createAsyncSharedConfigurationProvider(configKey, options),
      {
        provide: useClass,
        useClass,
      },
    ];
  }

  private static createAsyncSharedConfigurationProvider(
    configKey: string,
    options: SharedKafkaAsyncConfiguration,
  ): Provider<KafkaConfig> {
    if (options.useFactory) {
      return {
        provide: getSharedConfigToken(configKey),
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    const inject = [options.useClass || options.useExisting];

    return {
      provide: getSharedConfigToken(),
      useFactory: async (optionsFactory: SharedKafkaConfigurationFactory) => optionsFactory.createSharedConfiguration(),
      inject,
    };
  }

  private static getUniqImports(options: Array<KafkaModuleAsyncOptions | SharedKafkaAsyncConfiguration>) {
    return (
      options
        .map((option) => option.imports)
        .reduce((acc, i) => acc.concat(i || []), [])
        .filter((v, i, a) => a.indexOf(v) === i) || []
    );
  }
}
