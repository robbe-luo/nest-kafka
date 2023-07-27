import { Test, TestingModule } from '@nestjs/testing';
import { KafkaExplorer } from '../kafka.explorer';
import { DiscoveryModule } from '@nestjs/core';
import { KafkaMetadataAccessor } from '../kafka-metadata.accessor';

describe('KafkaExplorer', () => {
  let kafkaExplorer: KafkaExplorer;
  let moduleRef: TestingModule;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [DiscoveryModule],
      providers: [KafkaExplorer, KafkaMetadataAccessor],
    }).compile();

    kafkaExplorer = moduleRef.get(KafkaExplorer);
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  describe('handleProcessor', () => {
    it('should add the given function to the queue handlers', async () => {
      const option = { test: 1 };
      let runOptions;
      const instance = { handler: jest.fn() };
      const consumer = {
        subscribe: jest.fn(),
        run: jest.fn((options) => {
          runOptions = options;
        }),
      } as any;
      await kafkaExplorer.handleSubscribe(instance, 'handler', consumer, option);
      expect(consumer.subscribe).toHaveBeenCalledWith({ fromBeginning: true, ...option });
      await runOptions.eachMessage(option);
      expect(instance.handler).toHaveBeenCalledWith(option);
    });
  });
});
