import { Inject } from '@nestjs/common';
import { getMQToken } from '../utils';
import { KAFKA_MODULE_PROVIDER } from '../kafka.constants';

export const InjectKafka = (): ParameterDecorator => Inject(getMQToken(KAFKA_MODULE_PROVIDER));
