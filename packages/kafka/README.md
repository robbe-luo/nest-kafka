## NestJs Kafka Client

### Description

A NestJS - KafkaJs Wrapper, wrapping on [KafkaJS](https://github.com/tulios/kafkajs)

### Installation

```shell
npm install @robbe-luo/nest-kafka kafkajs --save
```

## Setup

Import and add the `KafkaModule` to the imports array of the module for which you would like to use Kafka.

#### Asynchronous Module Initialization

Register the `KafkaModule` synchronous with the `forRootAsync()` method:

```typescript
@Module({
  imports: [
    KafkaModule.forRootAsync({
      useFactory: async () => {
        return { clientId: 'client-id', brokers: ['localhost:9092'] };
      },
    }),
  ]
  ...
})
export class AppModule {}
```

#### Synchronous Module Initialization

Register the `KafkaModule` synchronous with the `forRoot()` method:

```typescript
@Module({
  imports: [
    KafkaModule.forRoot({ clientId: 'client-id', brokers: ['localhost:9092'] }),
  ]
  ...
})
export class AppModule {}
```

Full settings can be found: [https://kafka.js.org/docs/configuration](https://kafka.js.org/docs/configuration)

#### Producing Messages

Send messages back to kafka.

```js
import { Injectable } from '@nestjs/common';
import { KafkaService, InjectKafka } from '@robbe-luo/nest-kafka';

@Injectable()
export class TraceCollectorService {
  constructor(@InjectKafka() private readonly kafkaService: KafkaService) {}

  async post(message: string = 'Hello world') {
    const result = await this.kafkaService.sendMessage({
      topic: 'test-topic',
      messages: [{ value: message }],
    });
    return result;
  }
```

Full params can be found: [https://kafka.js.org/docs/producing](https://kafka.js.org/docs/producing)

#### Consuming Messages

Creating the consumer:

```js
@Module({
  imports: [KafkaModule.registryConsumer({ groupId: 'my-test-group-11' })],
  providers: [ConsumerService],
})
export class MessageQueueModule {}
```

Subscribing to some topics:

```typescript
@KafkaConsumer('test-group')
export class ConsumerService {
    @KafkaSubscribe('test-topic')
    async sub(payload: EachMessagePayload) {
        console.log(payload)
    }
}
```

TODO

* Tests
* registryConsumerAsync

PRs Welcome ❤️
