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
  BullModuleAsyncOptions,
  BullRootModuleOptions,
  SharedBullAsyncConfiguration,
  SharedBullConfigurationFactory,
} from './interfaces';

@Module({})
export class KafkaModule {
  static forRoot(bullConfig: BullRootModuleOptions): DynamicModule;
  static forRoot(configKey: string, bullConfig: BullRootModuleOptions): DynamicModule;
  static forRoot(keyOrConfig: string | BullRootModuleOptions, bullConfig?: BullRootModuleOptions): DynamicModule {
    const [configKey, sharedBullConfig] =
      typeof keyOrConfig === 'string' ? [keyOrConfig, bullConfig] : [undefined, keyOrConfig];

    const sharedBullConfigProvider: Provider = {
      provide: getSharedConfigToken(configKey),
      useValue: sharedBullConfig,
    };

    const serviceProvider: Provider = {
      provide: getMQToken(KAFKA_MODULE_PROVIDER),
      useFactory: () => new KafkaService(sharedBullConfig),
    };

    return {
      global: true,
      module: KafkaModule,
      providers: [sharedBullConfigProvider, serviceProvider],
      exports: [sharedBullConfigProvider, serviceProvider],
    };
  }

  static forRootAsync(asyncBullConfig: SharedBullAsyncConfiguration): DynamicModule;
  static forRootAsync(keyOrAsyncConfig: string, asyncBullConfig: SharedBullAsyncConfiguration): DynamicModule;
  static forRootAsync(
    keyOrAsyncConfig: string | SharedBullAsyncConfiguration,
    asyncBullConfig?: SharedBullAsyncConfiguration,
  ): DynamicModule {
    const [configKey, asyncSharedBullConfig] =
      typeof keyOrAsyncConfig === 'string' ? [keyOrAsyncConfig, asyncBullConfig] : [undefined, keyOrAsyncConfig];

    const imports = this.getUniqImports([asyncSharedBullConfig]);
    const providers = this.createAsyncSharedConfigurationProviders(configKey, asyncSharedBullConfig);

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
    options: SharedBullAsyncConfiguration,
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncSharedConfigurationProvider(configKey, options)];
    }
    const useClass = options.useClass as Type<SharedBullConfigurationFactory>;
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
    options: SharedBullAsyncConfiguration,
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
      useFactory: async (optionsFactory: SharedBullConfigurationFactory) => optionsFactory.createSharedConfiguration(),
      inject,
    };
  }

  private static getUniqImports(options: Array<BullModuleAsyncOptions | SharedBullAsyncConfiguration>) {
    return (
      options
        .map((option) => option.imports)
        .reduce((acc, i) => acc.concat(i || []), [])
        .filter((v, i, a) => a.indexOf(v) === i) || []
    );
  }
}
