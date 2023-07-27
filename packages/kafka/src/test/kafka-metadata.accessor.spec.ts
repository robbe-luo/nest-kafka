import { Reflector } from '@nestjs/core';
import { KafkaMetadataAccessor } from '../kafka-metadata.accessor';
import { KafkaConsumer } from '../decorators/consumer.decorator';
import { KafkaSubscribe } from '../decorators/subscribe.decorator';

describe('KafkaMetadataAccessor', () => {
  let metadataAccessor: KafkaMetadataAccessor;
  beforeAll(() => {
    metadataAccessor = new KafkaMetadataAccessor(new Reflector());
  });

  describe('isQueueComponent', () => {
    it('should return true if the given class is a queue component', () => {
      @KafkaConsumer('my-test')
      class MyQueue {}
      expect(metadataAccessor.isQueueComponent(MyQueue)).toBe(true);
    });

    it('should return false if the given class is not queue component', () => {
      class TestClass {}
      expect(metadataAccessor.isQueueComponent(TestClass)).toBe(false);
    });
  });

  describe('getQueueComponentMetadata', () => {
    it('should return the given consumer component metadata', () => {
      const opts = { groupId: 'test' };
      @KafkaConsumer(opts)
      class MyQueue {
        processor() {}
      }
      expect(metadataAccessor.getQueueComponentMetadata(MyQueue)).toStrictEqual(opts);
    });
  });

  describe('isProcessor', () => {
    it('should return true if the given class property is a queue processor', () => {
      class MyQueue {
        @KafkaSubscribe('test')
        subscribe() {}
      }
      const myQueueInstance = new MyQueue();
      expect(metadataAccessor.isSubscribe(myQueueInstance.subscribe)).toBe(true);
    });

    it('should return false if the given class property is not a queue processor', () => {
      class MyQueue {
        sub() {}
      }
      const myQueueInstance = new MyQueue();
      expect(metadataAccessor.isSubscribe(myQueueInstance.sub)).toBe(false);
    });
  });

  describe('getProcessMetadata', () => {
    it('should return the given queue processor metadata', () => {
      const opts = { topic: 'test' };
      class MyQueue {
        @KafkaSubscribe(opts)
        subscribe() {}
      }
      const myQueueInstance = new MyQueue();
      expect(metadataAccessor.getSubscribeMetadata(myQueueInstance.subscribe)).toBe(opts);
    });
  });
});
