import { KafkaConsumer } from '../decorators/consumer.decorator';
import { KafkaSubscribe } from '../decorators/subscribe.decorator';
import { KAFKA_MODULE_MESSAGE_QUEUE, KAFKA_MODULE_SUBSCRIBE } from '../kafka.constants';

describe('Decorators', () => {
  describe('@InjectKafka()', () => {
    it.todo('should enhance class with expected constructor params metadata');
  });

  describe('@KafkaConsumer()', () => {
    it('should decorate the class with KAFKA_MODULE_MESSAGE_QUEUE', () => {
      @KafkaConsumer('test')
      class MyQueue {}
      expect(Reflect.hasMetadata(KAFKA_MODULE_MESSAGE_QUEUE, MyQueue)).toEqual(true);
    });

    it('should define the KAFKA_MODULE_MESSAGE_QUEUE metadata with the given options', () => {
      const opts = { groupId: 'test' };
      @KafkaConsumer(opts)
      class MyQueue {}
      expect(Reflect.getMetadata(KAFKA_MODULE_MESSAGE_QUEUE, MyQueue)).toEqual(opts);
    });
  });

  describe('@KafkaSubscribe()', () => {
    it('should decorate the method with KAFKA_MODULE_SUBSCRIBE', () => {
      class MyQueue {
        @KafkaSubscribe('test')
        prop() {}
      }
      const myQueueInstance = new MyQueue();
      expect(Reflect.hasMetadata(KAFKA_MODULE_SUBSCRIBE, myQueueInstance.prop)).toEqual(true);
    });

    it('should define the KAFKA_MODULE_SUBSCRIBE metadata with the given options', () => {
      const opts = { topic: 'test' };
      class MyQueue {
        @KafkaSubscribe(opts)
        prop() {}
      }
      const myQueueInstance = new MyQueue();
      expect(Reflect.getMetadata(KAFKA_MODULE_SUBSCRIBE, myQueueInstance.prop)).toEqual(opts);
    });

    it('should define the KAFKA_MODULE_SUBSCRIBE metadata with the given name', () => {
      const opts = { topics: ['test'] };
      class MyQueue {
        @KafkaSubscribe(opts)
        prop() {}
      }
      const myQueueInstance = new MyQueue();
      expect(Reflect.getMetadata(KAFKA_MODULE_SUBSCRIBE, myQueueInstance.prop)).toStrictEqual(opts);
    });
  });
});
